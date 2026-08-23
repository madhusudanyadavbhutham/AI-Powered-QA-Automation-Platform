from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.services.browser import discover_application

router = APIRouter(prefix="/projects/{project_id}/applications", tags=["Discovery"])

@router.post("/{application_id}/discover")
def discover(project_id: int, application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id, Application.project_id == project_id).first()
    if not application:
        raise HTTPException(404, "Application not found")
    try:
        return {"application_id": application.id, "application_name": application.name, "result": discover_application(application.url)}
    except Exception as exc:
        raise HTTPException(500, f"Application discovery failed: {exc}")
