import asyncio
from app.database import async_session, init_db
from app.models.user import User, Role, Permission
from app.core.security import hash_password
from app.core.permissions import ROLE_PERMISSIONS


async def seed():
    await init_db()
    async with async_session() as db:
        existing = await db.execute(
            __import__("sqlalchemy").select(User).where(User.username == "admin")
        )
        if existing.scalar_one_or_none():
            print("Seed data already exists. Skipping.")
            return

        roles = {}
        for role_name in ["super_admin", "admin", "accountant", "manager", "staff"]:
            role = Role(name=role_name, description=role_name.replace("_", " ").title())
            db.add(role)
            await db.flush()
            roles[role_name] = role

            for perm in ROLE_PERMISSIONS.get(role_name, []):
                db.add(Permission(role_id=role.id, permission=perm))

        admin = User(
            username="admin",
            password_hash=hash_password("admin123"),
            full_name="Administrator",
            is_superadmin=True,
        )
        db.add(admin)
        await db.flush()

        from app.models.user import UserRole
        db.add(UserRole(user_id=admin.id, role_id=roles["super_admin"].id))

        accountant = User(
            username="accountant",
            password_hash=hash_password("accountant123"),
            full_name="Accountant User",
        )
        db.add(accountant)
        await db.flush()
        db.add(UserRole(user_id=accountant.id, role_id=roles["accountant"].id))

        await db.commit()
        print("Seed data created successfully!")
        print("Admin login: admin / admin123")
        print("Accountant login: accountant / accountant123")


if __name__ == "__main__":
    asyncio.run(seed())
