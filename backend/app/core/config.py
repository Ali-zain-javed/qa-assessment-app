from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://fastapi_user:password123@localhost:5432/fastapi_db"
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8
    cors_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
