from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.research import router as research_router

app = FastAPI(title="ScholAR API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(research_router)
