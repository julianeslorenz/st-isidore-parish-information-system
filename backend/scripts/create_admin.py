import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db import Base, SessionLocal, engine
from app import models


def main() -> None:
    email = input("Administrator email: ").strip().lower()
    name = input("Administrator name: ").strip()
    password = getpass.getpass("Administrator password (12+ characters): ")
    if len(password) < 12:
        raise SystemExit("Use a password of at least 12 characters.")
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(models.User.id).where(models.User.email == email)):
            raise SystemExit("That email is already registered.")
        db.add(models.User(email=email, name=name, hashed_password=hash_password(password), role="Admin"))
        db.commit()
    print(f"Administrator account created for {email}.")


if __name__ == "__main__":
    main()
