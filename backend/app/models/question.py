import enum

from sqlalchemy import JSON, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class QuestionType(str, enum.Enum):
    single = "single"
    multiple = "multiple"


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(1000), nullable=False)
    options: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    correct_options: Mapped[list[int]] = mapped_column(JSON, nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType), default=QuestionType.single, nullable=False
    )
