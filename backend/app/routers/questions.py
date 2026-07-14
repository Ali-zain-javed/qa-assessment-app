from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.question import Question
from app.schemas.question import QuestionAdminOut, QuestionCreate, QuestionOut

router = APIRouter(tags=["questions"])


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Question).all()


@router.get("/admin/questions", response_model=list[QuestionAdminOut])
def admin_list_questions(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Question).all()


@router.post("/admin/questions", response_model=QuestionAdminOut, status_code=status.HTTP_201_CREATED)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/admin/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
