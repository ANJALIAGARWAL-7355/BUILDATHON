import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application configuration."""
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./razorgrowth.db")
    
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Razorpay
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    USE_MOCK_PAYMENTS = os.getenv("USE_MOCK_PAYMENTS", "true").lower() == "true"
    
    # App
    APP_NAME = "RazorGrowth AI"
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # AI Model
    AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")  # "gemini", "openai", or "mock"
    
settings = Settings()
