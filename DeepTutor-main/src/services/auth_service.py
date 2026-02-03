import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from src.logging import get_logger

logger = get_logger("AuthService")

# Secret key settings
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        # Calculate project root relative to this file: src/services/auth_service.py -> src/services -> src -> root
        self.project_root = Path(__file__).parent.parent.parent
        self.users_file = self.project_root / "data" / "users.json"
        self._ensure_users_file()

    def _ensure_users_file(self):
        try:
            if not self.users_file.exists():
                logger.info(f"Users file not found at {self.users_file}, creating default admin...")
                self.users_file.parent.mkdir(parents=True, exist_ok=True)
                # Create default admin user
                default_user = {
                    "username": "admin",
                    "hashed_password": pwd_context.hash("admin"),
                    "email": "admin@example.com",
                    "full_name": "Administrator",
                    "role": "admin",
                    "disabled": False
                }
                self.save_users([default_user])
        except Exception as e:
            logger.error(f"Failed to ensure users file: {e}")

    def load_users(self) -> list[dict]:
        if not self.users_file.exists():
            return []
        try:
            with open(self.users_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load users: {e}")
            return []

    def save_users(self, users: list[dict]):
        try:
            self.users_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.users_file, "w", encoding="utf-8") as f:
                json.dump(users, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save users: {e}")

    def get_user(self, username: str) -> Optional[dict]:
        users = self.load_users()
        for user in users:
            if user["username"] == username:
                return user
        return None

    def verify_password(self, plain_password, hashed_password):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def authenticate_user(self, username, password):
        user = self.get_user(username)
        if not user:
            return False
        if not self.verify_password(password, user.get("hashed_password")):
            return False
        return user

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def register_user(self, user_data: dict) -> bool:
        if self.get_user(user_data["username"]):
            return False
        
        users = self.load_users()
        user_data["hashed_password"] = self.get_password_hash(user_data["password"])
        if "password" in user_data:
            del user_data["password"] # Don't save plain password
        
        # Set defaults
        user_data.setdefault("role", "user")
        user_data.setdefault("disabled", False)
        
        users.append(user_data)
        self.save_users(users)
        return True
