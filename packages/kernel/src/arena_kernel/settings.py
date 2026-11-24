"""Base settings class using pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class BaseArenaSettings(BaseSettings):
    """Base settings class for all Agentic Arena services."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
