from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import Application
from app.models.test_case import TestCase
from app.models.test_run import TestRun, TestRunStep
from app.models.test_step import TestStep
from app.services.browser import execute_steps
from app.schemas import TestRunResponse, TestRunStepResponse


router = APIRouter(
    prefix="/projects/{project_id}/applications/{application_id}/test-cases/{test_case_id}/runs",
    tags=["Test Runs"],
)


def get_case(
    project_id: int,
    application_id: int,
    test_case_id: int,
    db: Session,
):
    case = (
        db.query(TestCase)
        .join(
            Application,
            TestCase.application_id == Application.id,
        )
        .filter(
            TestCase.id == test_case_id,
            Application.id == application_id,
            Application.project_id == project_id,
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Test case not found",
        )

    return case


@router.post(
    "/",
    response_model=TestRunResponse,
    status_code=201,
)
def run_test_case(
    project_id: int,
    application_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------
    # VALIDATE TEST CASE
    # --------------------------------

    get_case(
        project_id,
        application_id,
        test_case_id,
        db,
    )

    # --------------------------------
    # GET APPLICATION
    # --------------------------------

    app = (
        db.query(Application)
        .filter(
            Application.id == application_id
        )
        .first()
    )

    if not app:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    # --------------------------------
    # GET TEST STEPS
    # --------------------------------

    steps = (
        db.query(TestStep)
        .filter(
            TestStep.test_case_id == test_case_id
        )
        .order_by(
            TestStep.step_number
        )
        .all()
    )

    if not steps:
        raise HTTPException(
            status_code=400,
            detail="Test case has no steps",
        )

    # --------------------------------
    # CREATE TEST RUN
    # --------------------------------

    run_started_at = datetime.utcnow()

    run = TestRun(
        test_case_id=test_case_id,
        status="running",
        started_at=run_started_at,
    )

    db.add(run)
    db.commit()
    db.refresh(run)

    # --------------------------------
    # EXECUTE TEST
    # --------------------------------

    try:

        results = execute_steps(
            app.url,
            steps,
            run.id,
        )

    except Exception as exc:

        run.status = "failed"
        run.error_message = str(exc)
        run.finished_at = datetime.utcnow()

        db.commit()
        db.refresh(run)

        return run

    # --------------------------------
    # SAVE STEP RESULTS
    # --------------------------------

    failed = False
    first_error_message = None

    for result in results:

        row = TestRunStep(
            test_run_id=run.id,
            test_step_id=result["step_id"],
            status=result["status"],
            message=result["message"],
            started_at=result["started_at"],
            finished_at=result["finished_at"],
            duration_ms=result["duration_ms"],
            screenshot_path=result["screenshot_path"],
        )

        db.add(row)

        # --------------------------------
        # CAPTURE FIRST FAILURE
        # --------------------------------

        if result["status"] == "failed":

            failed = True

            first_error_message = (
                f"Step {result['step_id']} failed: "
                f"{result['message']}"
            )

    # --------------------------------
    # DETERMINE RUN STATUS
    # --------------------------------

    if failed or len(results) < len(steps):

        run.status = "failed"

        if first_error_message:
            run.error_message = first_error_message
        else:
            run.error_message = (
                "Test execution stopped before "
                "all steps were completed."
            )

    else:

        run.status = "passed"
        run.error_message = None

    # --------------------------------
    # FINISH RUN
    # --------------------------------

    run.finished_at = datetime.utcnow()

    db.commit()
    db.refresh(run)

    return run


@router.get(
    "/",
    response_model=list[TestRunResponse],
)
def get_runs(
    project_id: int,
    application_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
):
    get_case(
        project_id,
        application_id,
        test_case_id,
        db,
    )

    return (
        db.query(TestRun)
        .filter(
            TestRun.test_case_id == test_case_id
        )
        .order_by(
            TestRun.id.desc()
        )
        .all()
    )


@router.get(
    "/{run_id}/steps",
    response_model=list[TestRunStepResponse],
)
def get_run_steps(
    project_id: int,
    application_id: int,
    test_case_id: int,
    run_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------
    # VALIDATE TEST CASE
    # --------------------------------

    get_case(
        project_id,
        application_id,
        test_case_id,
        db,
    )

    # --------------------------------
    # FIND RUN
    # --------------------------------

    run = (
        db.query(TestRun)
        .filter(
            TestRun.id == run_id,
            TestRun.test_case_id == test_case_id,
        )
        .first()
    )

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Test run not found",
        )

    return (
        db.query(TestRunStep)
        .filter(
            TestRunStep.test_run_id == run_id
        )
        .order_by(
            TestRunStep.id
        )
        .all()
    )


@router.get(
    "/{run_id}/steps/{step_id}/screenshot",
)
def get_step_screenshot(
    project_id: int,
    application_id: int,
    test_case_id: int,
    run_id: int,
    step_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------
    # VALIDATE TEST CASE
    # --------------------------------

    get_case(
        project_id,
        application_id,
        test_case_id,
        db,
    )

    # --------------------------------
    # FIND RUN
    # --------------------------------

    run = (
        db.query(TestRun)
        .filter(
            TestRun.id == run_id,
            TestRun.test_case_id == test_case_id,
        )
        .first()
    )

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Test run not found",
        )

    # --------------------------------
    # FIND STEP RESULT
    # --------------------------------

    run_step = (
        db.query(TestRunStep)
        .filter(
            TestRunStep.id == step_id,
            TestRunStep.test_run_id == run_id,
        )
        .first()
    )

    if not run_step:
        raise HTTPException(
            status_code=404,
            detail="Test run step not found",
        )

    # --------------------------------
    # CHECK SCREENSHOT
    # --------------------------------

    if not run_step.screenshot_path:
        raise HTTPException(
            status_code=404,
            detail="No screenshot available for this step",
        )

    # --------------------------------
    # CHECK FILE
    # --------------------------------

    from pathlib import Path

    screenshot_file = Path(
        run_step.screenshot_path
    )

    if not screenshot_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Screenshot file not found",
        )

    # --------------------------------
    # RETURN SCREENSHOT
    # --------------------------------

    return FileResponse(
        path=str(screenshot_file),
        media_type="image/png",
        filename=screenshot_file.name,
    )