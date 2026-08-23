from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.models.test_case import TestCase
from app.schemas import TestCaseCreate, TestCaseResponse

router = APIRouter(prefix="/projects/{project_id}/applications/{application_id}/test-cases", tags=["Test Cases"])

def get_application_or_404(project_id, application_id, db):
    obj = db.query(Application).filter(Application.id == application_id, Application.project_id == project_id).first()
    if not obj:
        raise HTTPException(404, "Application not found")
    return obj

@router.post("/", response_model=TestCaseResponse, status_code=201)
def create_test_case(project_id: int, application_id: int, data: TestCaseCreate, db: Session = Depends(get_db)):
    get_application_or_404(project_id, application_id, db)
    obj = TestCase(application_id=application_id, name=data.name, description=data.description, priority=data.priority)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("/", response_model=list[TestCaseResponse])
def get_test_cases(project_id: int, application_id: int, db: Session = Depends(get_db)):
    get_application_or_404(project_id, application_id, db)
    return db.query(TestCase).filter(TestCase.application_id == application_id).all()

@router.get("/{test_case_id}", response_model=TestCaseResponse)
def get_test_case(project_id: int, application_id: int, test_case_id: int, db: Session = Depends(get_db)):
    get_application_or_404(project_id, application_id, db)
    obj = db.query(TestCase).filter(TestCase.id == test_case_id, TestCase.application_id == application_id).first()
    if not obj:
        raise HTTPException(404, "Test case not found")
    return obj
