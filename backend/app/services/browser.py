from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, expect


SCREENSHOT_DIR = Path("screenshots")
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


def discover_application(url: str) -> dict:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=30000,
            )

            # --------------------------------
            # INPUT DETAILS
            # --------------------------------

            inputs = page.locator("input")

            input_details = []

            for i in range(min(inputs.count(), 50)):
                element = inputs.nth(i)

                input_details.append(
                    {
                        "type": element.get_attribute("type"),
                        "id": element.get_attribute("id"),
                        "name": element.get_attribute("name"),
                        "placeholder": element.get_attribute(
                            "placeholder"
                        ),
                        "aria_label": element.get_attribute(
                            "aria-label"
                        ),
                    }
                )

            # --------------------------------
            # BUTTON DETAILS
            # --------------------------------

            buttons = page.locator("button")

            button_details = []

            for i in range(min(buttons.count(), 50)):
                element = buttons.nth(i)

                button_details.append(
                    {
                        "text": element.inner_text().strip(),
                        "id": element.get_attribute("id"),
                        "type": element.get_attribute("type"),
                        "aria_label": element.get_attribute(
                            "aria-label"
                        ),
                    }
                )

            # --------------------------------
            # LINK DETAILS
            # --------------------------------

            links = page.locator("a")

            link_details = []

            for i in range(min(links.count(), 50)):
                element = links.nth(i)

                link_details.append(
                    {
                        "text": element.inner_text().strip(),
                        "href": element.get_attribute("href"),
                        "id": element.get_attribute("id"),
                        "aria_label": element.get_attribute(
                            "aria-label"
                        ),
                    }
                )

            return {
                "title": page.title(),
                "url": page.url,
                "links": links.all_inner_texts()[:50],
                "buttons": buttons.all_inner_texts()[:50],
                "input_count": inputs.count(),
                "inputs": input_details,
                "button_details": button_details,
                "link_details": link_details,
            }

        finally:
            browser.close()


def execute_steps(
    url: str,
    steps: list,
    run_id: int,
) -> list[dict]:

    results = []

    with sync_playwright() as playwright:

        browser = playwright.chromium.launch(
            headless=True
        )

        context = browser.new_context()

        page = context.new_page()

        try:

            # -------------------------------------------------
            # IMPORTANT:
            # Do NOT automatically open application.url here.
            #
            # The first "open" test step determines the URL.
            # This allows generated tests to use discovered URLs
            # such as /users/sign_in.
            # -------------------------------------------------

            for step in steps:

                step_started_at = datetime.utcnow()

                try:

                    action = step.action.lower().strip()

                    # -----------------------------------------
                    # OPEN
                    # -----------------------------------------

                    if action == "open":

                        target_url = (
                            step.target
                            or url
                        )

                        page.goto(
                            target_url,
                            wait_until="domcontentloaded",
                            timeout=30000,
                        )

                    # -----------------------------------------
                    # TYPE
                    # -----------------------------------------

                    elif action == "type":

                        if not step.target:
                            raise ValueError(
                                "type action requires target"
                            )

                        if step.value is None:
                            raise ValueError(
                                "type action requires value"
                            )

                        locator = page.locator(
                            step.target
                        )

                        locator.wait_for(
                            state="visible",
                            timeout=10000,
                        )

                        locator.fill(
                            step.value
                        )

                    # -----------------------------------------
                    # CLICK
                    # -----------------------------------------

                    elif action == "click":

                        if not step.target:
                            raise ValueError(
                                "click action requires target"
                            )

                        locator = page.locator(
                            step.target
                        )

                        locator.wait_for(
                            state="visible",
                            timeout=10000,
                        )

                        locator.click(
                            timeout=10000
                        )

                    # -----------------------------------------
                    # VERIFY
                    # -----------------------------------------

                    elif action == "verify":

                        if not step.target:
                            raise ValueError(
                                "verify action requires target"
                            )

                        locator = page.locator(
                            step.target
                        )

                        expect(
                            locator
                        ).to_be_visible(
                            timeout=10000
                        )

                    # -----------------------------------------
                    # VERIFY TEXT
                    # -----------------------------------------

                    elif action == "verify_text":

                        if not step.target:
                            raise ValueError(
                                "verify_text action requires target"
                            )

                        if step.value is None:
                            raise ValueError(
                                "verify_text action requires expected text in value"
                            )

                        locator = page.locator(
                            step.target
                        )

                        expect(
                            locator
                        ).to_contain_text(
                            step.value,
                            timeout=10000,
                        )

                    # -----------------------------------------
                    # VERIFY URL
                    # -----------------------------------------

                    elif action == "verify_url":

                        if not step.value:
                            raise ValueError(
                                "verify_url action requires expected URL in value"
                            )

                        expect(
                            page
                        ).to_have_url(
                            step.value,
                            timeout=10000,
                        )

                    # -----------------------------------------
                    # UNSUPPORTED ACTION
                    # -----------------------------------------

                    else:

                        raise ValueError(
                            f"Unsupported action: {step.action}"
                        )

                    # -----------------------------------------
                    # SUCCESS
                    # -----------------------------------------

                    finished_at = datetime.utcnow()

                    duration_ms = int(
                        (
                            finished_at
                            - step_started_at
                        ).total_seconds()
                        * 1000
                    )

                    screenshot_path = (
                        SCREENSHOT_DIR
                        / f"run_{run_id}_step_{step.step_number}.png"
                    )

                    page.screenshot(
                        path=str(
                            screenshot_path
                        ),
                        full_page=True,
                    )

                    results.append(
                        {
                            "step_id": step.id,
                            "status": "passed",
                            "message": (
                                step.expected_result
                                or "Step passed"
                            ),
                            "started_at": (
                                step_started_at
                            ),
                            "finished_at": (
                                finished_at
                            ),
                            "duration_ms": (
                                duration_ms
                            ),
                            "screenshot_path": str(
                                screenshot_path
                            ),
                        }
                    )

                except Exception as exc:

                    finished_at = datetime.utcnow()

                    duration_ms = int(
                        (
                            finished_at
                            - step_started_at
                        ).total_seconds()
                        * 1000
                    )

                    screenshot_path = (
                        SCREENSHOT_DIR
                        / f"run_{run_id}_step_{step.step_number}_failed.png"
                    )

                    try:
                        page.screenshot(
                            path=str(
                                screenshot_path
                            ),
                            full_page=True,
                        )
                    except Exception:
                        screenshot_path = None

                    results.append(
                        {
                            "step_id": step.id,
                            "status": "failed",
                            "message": str(exc),
                            "started_at": (
                                step_started_at
                            ),
                            "finished_at": (
                                finished_at
                            ),
                            "duration_ms": (
                                duration_ms
                            ),
                            "screenshot_path": (
                                str(screenshot_path)
                                if screenshot_path
                                else None
                            ),
                        }
                    )

                    # Stop executing subsequent steps
                    # after the first failure.
                    break

        finally:

            browser.close()

    return results