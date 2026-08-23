# AI QA Automation Platform

FastAPI + SQLAlchemy + Playwright backend for managing projects, applications, test cases, test steps, discovery, and browser test execution.

## Start

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --reload
```

Swagger: http://127.0.0.1:8000/docs

## Main flow

1. Create a project.
2. Create an application under the project.
3. Create a test case.
4. Add test steps.
5. Run the test case.
6. Read the run and step results.

## Run a test case

```text
POST /projects/{project_id}/applications/{application_id}/test-cases/{test_case_id}/runs/
```

Supported browser actions currently include:
- open
- type
- click
- verify

For `type`, the current implementation fills the target selector with the step description. For production use, add a separate input-value field to the schema/model rather than putting secrets into descriptions.

## Existing database

The app uses `qa_platform.db`. `Base.metadata.create_all()` creates missing tables without deleting existing tables. For production schema changes, use Alembic migrations.
