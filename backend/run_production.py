#!/usr/bin/env python
"""
Production entry point for bundled backend.
This runs without reload and handles bundled paths correctly.
"""
import os
import sys
import asyncio
from pathlib import Path

# When bundled with PyInstaller, sys._MEIPASS points to the temp extraction dir
# We need to find the actual app directory (where data files are)
if getattr(sys, 'frozen', False):
    # Running in a PyInstaller bundle
    # The executable is in a temp dir, but data files are in _MEIPASS
    bundle_dir = Path(sys._MEIPASS)
    # The app code is also in _MEIPASS
    os.chdir(bundle_dir)
    # Add bundle dir to Python path
    sys.path.insert(0, str(bundle_dir))
else:
    # Running normally
    bundle_dir = Path(__file__).parent.absolute()

# For database, we need a writable location
# Use APPDATA on Windows, ~/.local/share on Linux/Mac
if sys.platform == "win32":
    data_dir = Path(os.environ.get("APPDATA", Path.home())) / "MalamjabaAgency"
else:
    data_dir = Path.home() / ".local" / "share" / "MalamjabaAgency"

data_dir.mkdir(parents=True, exist_ok=True)

# Set database URL to use the data directory
db_path = data_dir / "dev.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_path}"

# Set backup directory
backup_dir = data_dir / "backups"
backup_dir.mkdir(parents=True, exist_ok=True)
os.environ["BACKUP_DIR"] = str(backup_dir)

# Set uploads directory
uploads_dir = data_dir / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

# Set allowed origins for Electron (file:// protocol)
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173,file://"

# Set app env to production
os.environ["APP_ENV"] = "production"

# Set secret key (in production, this should come from a secure config)
if "SECRET_KEY" not in os.environ:
    os.environ["SECRET_KEY"] = "malamjaba-production-secret-key-change-me"

print(f"[Backend] Starting Malamjaba Recruiting Agency API")
print(f"[Backend] Data directory: {data_dir}")
print(f"[Backend] Database: {db_path}")
print(f"[Backend] Backups: {backup_dir}")

# Check if database exists (first run detection)
db_exists = db_path.exists()

async def initialize_database():
    """Initialize database tables and seed data on first run."""
    from app.database import init_db, async_session, Base
    from app.models import ALL_MODELS  # noqa: F401
    from app.models.user import User, Role, Permission, UserRole
    from app.core.security import hash_password
    from app.core.permissions import ROLE_PERMISSIONS
    from sqlalchemy import select
    
    # Create tables
    await init_db()
    print("[Backend] Database tables created/verified")
    
    # Seed data if database was just created
    if not db_exists:
        print("[Backend] First run detected - seeding initial data...")
        async with async_session() as db:
            # Check if admin already exists (in case of partial initialization)
            existing = await db.execute(
                select(User).where(User.username == "admin")
            )
            if existing.scalar_one_or_none():
                print("[Backend] Admin user already exists, skipping seed")
                return
            
            # Create roles
            roles = {}
            for role_name in ["super_admin", "admin", "accountant", "manager", "staff"]:
                role = Role(name=role_name, description=role_name.replace("_", " ").title())
                db.add(role)
                await db.flush()
                roles[role_name] = role
                
                for perm in ROLE_PERMISSIONS.get(role_name, []):
                    db.add(Permission(role_id=role.id, permission=perm))
            
            # Create admin user
            admin = User(
                username="admin",
                password_hash=hash_password("admin123"),
                full_name="Administrator",
                is_superadmin=True,
            )
            db.add(admin)
            await db.flush()
            db.add(UserRole(user_id=admin.id, role_id=roles["super_admin"].id))
            
            # Create accountant user
            accountant = User(
                username="accountant",
                password_hash=hash_password("accountant123"),
                full_name="Accountant User",
            )
            db.add(accountant)
            await db.flush()
            db.add(UserRole(user_id=accountant.id, role_id=roles["accountant"].id))
            
            await db.commit()
            print("[Backend] Seed data created successfully!")
            print("[Backend] Admin login: admin / admin123")
            print("[Backend] Accountant login: accountant / accountant123")

if __name__ == "__main__":
    # Initialize database and seed on first run
    asyncio.run(initialize_database())
    
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",  # Only localhost for security
        port=8000,
        reload=False,
        log_level="info",
    )