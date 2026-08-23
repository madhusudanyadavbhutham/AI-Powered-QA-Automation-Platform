from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.models.project import Project
from app.schemas import ApplicationCreate, ApplicationResponse

router = APIRouter(prefix="/projects/{project_id}/applications", tags=["Applications"])

@router.post("/", response_model=ApplicationResponse, status_code=201)
def create_application(project_id: int, data: ApplicationCreate, db: Session = Depends(get_db)):
    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(404, "Project not found")
    obj = Application(project_id=project_id, name=data.name, url=data.url)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("/", response_model=list[ApplicationResponse])
def get_applications(project_id: int, db: Session = Depends(get_db)):
    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(404, "Project not found")
    return db.query(Application).filter(Application.project_id == project_id).all()

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(project_id: int, application_id: int, db: Session = Depends(get_db)):
    obj = db.query(Application).filter(Application.id == application_id, Application.project_id == project_id).first()
    if not obj:
        raise HTTPException(404, "Application not found")
    return obj
