from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    FRONTEND_URL: str = "http://localhost:5173"

    FIREBASE_SERVICE_ACCOUNT_JSON: str | None = None

    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str | None = None

    RESEND_API_KEY: str | None = None
    EMAIL_FROM: str | None = "onboarding@resend.dev"


settings = Settings()
