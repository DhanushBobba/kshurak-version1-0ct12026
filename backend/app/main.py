from fastapi import FastAPI

from app.core.database import engine, Base

from app.routers.face import router as face_router


app = FastAPI(
    title="Kshurak API",
    version="1.0.0"
)


app.include_router(
    face_router
)


@app.get("/")
async def root():

    return {
        "application":"Kshurak Backend",
        "status":"running"
    }


@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)