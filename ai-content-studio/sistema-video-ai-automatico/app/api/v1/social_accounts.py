from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from typing import Optional

from app.database import get_db
from app.models.social_account import SocialAccount
from app.models.video import Video
from app.schemas.social_account import (
    SocialAccountResponse,
    SocialAuthUrlResponse,
    SocialPublishRequest,
    SocialPublishResponse,
)
from app.services.social_service import (
    get_provider,
    create_oauth_state,
    consume_oauth_state,
    VALID_PLATFORMS,
    PROVIDERS,
)

router = APIRouter()


@router.get("/social/accounts", response_model=list[SocialAccountResponse])
async def list_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SocialAccount).order_by(SocialAccount.platform, SocialAccount.created_at.desc())
    )
    return result.scalars().all()


@router.get("/social/auth-url/{platform}", response_model=SocialAuthUrlResponse)
async def get_auth_url(platform: str, request: Request):
    if platform not in VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Piattaforma '{platform}' non supportata. Usa: {', '.join(sorted(VALID_PLATFORMS))}")
    provider = PROVIDERS.get(platform)
    if not provider or not provider.client_id:
        raise HTTPException(status_code=400, detail=f"OAuth per {platform} non configurato. Imposta le credenziali nelle variabili d'ambiente.")
    state = create_oauth_state()
    url = provider.get_auth_url(state)
    return SocialAuthUrlResponse(url=url, state=state)


@router.get("/social/callback/{platform}")
async def oauth_callback(
    platform: str,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    if platform not in VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Piattaforma '{platform}' non supportata")
    if error:
        logger.warning(f"OAuth error for {platform}: {error}")
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=f"/social?error={error}")
    if not code:
        raise HTTPException(status_code=400, detail="Codice di autorizzazione mancante")
    if state and not consume_oauth_state(state):
        logger.warning(f"Invalid or expired OAuth state for {platform}")

    provider = get_provider(platform)
    try:
        token_data = await provider.exchange_code(code)
    except Exception as e:
        logger.error(f"Token exchange failed for {platform}: {e}")
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=f"/social?error=token_exchange_failed")

    access_token = token_data.get("access_token", "")
    refresh_token = token_data.get("refresh_token", "")
    expires_in = token_data.get("expires_in", 3600)

    import datetime
    token_expiry = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in) if expires_in else None

    user_info = {"id": "", "name": ""}
    try:
        user_info = await provider.get_user_info(access_token)
    except Exception as e:
        logger.warning(f"Could not get user info for {platform}: {e}")

    result = await db.execute(
        select(SocialAccount).where(
            SocialAccount.platform == platform,
            SocialAccount.platform_user_id == user_info.get("id", ""),
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.access_token = access_token
        existing.refresh_token = refresh_token
        existing.token_expiry = token_expiry
        existing.connected = True
        existing.platform_username = user_info.get("name", existing.platform_username)
        existing.scopes = provider.scopes
    else:
        account = SocialAccount(
            platform=platform,
            platform_user_id=user_info.get("id", ""),
            platform_username=user_info.get("name", ""),
            access_token=access_token,
            refresh_token=refresh_token,
            token_expiry=token_expiry,
            scopes=provider.scopes,
            connected=True,
        )
        db.add(account)

    await db.commit()

    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"/social?connected={platform}")


@router.delete("/social/accounts/{account_id}", status_code=204)
async def disconnect_account(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SocialAccount).where(SocialAccount.id == account_id))
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account social non trovato")
    await db.delete(account)
    await db.commit()
    return None


@router.post("/social/refresh/{account_id}", response_model=SocialAccountResponse)
async def refresh_token(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SocialAccount).where(SocialAccount.id == account_id))
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account social non trovato")
    if not account.refresh_token:
        raise HTTPException(status_code=400, detail="Nessun refresh token disponibile. Ricollega l'account.")
    provider = get_provider(account.platform)
    try:
        token_data = await provider.refresh_access_token(account.refresh_token)
        account.access_token = token_data.get("access_token", account.access_token)
        new_refresh = token_data.get("refresh_token")
        if new_refresh:
            account.refresh_token = new_refresh
        expires_in = token_data.get("expires_in", 3600)
        import datetime
        account.token_expiry = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
        account.connected = True
        await db.commit()
        await db.refresh(account)
    except Exception as e:
        account.connected = False
        await db.commit()
        raise HTTPException(status_code=400, detail=f"Refresh token fallito: {e}")
    return account


@router.get("/social/videos/{platform}", response_model=list[dict])
async def list_platform_videos(
    platform: str,
    account_id: int = Query(...),
    max_results: int = Query(default=10, le=50),
    db: AsyncSession = Depends(get_db),
):
    if platform not in VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Piattaforma '{platform}' non supportata")
    result = await db.execute(
        select(SocialAccount).where(SocialAccount.id == account_id, SocialAccount.platform == platform)
    )
    account = result.scalar_one_or_none()
    if not account or not account.connected:
        raise HTTPException(status_code=404, detail="Account non trovato o non connesso")
    provider = get_provider(platform)
    access_token = account.access_token
    if account.token_expiry:
        import datetime
        if datetime.datetime.utcnow() >= account.token_expiry:
            try:
                token_data = await provider.refresh_access_token(account.refresh_token)
                access_token = token_data.get("access_token", access_token)
                account.access_token = access_token
                await db.commit()
            except:
                raise HTTPException(status_code=400, detail="Token scaduto. Ricollega l'account.")

    try:
        if platform == "youtube":
            videos = await provider.list_videos(access_token, max_results)
        elif platform == "instagram":
            videos = await provider.list_media(access_token, max_results)
        elif platform == "tiktok":
            videos = []
        else:
            videos = []
        return videos
    except Exception as e:
        logger.error(f"Failed to list {platform} videos: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/social/publish", response_model=SocialPublishResponse)
async def publish_video(
    req: SocialPublishRequest,
    db: AsyncSession = Depends(get_db),
):
    account_result = await db.execute(
        select(SocialAccount).where(SocialAccount.id == req.account_id)
    )
    account = account_result.scalar_one_or_none()
    if not account or not account.connected:
        raise HTTPException(status_code=404, detail="Account social non trovato o non connesso")

    video_result = await db.execute(select(Video).where(Video.id == req.video_id))
    video = video_result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video non trovato")
    if not video.output_url:
        raise HTTPException(status_code=400, detail="Video non ha un URL di output. Genera prima il video.")

    provider = get_provider(account.platform)
    access_token = account.access_token
    if account.token_expiry:
        import datetime
        if datetime.datetime.utcnow() >= account.token_expiry:
            try:
                token_data = await provider.refresh_access_token(account.refresh_token)
                access_token = token_data.get("access_token", access_token)
                account.access_token = access_token
                await db.commit()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Token scaduto: {e}")

    title = req.title or video.title
    description = req.description or f"Generato con AI Content Studio\n\n{video.title}"

    try:
        result = await provider.upload_video(access_token, video.output_url, title, description)
        return SocialPublishResponse(
            success=True,
            platform_post_id=result.get("platform_post_id"),
            url=result.get("url"),
        )
    except Exception as e:
        logger.error(f"Publish to {account.platform} failed: {e}")
        return SocialPublishResponse(success=False, error=str(e))
