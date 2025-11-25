import dotenv
import os

environment = os.getenv("ENVIRONMENT", "development")

dotenv.load_dotenv(".env")
