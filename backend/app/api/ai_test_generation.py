from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import Application
from app.services.browser import discover_application


router = APIRouter(
    prefix="/projects/{project_id}/applications/{application_id}/ai",
    tags=["AI Test Generation"],
)


# =========================================================
# REQUEST / RESPONSE SCHEMAS
# =========================================================

class AITestGenerationRequest(BaseModel):
    requirement: str = Field(
        min_length=10,
        max_length=5000,
    )


class GeneratedTestStep(BaseModel):
    step_number: int
    action: str
    description: str
    target: str | None = None
    value: str | None = None
    expected_result: str | None = None


class GeneratedTestCase(BaseModel):
    name: str
    description: str
    priority: str
    steps: list[GeneratedTestStep]


class AITestGenerationResponse(BaseModel):
    test_case: GeneratedTestCase


# =========================================================
# DISCOVERY HELPERS
# =========================================================

def find_input_by_keyword(
    inputs: list[dict],
    keywords: list[str],
):
    """
    Find the best matching input based on:
    id, name, placeholder, or aria-label.
    """

    for element in inputs:
        searchable = " ".join(
            str(element.get(field) or "").lower()
            for field in [
                "id",
                "name",
                "placeholder",
                "aria_label",
            ]
        )

        if any(
            keyword.lower() in searchable
            for keyword in keywords
        ):
            element_id = element.get("id")

            if element_id:
                return f"#{element_id}"

    return None


def find_link_by_keyword(
    links: list[dict],
    keywords: list[str],
):
    """
    Find a link based on visible text or aria-label.
    """

    for element in links:
        searchable = " ".join(
            str(element.get(field) or "").lower()
            for field in [
                "text",
                "aria_label",
            ]
        )

        if any(
            keyword.lower() in searchable
            for keyword in keywords
        ):
            element_id = element.get("id")

            if element_id:
                return f"#{element_id}"

            href = element.get("href")

            if href:
                return f'a[href="{href}"]'

    return None


def find_submit_input(
    inputs: list[dict],
    keywords: list[str],
):
    """
    Find the actual submit control.

    Supports:
    - input[type=submit]
    - input[type=button]

    Selector priority:
    1. id
    2. name
    3. value / placeholder / aria-label
    """

    # First pass:
    # Prefer submit inputs.
    for element in inputs:
        input_type = str(
            element.get("type") or ""
        ).lower()

        if input_type != "submit":
            continue

        searchable = " ".join(
            str(element.get(field) or "").lower()
            for field in [
                "name",
                "value",
                "placeholder",
                "aria_label",
            ]
        )

        # If no keyword matches, a submit input is
        # still likely the correct login form submit.
        keyword_match = any(
            keyword.lower() in searchable
            for keyword in keywords
        )

        if keyword_match or element.get("name") == "commit":

            element_id = element.get("id")

            if element_id:
                return f"#{element_id}"

            name = element.get("name")

            if name:
                return f'input[name="{name}"]'

    # Second pass:
    # Support button-type inputs.
    for element in inputs:
        input_type = str(
            element.get("type") or ""
        ).lower()

        if input_type != "button":
            continue

        searchable = " ".join(
            str(element.get(field) or "").lower()
            for field in [
                "name",
                "value",
                "placeholder",
                "aria_label",
            ]
        )

        if any(
            keyword.lower() in searchable
            for keyword in keywords
        ):
            element_id = element.get("id")

            if element_id:
                return f"#{element_id}"

            name = element.get("name")

            if name:
                return f'input[name="{name}"]'

    return None


# =========================================================
# AI TEST GENERATION
# =========================================================

