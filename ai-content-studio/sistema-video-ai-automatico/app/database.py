from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


if settings.database_url.startswith("postgresql"):
    db_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    engine = create_async_engine(
        db_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        echo=False,
    )
else:
    engine = create_async_engine(settings.database_url, echo=False)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_session() -> AsyncSession:
    return async_session()


async def init_db():
    async with engine.begin() as conn:
        from app.models import project, video, scene
        await conn.run_sync(Base.metadata.create_all)
