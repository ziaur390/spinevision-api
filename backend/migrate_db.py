import os
import sys
from sqlalchemy import create_engine, text

# Get database URL from environment or fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spinevision.db")

print(f"Connecting to: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Adding hospital_name...")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN hospital_name VARCHAR(255);"))
    except Exception as e:
        print(f"Skipped hospital_name: {e}")
        
    print("Adding medical_license...")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN medical_license VARCHAR(255);"))
    except Exception as e:
        print(f"Skipped medical_license: {e}")
        
    print("Adding is_approved...")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_approved VARCHAR(5) DEFAULT 'false' NOT NULL;"))
    except Exception as e:
        print(f"Skipped is_approved: {e}")

    # For safety, approve all existing users so the admin doesn't get locked out!
    try:
        conn.execute(text("UPDATE users SET is_approved = 'true';"))
    except Exception as e:
        print(f"Failed to auto-approve existing users: {e}")
        
    conn.commit()

print("Migration complete!")