@router.post(
    "/generate-test",
    response_model=AITestGenerationResponse,
)
def generate_test(
    project_id: int,
    application_id: int,
    data: AITestGenerationRequest,
    db: Session = Depends(get_db),
):

    # =====================================================
    # VALIDATE APPLICATION
    # =====================================================

    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.project_id == project_id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    # =====================================================
    # DISCOVER APPLICATION
    # =====================================================

    try:
        discovery = discover_application(
            application.url
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Application discovery failed: {exc}",
        )

    inputs = discovery.get(
        "inputs",
        [],
    )

    links = discovery.get(
        "link_details",
        [],
    )

    # IMPORTANT:
    # Use the URL discovered by Playwright.
    # For Apollo this should become:
    #
    # https://staging-apollo.pet-records.com/users/sign_in
    #
    discovered_url = discovery.get(
        "url",
        application.url,
    )

    requirement = data.requirement.lower()

    # =====================================================
    # SEARCH TEST
    # =====================================================

    if "search" in requirement:

        search_selector = find_input_by_keyword(
            inputs,
            [
                "search",
                "query",
            ],
        )

        if search_selector:

            generated = GeneratedTestCase(
                name="Search Application",
                description=(
                    "Verify that a user can search "
                    "the application."
                ),
                priority="medium",
                steps=[
                    GeneratedTestStep(
                        step_number=1,
                        action="open",
                        description="Open the application",
                        target=discovered_url,
                        expected_result=(
                            "The application is displayed"
                        ),
                    ),
                    GeneratedTestStep(
                        step_number=2,
                        action="type",
                        description="Enter the search term",
                        target=search_selector,
                        value="Python",
                        expected_result=(
                            "Search term is entered"
                        ),
                    ),
                ],
            )

        else:

            generated = GeneratedTestCase(
                name="Search Test",
                description=(
                    "A search field could not be "
                    "identified during discovery."
                ),
                priority="medium",
                steps=[
                    GeneratedTestStep(
                        step_number=1,
                        action="open",
                        description="Open the application",
                        target=discovered_url,
                        expected_result=(
                            "The application is displayed"
                        ),
                    )
                ],
            )

    # =====================================================
    # LOGIN TEST
    # =====================================================

    elif (
        "login" in requirement
        or "log in" in requirement
        or "sign in" in requirement
    ):

        # -------------------------------------------------
        # Find username/email field
        # -------------------------------------------------

        username_selector = find_input_by_keyword(
            inputs,
            [
                "username",
                "user",
                "email",
                "login",
            ],
        )

        # -------------------------------------------------
        # Find password field
        # -------------------------------------------------

        password_selector = find_input_by_keyword(
            inputs,
            [
                "password",
                "pass",
            ],
        )

        # -------------------------------------------------
        # Find actual submit input
        # -------------------------------------------------

        login_submit = find_submit_input(
            inputs,
            [
                "login",
                "log in",
                "sign in",
                "submit",
                "commit",
            ],
        )

        # -------------------------------------------------
        # Fallback login link
        # -------------------------------------------------

        login_link = find_link_by_keyword(
            links,
            [
                "login",
                "log in",
                "sign in",
            ],
        )

        # =================================================
        # LOGIN ELEMENTS FOUND
        # =================================================

        if username_selector and password_selector:

            generated = GeneratedTestCase(
                name="Successful Login",
                description=(
                    "Verify that a user can successfully "
                    "log in with valid credentials."
                ),
                priority="high",
                steps=[
                    # -------------------------------------
                    # STEP 1: OPEN
                    # -------------------------------------

                    GeneratedTestStep(
                        step_number=1,
                        action="open",
                        description="Open the application",
                        target=discovered_url,
                        expected_result=(
                            "The application is displayed"
                        ),
                    ),

                    # -------------------------------------
                    # STEP 2: USERNAME
                    # -------------------------------------

                    GeneratedTestStep(
                        step_number=2,
                        action="type",
                        description="Enter the username",
                        target=username_selector,
                        value="demo_user",
                        expected_result=(
                            "Username is entered"
                        ),
                    ),

                    # -------------------------------------
                    # STEP 3: PASSWORD
                    # -------------------------------------

                    GeneratedTestStep(
                        step_number=3,
                        action="type",
                        description="Enter the password",
                        target=password_selector,
                        value="demo_password",
                        expected_result=(
                            "Password is entered"
                        ),
                    ),
                ],
            )

            # =================================================
            # STEP 4: SUBMIT LOGIN
            #
            # IMPORTANT:
            # Prefer the actual submit input.
            # Only use login link as fallback.
            # =================================================

            submit_selector = (
                login_submit
                or login_link
            )

            if submit_selector:

                generated.steps.append(
                    GeneratedTestStep(
                        step_number=4,
                        action="click",
                        description="Submit the login form",
                        target=submit_selector,
                        expected_result=(
                            "Login request is submitted"
                        ),
                    )
                )

        # =================================================
        # LOGIN ELEMENTS NOT FOUND
        # =================================================

        else:

            generated = GeneratedTestCase(
                name="Login Test",
                description=(
                    "A login form could not be identified "
                    "on the discovered application page."
                ),
                priority="medium",
                steps=[
                    GeneratedTestStep(
                        step_number=1,
                        action="open",
                        description="Open the application",
                        target=discovered_url,
                        expected_result=(
                            "The application is displayed"
                        ),
                    )
                ],
            )

    # =====================================================
    # GENERIC TEST
    # =====================================================

    else:

        generated = GeneratedTestCase(
            name="Generated Test Case",
            description=data.requirement,
            priority="medium",
            steps=[
                GeneratedTestStep(
                    step_number=1,
                    action="open",
                    description="Open the application",
                    target=discovered_url,
                    expected_result=(
                        "Application is displayed"
                    ),
                )
            ],
        )

    # =====================================================
    # RETURN GENERATED TEST
    #
    # IMPORTANT:
    # This endpoint DOES NOT save anything to the database.
    #
    # The React frontend will call saveGeneratedTest()
    # when the user clicks "Save Test".
    # =====================================================

    return AITestGenerationResponse(
        test_case=generated
    )