from pydantic import BaseModel, Field, field_validator

from app.models.question import QuestionType


class QuestionCreate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    options: list[str] = Field(min_length=2, max_length=8)
    correct_options: list[int] = Field(min_length=1)
    question_type: QuestionType = QuestionType.single

    @field_validator("correct_options")
    @classmethod
    def validate_correct_options(cls, v: list[int], info) -> list[int]:
        options = info.data.get("options") or []
        if options and any(i < 0 or i >= len(options) for i in v):
            raise ValueError("correct_options indices must reference existing options")
        return v


class QuestionOut(BaseModel):
    id: int
    text: str
    options: list[str]
    question_type: QuestionType

    class Config:
        from_attributes = True


class QuestionAdminOut(QuestionOut):
    correct_options: list[int]
