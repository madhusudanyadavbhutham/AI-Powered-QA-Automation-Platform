from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class RootResponse(BaseModel):
    message: str
    status: str
    version: str

class HealthResponse(BaseModel):
    status: str

class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)

class ApplicationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    url: str

class ApplicationResponse(BaseModel):
    id: int
    project_id: int
    name: str
    url: str
    model_config = ConfigDict(from_attributes=True)

class TestCaseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    description: str | None = None
    priority: str = "medium"

class TestCaseResponse(BaseModel):
    id: int
    application_id: int
    name: str
    description: str | None = None
    priority: str
    status: str
    model_config = ConfigDict(from_attributes=True)

class TestStepCreate(BaseModel):
    step_number: int = Field(ge=1)
    action: str = Field(min_length=1, max_length=50)
    description: str
    target: str | None = None
    value: str | None = None   
    expected_result: str | None = None

class TestStepResponse(BaseModel):
    id: int
    test_case_id: int
    step_number: int
    action: str
    description: str
    target: str | None = None
    value: str | None = None
    expected_result: str | None = None
    model_config = ConfigDict(from_attributes=True)

class TestRunResponse(BaseModel):
    id: int
    test_case_id: int
    status: str
    started_at: datetime
    finished_at: datetime | None = None
    error_message: str | None = None
    model_config = ConfigDict(from_attributes=True)

class TestRunStepResponse(BaseModel):
    id: int
    test_run_id: int
    test_step_id: int
    status: str
    message: str | None = None
    started_at: datetime
    finished_at: datetime | None = None
    duration_ms: int | None = None
    screenshot_path: str | None = None

    model_config = ConfigDict(from_attributes=True)
