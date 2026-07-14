from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.question import Question, QuestionType
from app.models.user import User, UserRole


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@example.com").first():
            db.add(
                User(
                    email="admin@example.com",
                    hashed_password=hash_password("Admin123!"),
                    full_name="Admin User",
                    role=UserRole.admin,
                )
            )
        if not db.query(User).filter(User.email == "user@example.com").first():
            db.add(
                User(
                    email="user@example.com",
                    hashed_password=hash_password("User123!"),
                    full_name="Test User",
                    role=UserRole.user,
                )
            )
        db.commit()

        if db.query(Question).count() == 0:
            db.add_all(
                [
                    Question(
                        text="What does HTML stand for?",
                        options=[
                            "Hyper Trainer Marking Language",
                            "Hyper Text Markup Language",
                            "Hyper Text Marketing Language",
                            "Hyper Text Markup Leveler",
                        ],
                        correct_options=[1],
                        question_type=QuestionType.single,
                    ),
                    Question(
                        text="Which of the following are JavaScript frameworks/libraries?",
                        options=["React", "Django", "Vue", "Flask"],
                        correct_options=[0, 2],
                        question_type=QuestionType.multiple,
                    ),
                    Question(
                        text="Which HTTP method is idempotent?",
                        options=["POST", "PUT", "PATCH", "CONNECT"],
                        correct_options=[1],
                        question_type=QuestionType.single,
                    ),
                    Question(
                        text="Which of these are valid Python data types?",
                        options=["list", "dict", "tuple", "array"],
                        correct_options=[0, 1, 2],
                        question_type=QuestionType.multiple,
                    ),
                ]
            )
        db.commit()
        print("Seed complete. admin@example.com / Admin123!  |  user@example.com / User123!")
    finally:
        db.close()


if __name__ == "__main__":
    run()
