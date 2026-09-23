import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://jobs:jobs@localhost:5432/jobs")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me")
SCAN_INTERVAL_SECONDS = int(os.getenv("SCAN_INTERVAL_SECONDS", "3600"))
SCAN_BATCH_SIZE = int(os.getenv("SCAN_BATCH_SIZE", "50"))
SCAN_CONCURRENCY = int(os.getenv("SCAN_CONCURRENCY", "10"))
