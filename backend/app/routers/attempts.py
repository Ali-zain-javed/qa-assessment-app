from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.attempt import Attempt
from app.models.question import Question
from app.models.user import User
from app.schemas.attempt import AttemptResult, AttemptSubmit

router = APIRouter(tags=["attempts"])


@router.post("/attempts/submit", response_model=AttemptResult)
def submit_attempt(
    payload: AttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    questions = {q.id: q for q in db.query(Question).all()}
    score = 0
    answers_log = {}
    for answer in payload.answers:
        question = questions.get(answer.question_id)
        if not question:
            continue
        is_correct = sorted(answer.selected_options) == sorted(question.correct_options)
        if is_correct:
            score += 1
        answers_log[str(answer.question_id)] = {
            "selected": answer.selected_options,
            "correct": is_correct,
        }

    attempt = Attempt(
        user_id=current_user.id,
        score=score,
        total=len(questions),
        answers=answers_log,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
