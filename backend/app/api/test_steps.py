from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.test_case import TestCase
from app.models.test_step import TestStep
from app.schemas import TestStepCreate, TestStepResponse

router = APIRouter(prefix="/projects/{project_id}/applications/{application_id}/test-cases/{test_case_id}/steps", tags=["Test Steps"])

def get_test_case(project_id, application_id, test_case_id, db):
    obj = db.scalar(select(TestCase).where(TestCase.id == test_case_id, TestCase.application_id == application_id))
    if not obj:
        raise HTTPException(404, "Test case not found")
    return obj

@router.post("/", response_model=TestStepResponse, status_code=status.HTTP_201_CREATED)
def create_test_step(project_id: int, application_id: int, test_case_id: int, data: TestStepCreate, db: Session = Depends(get_db)):
    get_test_case(project_id, application_id, test_case_id, db)
    obj = TestStep(    test_case_id=test_case_id,    step_number=data.step_number,    action=data.action,    description=data.description,    target=data.target,    value=data.value,    expected_result=data.expected_result,)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("/", response_model=list[TestStepResponse])
def get_test_steps(project_id: int, application_id: int, test_case_id: int, db: Session = Depends(get_db)):
    get_test_case(project_id, application_id, test_case_id, db)
    return db.scalars(select(TestStep).where(TestStep.test_case_id == test_case_id).order_by(TestStep.step_number)).all()
