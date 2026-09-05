from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.api.router import api_router
from app.database import init_db

settings = get_settings()

app = FastAPI(
    title="Malamjaba Recruiting Agency API",
    description="Backend API for Malamjaba Recruiting Agency Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"message": "Malamjaba Recruiting Agency API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
