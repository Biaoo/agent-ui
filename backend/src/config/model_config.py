"""
Simplified Model configuration for OpenAI Chat models.

This module provides a streamlined model configuration specifically for OpenAI chat models
with essential parameters: api_key, base_url, and model_name.
"""

import os
from typing import Optional
from dataclasses import dataclass, field
from pydantic import BaseModel, Field
from .base import environment

print(f"Loading ModelConfig in {environment} environment")


@dataclass
class ModelConfig:
    """
    Simplified OpenAI Chat model configuration.

    This configuration class contains only the essential parameters needed
    for OpenAI chat models: api_key, base_url, and model_name.
    """

    api_key: Optional[str] = field(default=None)
    base_url: Optional[str] = field(default=None)
    model_name: str = field(default="gpt-4o-mini")

    def __post_init__(self):
        """Post-initialization to set default values from environment and validate."""
        if self.api_key is None:
            self.api_key = os.getenv("OPENAI_API_KEY")
        if self.base_url is None:
            self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

        # Validate model name
        if not self.model_name or not self.model_name.strip():
            raise ValueError("model_name cannot be empty")
        self.model_name = self.model_name.strip()

        # Validate API key
        if self.api_key is not None and not self.api_key.strip():
            raise ValueError("api_key cannot be empty string")

    def to_dict(self) -> dict:
        """Convert configuration to dictionary."""
        return {
            "api_key": self.api_key,
            "base_url": self.base_url,
            "model_name": self.model_name,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ModelConfig":
        """Create configuration from dictionary."""
        return cls(
            api_key=data.get("api_key"),
            base_url=data.get("base_url"),
            model_name=data.get("model_name", "gpt-4o-mini"),
        )

    @classmethod
    def from_env(cls, model_name: str = "gpt-4o-mini") -> "ModelConfig":
        """Create configuration from environment variables."""
        return cls(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL"),
            model_name=model_name,
        )

    def is_valid(self) -> bool:
        """Check if configuration is valid for use."""
        return (
            self.model_name is not None
            and self.model_name.strip() != ""
            and (self.api_key is not None or self.base_url is not None)
        )


class ModelConfigRequest(BaseModel):
    """
    Pydantic model for ModelConfig API requests.

    This model is used for API endpoints that accept model configuration.
    """

    api_key: Optional[str] = Field(None, description="OpenAI API key")
    base_url: Optional[str] = Field(None, description="OpenAI API base URL")
    model_name: str = Field("gpt-4o-mini", description="OpenAI model name")

    class Config:
        """Pydantic configuration."""

        schema_extra = {
            "example": {
                "api_key": "sk-...",
                "base_url": "https://api.openai.com/v1",
                "model_name": "gpt-4o-mini",
            }
        }

    def to_model_config(self) -> ModelConfig:
        """Convert to ModelConfig instance."""
        return ModelConfig(
            api_key=self.api_key, base_url=self.base_url, model_name=self.model_name
        )


qwen_model_config = ModelConfig().from_dict(
    {
        "api_key": os.getenv("DASHSCOPE_API_KEY"),
        "base_url": os.getenv("DASHSCOPE_BASE_URL"),
        "model_name": "qwen-plus",
    }
)

qwen_max_config = ModelConfig().from_dict(
    {
        "api_key": os.getenv("DASHSCOPE_API_KEY"),
        "base_url": os.getenv("DASHSCOPE_BASE_URL"),
        "model_name": "qwen3-max",
    }
)

print("Qwen Model Config:", qwen_model_config.to_dict())
