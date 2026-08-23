const API_BASE_URL = "http://127.0.0.1:8000";

export type Project = {
  id: number;
  name: string;
  description: string | null;
};

export type Application = {
  id: number;
  project_id: number;
  name: string;
  url: string;
};

export type GeneratedTestStep = {
  step_number: number;
  action: string;
  description: string;
  target: string | null;
  value: string | null;
  expected_result: string | null;
};

export type GeneratedTestCase = {
  name: string;
  description: string;
  priority: string;
  steps: GeneratedTestStep[];
};

export type AITestGenerationResponse = {
  test_case: GeneratedTestCase;
};

export type TestCase = {
  id: number;
  application_id: number;
  name: string;
  description: string | null;
  priority: string;
  status: string;
};

export type TestStep = {
  id: number;
  test_case_id: number;
  step_number: number;
  action: string;
  description: string;
  target: string | null;
  value: string | null;
  expected_result: string | null;
};

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects/`);

  if (!response.ok) {
    throw new Error("Unable to load projects.");
  }

  return response.json();
}

export async function createProject(
  name: string,
  description: string,
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description: description || null,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to create project.");
  }

  return response.json();
}

export async function getApplications(
  projectId: number,
): Promise<Application[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/`,
  );

  if (!response.ok) {
    throw new Error("Unable to load applications.");
  }

  return response.json();
}

export async function createApplication(
  projectId: number,
  name: string,
  url: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        url,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to create application.");
  }

  return response.json();
}

export async function generateAITest(
  projectId: number,
  applicationId: number,
  requirement: string,
): Promise<AITestGenerationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/ai/generate-test`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requirement,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "AI test generation failed.");
  }

  return response.json();
}

export async function createTestCase(
  projectId: number,
  applicationId: number,
  test: GeneratedTestCase,
): Promise<TestCase> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: test.name,
        description: test.description,
        priority: test.priority,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to save test case.");
  }

  return response.json();
}

export async function createTestStep(
  projectId: number,
  applicationId: number,
  testCaseId: number,
  step: GeneratedTestStep,
): Promise<TestStep> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/${testCaseId}/steps/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        step_number: step.step_number,
        action: step.action,
        description: step.description,
        target: step.target,
        value: step.value,
        expected_result: step.expected_result,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to save test step.");
  }

  return response.json();
}

export async function saveGeneratedTest(
  projectId: number,
  applicationId: number,
  test: GeneratedTestCase,
): Promise<TestCase> {
  const testCase = await createTestCase(
    projectId,
    applicationId,
    test,
  );

  try {
    for (const step of test.steps) {
      await createTestStep(
        projectId,
        applicationId,
        testCase.id,
        step,
      );
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Test case created, but a test step could not be saved: ${error.message}`
        : "Test case created, but a test step could not be saved.",
    );
  }

  return testCase;
}

export async function getTestCases(
  projectId: number,
  applicationId: number,
): Promise<TestCase[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/`,
  );

  if (!response.ok) {
    throw new Error("Unable to load test cases.");
  }

  return response.json();
}

export type TestRun = {
  id: number;
  test_case_id: number;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
};

export type TestRunStep = {
  id: number;
  test_run_id: number;
  test_step_id: number;
  status: string;
  message: string | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  screenshot_path: string | null;
};

export async function runTestCase(
  projectId: number,
  applicationId: number,
  testCaseId: number,
): Promise<TestRun> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/${testCaseId}/runs/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text || "Unable to execute test case.",
    );
  }

  return response.json();
}

export async function getTestRuns(
  projectId: number,
  applicationId: number,
  testCaseId: number,
): Promise<TestRun[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/${testCaseId}/runs/`,
  );

  if (!response.ok) {
    throw new Error("Unable to load test runs.");
  }

  return response.json();
}

export async function getTestRunSteps(
  projectId: number,
  applicationId: number,
  testCaseId: number,
  runId: number,
): Promise<TestRunStep[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/${testCaseId}/runs/${runId}/steps/`,
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text || "Unable to load test execution steps.",
    );
  }

  return response.json();
}

export async function getTestSteps(
  projectId: number,
  applicationId: number,
  testCaseId: number,
): Promise<TestStep[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/applications/${applicationId}/test-cases/${testCaseId}/steps/`,
  );

  if (!response.ok) {
    throw new Error("Unable to load test steps.");
  }

  return response.json();
}
