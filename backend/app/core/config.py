from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openalex_email: str | None = Field(default=None, alias="OPENALEX_EMAIL")
    crossref_mailto: str | None = Field(default=None, alias="CROSSREF_MAILTO")
    source_timeout_seconds: int = Field(default=15, alias="SOURCE_TIMEOUT_SECONDS")
    openrouter_api_key: str | None = Field(default=None, alias="OPENROUTER_API_KEY")
    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")
    cache_ttl_seconds: int = Field(default=1800, alias="CACHE_TTL_SECONDS")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
