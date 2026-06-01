import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup system path to import modules from parent folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from database.core import DATABASE_URL
    from database.models import User
    from auth.security import get_password_hash
except ImportError as e:
    print(f"[ERROR] Could not import backend modules: {str(e)}")
    sys.exit(1)

def main():
    print(f"Connecting to database to upsert default testing user...")
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
    except Exception as e:
        print(f"[ERROR] Connection to database failed: {str(e)}")
        sys.exit(1)

    email = "nika@test.com"
    password = "nika123"

    try:
        # Search for existing user
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password = get_password_hash(password)
            db.commit()
            print(f"[SUCCESS] User '{email}' already exists. Password reset to '{password}'.")
        else:
            new_user = User(
                email=email,
                password=get_password_hash(password)
            )
            db.add(new_user)
            db.commit()
            print(f"[SUCCESS] Default user '{email}' created with password '{password}'.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Execution failed: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
