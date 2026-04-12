from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    FRONTEND_URL: str = "http://localhost:5173"

    FIREBASE_SERVICE_ACCOUNT_JSON: str | None = None

    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str | None = None

    EMAIL_SENDER: str | None = None
    EMAIL_PASSWORD: str | None = None
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587


settings = Settings()
