from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.video import Video
from app.models.scene import Scene
from app.schemas.video import VideoCreate, VideoResponse, GenerateScriptRequest, GenerateScriptResponse
from app.services.script_generator import ScriptGenerator
from app.workers.tasks import generate_video_task

router = APIRouter()


@router.get("/", response_model=list[VideoResponse])
async def list_videos(
    project_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Video)
    if project_id is not None:
        query = query.where(Video.project_id == project_id)
    query = query.offset(skip).limit(limit).order_by(Video.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=VideoResponse, status_code=201)
async def create_video(data: VideoCreate, db: AsyncSession = Depends(get_db)):
    video = Video(project_id=data.project_id, title=data.title)
    db.add(video)
    await db.commit()
    await db.refresh(video)
    return video


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video non trovato")
    return video


@router.post("/{video_id}/generate-script", response_model=GenerateScriptResponse)
async def generate_script(video_id: int, req: GenerateScriptRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video non trovato")

    generator = ScriptGenerator()
    script_data = await generator.generate(topic=req.topic, duration_sec=req.duration_seconds, style=req.style)

    video.script = script_data["full_script"]
    video.status = "script_ready"

    for i, scene_data in enumerate(script_data["scenes"]):
        scene = Scene(
            video_id=video_id,
            order=i,
            content=scene_data["content"],
            image_prompt=scene_data.get("image_prompt", ""),
            subtitle_text=scene_data.get("subtitle_text", scene_data["content"]),
            duration=scene_data.get("duration", 5.0),
        )
        db.add(scene)

    await db.commit()
    await db.refresh(video)

    return GenerateScriptResponse(
        video_id=video.id,
        script=video.script,
        scenes=script_data["scenes"],
    )


@router.post("/{video_id}/render", response_model=VideoResponse)
async def render_video(video_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video non trovato")

    video.status = "rendering"
    await db.commit()

    generate_video_task.delay(video_id)

    await db.refresh(video)
    return video


@router.delete("/{video_id}", status_code=204)
async def delete_video(video_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video non trovato")
    await db.delete(video)
    await db.commit()
