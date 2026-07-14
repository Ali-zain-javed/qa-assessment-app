from datetime import datetime

from pydantic import BaseModel


class AnswerIn(BaseModel):
    question_id: int
    selected_options: list[int]


class AttemptSubmit(BaseModel):
    answers: list[AnswerIn]


class AttemptResult(BaseModel):
    score: int
    total: int
    created_at: datetime

    class Config:
        from_attributes = True
