from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.research import router as research_router
from app.api.routes.research_v2 import router as research_v2_router
from app.services.embeddings import warmup_embeddings_model

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


@app.on_event("startup")
def startup_warmup() -> None:
    warmup_embeddings_model()


app.include_router(research_router)
app.include_router(research_v2_router)
