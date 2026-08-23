import {
  useEffect,
  useState,
  type ElementType,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  createApplication,
  createProject,
  generateAITest,
  getApplications,
  getProjects,
  getTestCases,
  getTestSteps,
  getTestRuns,
  getTestRunSteps,
  runTestCase,
  saveGeneratedTest,
  type Application,
  type GeneratedTestCase,
  type Project,
  type TestCase,
  type TestStep,
  type TestRun,
  type TestRunStep,
} from "./api/api";

import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  ChevronDown,
  ClipboardCheck,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  Gauge,
  Globe,
  LayoutDashboard,
  PlayCircle,
  Plus,
  Settings,
  ShieldCheck,
  Smartphone,
  XCircle,
  Sparkles,
  X,
} from "lucide-react";

import "./App.css";

type NavItem = {
  label: string;
  icon: ElementType;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    icon: FolderKanban,
  },
  {
    label: "Applications",
    icon: Smartphone,
  },
  {
    label: "Test Cases",
    icon: ClipboardCheck,
  },
  {
    label: "AI Test Generator",
    icon: Sparkles,
  },
  {
    label: "Test Execution",
    icon: PlayCircle,
  },
  {
    label: "Test Results",
    icon: BarChart3,
  },
];

function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingApplications, setLoadingApplications] =
    useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoadingProjects(true);

      const data = await getProjects();

      setProjects(data);

      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      } else {
        setSelectedProjectId(null);
      }
    } catch (error) {
      console.error(
        "Failed to load projects:",
        error,
      );
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadApplications(
    projectId: number,
  ) {
    try {
      setLoadingApplications(true);

      const data =
        await getApplications(projectId);

      setApplications(data);
    } catch (error) {
      console.error(
        "Failed to load applications:",
        error,
      );

      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }

  useEffect(() => {
    if (selectedProjectId !== null) {
      loadApplications(selectedProjectId);
    } else {
      setApplications([]);
    }
  }, [selectedProjectId]);

  async function handleCreateProject(
    name: string,
    description: string,
  ) {
    try {
      const project = await createProject(
        name,
        description,
      );

      setProjects((current) => [
        ...current,
        project,
      ]);

      setSelectedProjectId(project.id);
      setShowCreateModal(false);
    } catch (error) {
      console.error(
        "Failed to create project:",
        error,
      );

      alert("Unable to create project.");
    }
  }

  function handleNavigate(page: string) {
    setActivePage(page);
  }

  return (
    <div className="app-shell">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={24} />
          </div>

          <div>
            <div className="brand-title">
              AI QA
            </div>

            <div className="brand-subtitle">
              Automation Platform
            </div>
          </div>
        </div>

        <div className="workspace">
          <div className="workspace-label">
            WORKSPACE
          </div>

          <button
            type="button"
            className="workspace-selector"
          >
            <div className="workspace-avatar">
              M
            </div>

            <div className="workspace-info">
              <strong>
                My Workspace
              </strong>

              <span>Personal</span>
            </div>

            <ChevronDown size={16} />
          </button>
        </div>

        <nav className="navigation">
          <div className="nav-section-title">
            PLATFORM
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              activePage === item.label;

            return (
              <button
                type="button"
                key={item.label}
                className={`nav-item ${
                  active ? "active" : ""
                }`}
                onClick={() =>
                  handleNavigate(
                    item.label,
                  )
                }
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="nav-section-title secondary">
            SYSTEM
          </div>

          <button
            type="button"
            className={`nav-item ${
              activePage ===
              "Usage & Analytics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigate(
                "Usage & Analytics",
              )
            }
          >
            <Gauge size={19} />

            <span>
              Usage & Analytics
            </span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigate("Settings")
            }
          >
            <Settings size={19} />

            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-status">
            <div className="status-icon">
              <ShieldCheck size={18} />
            </div>

            <div>
              <strong>
                AI Engine Online
              </strong>

              <span>
                Ready for testing
              </span>
            </div>

            <span className="online-dot" />
          </div>

          <div className="user-profile">
            <div className="user-avatar">
              MY
            </div>

            <div className="user-info">
              <strong>
                Madhusudan
              </strong>

              <span>
                Administrator
              </span>
            </div>

            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace / {activePage}
            </div>

            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowCreateModal(true)
              }
            >
              <Plus size={18} />

              New Project
            </button>
          </div>
        </header>

        {/* DASHBOARD */}

        {activePage === "Dashboard" && (
          <Dashboard
            projects={projects}
            applications={applications}
            onCreateProject={() =>
              setShowCreateModal(true)
            }
          />
        )}

        {/* PROJECTS */}

        {activePage === "Projects" && (
          <ProjectsPage
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={
              setSelectedProjectId
            }
            onCreateProject={() =>
              setShowCreateModal(true)
            }
          />
        )}

        {/* APPLICATIONS */}

        {activePage ===
          "Applications" && (
          <ApplicationsPage
            projects={projects}
            selectedProjectId={
              selectedProjectId
            }
            setSelectedProjectId={
              setSelectedProjectId
            }
            applications={applications}
            loadingProjects={
              loadingProjects
            }
            loadingApplications={
              loadingApplications
            }
            reloadApplications={() => {
              if (
                selectedProjectId !==
                null
              ) {
                loadApplications(
                  selectedProjectId,
                );
              }
            }}
            onCreateProject={() =>
              setShowCreateModal(true)
            }
          />
        )}

        {/* AI TEST GENERATOR */}

        {activePage ===
          "AI Test Generator" && (
          <AITestGeneratorPage
            projects={projects}
            selectedProjectId={
              selectedProjectId
            }
          />
        )}

        {/* TEST CASES */}

        {activePage === "Test Cases" && (
          <TestCasesPage
            projects={projects}
            selectedProjectId={
              selectedProjectId
            }
          />
        )}

        {/* OTHER PAGES */}


        
        {activePage === "Test Execution" && (
          <TestExecutionPage
            projects={projects}
            selectedProjectId={selectedProjectId}
          />
        )}

       {activePage === "Test Results" && (
        <TestResultsPage
          selectedProjectId={selectedProjectId}
        />
      )}

      {activePage !== "Dashboard" &&
      activePage !== "Projects" &&
      activePage !== "Applications" &&
      activePage !== "AI Test Generator" &&
      activePage !== "Test Cases" &&
      activePage !== "Test Execution" &&
      activePage !== "Test Results" && (
        <PlaceholderPage
          page={activePage}
        />
      )}
      </main>

      {/* CREATE PROJECT MODAL */}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreate={
            handleCreateProject
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   AI TEST GENERATOR PAGE
========================================================= */

function AITestGeneratorPage({
  projects,
  selectedProjectId,
}: {
  projects: Project[];
  selectedProjectId: number | null;
}) {
  const [projectId, setProjectId] =
    useState<number | null>(
      selectedProjectId,
    );

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [applicationId, setApplicationId] =
    useState<number | null>(null);

  const [requirement, setRequirement] =
    useState("");

  const [generatedTest, setGeneratedTest] =
    useState<GeneratedTestCase | null>(
      null,
    );

  const [
    loadingApplications,
    setLoadingApplications,
  ] = useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setProjectId(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    async function loadApps() {
      if (projectId === null) {
        setApplications([]);
        setApplicationId(null);
        return;
      }

      try {
        setLoadingApplications(true);
        setError("");

        const data =
          await getApplications(
            projectId,
          );

        setApplications(data);

        if (data.length > 0) {
          setApplicationId(
            data[0].id,
          );
        } else {
          setApplicationId(null);
        }
      } catch (error) {
        console.error(
          "Failed to load applications:",
          error,
        );

        setApplications([]);
        setApplicationId(null);

        setError(
          "Unable to load applications.",
        );
      } finally {
        setLoadingApplications(false);
      }
    }

    loadApps();
  }, [projectId]);

  async function handleGenerate() {
    if (!projectId) {
      setError(
        "Please select a project.",
      );

      return;
    }

    if (!applicationId) {
      setError(
        "Please select an application.",
      );

      return;
    }

    if (
      requirement.trim().length < 10
    ) {
      setError(
        "Please describe what you want to test.",
      );

      return;
    }

    try {
      setGenerating(true);
      setError("");
      setGeneratedTest(null);

      const result =
        await generateAITest(
          projectId,
          applicationId,
          requirement.trim(),
        );

      setGeneratedTest(
        result.test_case,
      );
    } catch (error) {
      console.error(
        "AI test generation failed:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "AI test generation failed.",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="dashboard ai-generator-page">
      <div className="page-intro">
        <div>
          <div className="eyebrow dark-eyebrow">
            <Sparkles size={15} />
            AI-POWERED TEST GENERATION
          </div>

          <h2>
            AI Test Generator
          </h2>

          <p>
            Describe what you want to
            test and let AI create
            structured, executable test
            cases automatically.
          </p>
        </div>
      </div>

      <div className="ai-generator-grid">
        {/* GENERATOR FORM */}

        <div className="ai-generator-panel">
          <div className="panel-heading">
            <div className="panel-icon">
              <Bot size={20} />
            </div>

            <div>
              <h3>
                Generate a Test
              </h3>

              <p>
                Tell AI what behavior
                you want to validate.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Project</label>

            <select
              value={projectId ?? ""}
              onChange={(event) => {
                const value =
                  event.target.value;

                setProjectId(
                  value
                    ? Number(value)
                    : null,
                );

                setApplicationId(null);
                setGeneratedTest(null);
                setError("");
              }}
            >
              <option value="">
                Select project
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-group">
            <label>
              Application
            </label>

            <select
              value={applicationId ?? ""}
              disabled={
                !projectId ||
                loadingApplications
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setApplicationId(
                  value
                    ? Number(value)
                    : null,
                );

                setGeneratedTest(null);
                setError("");
              }}
            >
              <option value="">
                {loadingApplications
                  ? "Loading applications..."
                  : "Select application"}
              </option>

              {applications.map(
                (application) => (
                  <option
                    key={application.id}
                    value={
                      application.id
                    }
                  >
                    {application.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-group">
            <label>
              What do you want to
              test?
            </label>

            <textarea
              value={requirement}
              onChange={(event) => {
                setRequirement(
                  event.target.value,
                );

                setError("");
              }}
              placeholder="Example: Verify that a user can search for Python on the W3Schools website."
              rows={7}
            />

            <span className="input-hint">
              Describe the expected user
              behavior in natural
              language.
            </span>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="button"
            className="primary-button generate-button"
            onClick={handleGenerate}
            disabled={
              generating ||
              !projectId ||
              !applicationId ||
              requirement.trim()
                .length < 10
            }
          >
            <Sparkles size={18} />

            {generating
              ? "Generating Test..."
              : "Generate Test"}
          </button>
        </div>

        {/* RESULT */}

        <div className="ai-result-panel">
          {!generatedTest ||
          projectId === null ||
          applicationId === null ? (
            <div className="ai-empty-result">
              <div className="ai-empty-icon">
                <Sparkles size={34} />
              </div>

              <h3>
                AI-generated test will
                appear here
              </h3>

              <p>
                Select an application,
                describe your
                requirement, and click
                Generate Test.
              </p>
            </div>
          ) : (
            <GeneratedTestResult
              test={generatedTest}
              projectId={projectId}
              applicationId={
                applicationId
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GENERATED TEST RESULT
========================================================= */

function GeneratedTestResult({
  test,
  projectId,
  applicationId,
  onSaved,
}: {
  test: GeneratedTestCase;
  projectId: number;
  applicationId: number;
  onSaved?: (testCase: TestCase) => void;
}) {
  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSaveTest() {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const savedTest = await saveGeneratedTest(
      projectId,
      applicationId,
      test,
    );

    setSaved(true);
    onSaved?.(savedTest);
    } catch (error) {
      console.error(
        "Failed to save test:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save test case.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="generated-test">
      <div className="generated-test-header">
        <div>
          <div className="eyebrow dark-eyebrow">
            <Bot size={15} />
            AI GENERATED TEST
          </div>

          <h3>{test.name}</h3>

          <p>{test.description}</p>
        </div>

        <span
          className={`priority-badge ${test.priority.toLowerCase()}`}
        >
          {test.priority}
        </span>
      </div>

      <div className="generated-steps">
        <div className="steps-heading">
          <ClipboardCheck size={18} />

          <strong>
            Test Steps
          </strong>

          <span>
            {test.steps.length} steps
          </span>
        </div>

        {test.steps.map((step) => (
          <div
            className="generated-step"
            key={step.step_number}
          >
            <div className="step-number">
              {step.step_number}
            </div>

            <div className="step-content">
              <div className="step-top">
                <span className="action-badge">
                  {step.action.toUpperCase()}
                </span>

                <strong>
                  {step.description}
                </strong>
              </div>

              {step.target && (
                <div className="step-detail">
                  <span>Target</span>

                  <code>
                    {step.target}
                  </code>
                </div>
              )}

              {step.value && (
                <div className="step-detail">
                  <span>Value</span>

                  <code>
                    {step.value}
                  </code>
                </div>
              )}

              {step.expected_result && (
                <div className="step-expected">
                  <ShieldCheck
                    size={14}
                  />

                  <span>
                    {
                      step.expected_result
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {saved && (
        <div className="success-message">
          ✓ Test case and{" "}
          {test.steps.length} test step
          {test.steps.length === 1
            ? ""
            : "s"}{" "}
          saved successfully.
        </div>
      )}

      <div className="generated-test-actions">
        <button
          type="button"
          className="secondary-button"
        >
          <FileText size={18} />
          Edit Test
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={handleSaveTest}
          disabled={saving || saved}
        >
          <ClipboardCheck size={16} />

          {saving
            ? "Saving..."
            : saved
              ? "Test Saved"
              : "Save Test Case"}
        </button>
      </div>
    </div>
  );
}


/* =========================================================
   TEST EXECUTION PAGE
========================================================= */

function TestExecutionPage({
  projects,
  selectedProjectId,
}: {
  projects: Project[];
  selectedProjectId: number | null;
}) {
  return (
    <div className="dashboard test-execution-page">
      <div className="page-intro">
        <div>
          <div className="eyebrow dark-eyebrow">
            <PlayCircle size={15} />

            TEST EXECUTION
          </div>

          <h2>Test Execution</h2>

          <p>
            Select a test case and execute
            it against your connected
            application using Playwright.
          </p>
        </div>
      </div>

      <TestExecutionWorkspace
        projects={projects}
        selectedProjectId={
          selectedProjectId
        }
      />
    </div>
  );
}

/* =========================================================
   TEST EXECUTION WORKSPACE
========================================================= */

function TestExecutionWorkspace({
  projects,
  selectedProjectId,
}: {
  projects: Project[];
  selectedProjectId: number | null;
}) {
  return (
    <TestCasesPage
      projects={projects}
      selectedProjectId={selectedProjectId}
    />
  );
}

/* =========================================================
   TEST CASES PAGE
========================================================= */

function TestCasesPage({
  projects,
  selectedProjectId,
}: {
  projects: Project[];
  selectedProjectId: number | null;
}) {
  const [projectId, setProjectId] =
    useState<number | null>(
      selectedProjectId,
    );

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [applicationId, setApplicationId] =
    useState<number | null>(null);

  const [testCases, setTestCases] =
    useState<TestCase[]>([]);

  const [
    selectedTestCase,
    setSelectedTestCase,
  ] = useState<TestCase | null>(
    null,
  );

  const [testSteps, setTestSteps] =
    useState<TestStep[]>([]);

  const [
    loadingApplications,
    setLoadingApplications,
  ] = useState(false);

  const [loadingTests, setLoadingTests] =
    useState(false);

  const [loadingSteps, setLoadingSteps] =
    useState(false);

  const [running, setRunning] =
    useState(false);

  const [latestRun, setLatestRun] =
    useState<TestRun | null>(null);

  const [runSteps, setRunSteps] =
    useState<TestRunStep[]>([]);

  const [
    loadingRunSteps,
    setLoadingRunSteps,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setProjectId(selectedProjectId);
  }, [selectedProjectId]);

  /* ---------------------------------------------------------
     LOAD APPLICATIONS
  --------------------------------------------------------- */

  useEffect(() => {
    async function loadApps() {
      if (projectId === null) {
        setApplications([]);
        setApplicationId(null);
        setTestCases([]);
        setSelectedTestCase(null);
        setTestSteps([]);
        setLatestRun(null);
        setRunSteps([]);
        return;
      }

      try {
        setLoadingApplications(true);
        setError("");

        const data =
          await getApplications(
            projectId,
          );

        setApplications(data);

        if (data.length > 0) {
          setApplicationId(
            data[0].id,
          );
        } else {
          setApplicationId(null);
        }
      } catch (err) {
        console.error(
          "Failed to load applications:",
          err,
        );

        setApplications([]);
        setApplicationId(null);

        setError(
          "Unable to load applications.",
        );
      } finally {
        setLoadingApplications(false);
      }
    }

    loadApps();
  }, [projectId]);

  /* ---------------------------------------------------------
     LOAD TEST CASES
  --------------------------------------------------------- */

  useEffect(() => {
    async function loadTests() {
      if (
        projectId === null ||
        applicationId === null
      ) {
        setTestCases([]);
        setSelectedTestCase(null);
        setTestSteps([]);
        setLatestRun(null);
        setRunSteps([]);
        return;
      }

      try {
        setLoadingTests(true);
        setError("");

        const data =
          await getTestCases(
            projectId,
            applicationId,
          );

        setTestCases(data);

        if (data.length > 0) {
          setSelectedTestCase(
            data[0],
          );
        } else {
          setSelectedTestCase(null);
        }

        setLatestRun(null);
        setRunSteps([]);
      } catch (err) {
        console.error(
          "Failed to load test cases:",
          err,
        );

        setTestCases([]);
        setSelectedTestCase(null);
        setTestSteps([]);
        setLatestRun(null);
        setRunSteps([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load test cases.",
        );
      } finally {
        setLoadingTests(false);
      }
    }

    loadTests();
  }, [
    projectId,
    applicationId,
  ]);

  /* ---------------------------------------------------------
     LOAD TEST STEPS
  --------------------------------------------------------- */

  useEffect(() => {
    async function loadSteps() {
      if (
        projectId === null ||
        applicationId === null ||
        selectedTestCase === null
      ) {
        setTestSteps([]);
        return;
      }

      try {
        setLoadingSteps(true);
        setError("");

        const data =
          await getTestSteps(
            projectId,
            applicationId,
            selectedTestCase.id,
          );

        setTestSteps(data);
      } catch (err) {
        console.error(
          "Failed to load test steps:",
          err,
        );

        setTestSteps([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load test steps.",
        );
      } finally {
        setLoadingSteps(false);
      }
    }

    loadSteps();
  }, [
    projectId,
    applicationId,
    selectedTestCase,
  ]);

  /* ---------------------------------------------------------
     LOAD EXECUTION STEPS
  --------------------------------------------------------- */

  async function loadExecutionSteps(
    run: TestRun,
  ) {
    if (
      projectId === null ||
      applicationId === null ||
      selectedTestCase === null
    ) {
      return;
    }

    try {
      setLoadingRunSteps(true);

      const executionSteps =
        await getTestRunSteps(
          projectId,
          applicationId,
          selectedTestCase.id,
          run.id,
        );

      setRunSteps(executionSteps);
    } catch (error) {
      console.error(
        "Unable to load execution steps:",
        error,
      );

      setRunSteps([]);
    } finally {
      setLoadingRunSteps(false);
    }
  }

  /* ---------------------------------------------------------
     RUN TEST CASE
  --------------------------------------------------------- */

  async function handleRunTest() {
    if (
      projectId === null ||
      applicationId === null ||
      selectedTestCase === null
    ) {
      return;
    }

    try {
      setRunning(true);
      setError("");
      setLatestRun(null);
      setRunSteps([]);

      const run = await runTestCase(
        projectId,
        applicationId,
        selectedTestCase.id,
      );

      setLatestRun(run);
      await loadExecutionSteps(run);

    } catch (err) {
      console.error(
        "Failed to execute test case:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to execute test case.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="dashboard test-cases-page">
      {/* HEADER */}

      <div className="page-intro">
        <div>
          <div className="eyebrow dark-eyebrow">
            <ClipboardCheck size={15} />

            TEST MANAGEMENT
          </div>

          <h2>Test Cases</h2>

          <p>
            View, manage, and execute your
            AI-generated and manually
            created test cases.
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="test-case-filters">
        <div className="form-group">
          <label>Project</label>

          <select
            value={projectId ?? ""}
            onChange={(event) => {
              const value =
                event.target.value;

              setProjectId(
                value
                  ? Number(value)
                  : null,
              );

              setApplicationId(null);
              setSelectedTestCase(null);
              setTestCases([]);
              setTestSteps([]);
              setLatestRun(null);
              setRunSteps([]);
              setError("");
            }}
          >
            <option value="">
              Select project
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Application</label>

          <select
            value={applicationId ?? ""}
            disabled={
              !projectId ||
              loadingApplications
            }
            onChange={(event) => {
              const value =
                event.target.value;

              setApplicationId(
                value
                  ? Number(value)
                  : null,
              );

              setSelectedTestCase(null);
              setTestSteps([]);
              setLatestRun(null);
              setRunSteps([]);
              setError("");
            }}
          >
            <option value="">
              {loadingApplications
                ? "Loading applications..."
                : "Select application"}
            </option>

            {applications.map(
              (application) => (
                <option
                  key={application.id}
                  value={
                    application.id
                  }
                >
                  {application.name}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {/* CONTENT */}

      {!projectId ||
      !applicationId ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardCheck
              size={32}
            />
          </div>

          <h3>
            Select a project and
            application
          </h3>

          <p>
            Choose an application to
            view its saved test cases.
          </p>
        </div>
      ) : loadingTests ? (
        <div className="page-loading">
          <div className="loading-spinner" />

          <p>
            Loading test cases...
          </p>
        </div>
      ) : testCases.length ===
        0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sparkles size={32} />
          </div>

          <h3>
            No test cases yet
          </h3>

          <p>
            Generate and save an AI
            test to see it here.
          </p>
        </div>
      ) : (
        <div className="test-cases-layout">
          {/* TEST CASE LIST */}

          <div className="test-case-list-panel">
            <div className="panel-list-header">
              <div>
                <span className="card-eyebrow">
                  SAVED TESTS
                </span>

                <h3>
                  {testCases.length} Test
                  Case
                  {testCases.length ===
                  1
                    ? ""
                    : "s"}
                </h3>
              </div>
            </div>

            <div className="test-case-list">
              {testCases.map(
                (testCase) => (
                  <button
                    type="button"
                    key={
                      testCase.id
                    }
                    className={`test-case-list-item ${
                      selectedTestCase?.id ===
                      testCase.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedTestCase(
                        testCase,
                      );

                      setLatestRun(
                        null,
                      );

                      setRunSteps([]);

                      setError("");
                    }}
                  >
                    <div className="test-case-list-top">
                      <span
                        className={`priority-badge ${testCase.priority.toLowerCase()}`}
                      >
                        {
                          testCase.priority
                        }
                      </span>

                      <span>
                        ID #
                        {
                          testCase.id
                        }
                      </span>
                    </div>

                    <strong>
                      {testCase.name}
                    </strong>

                    <p>
                      {testCase.description ||
                        "No description"}
                    </p>

                    <span className="test-status">
                      {testCase.status}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* TEST CASE DETAILS */}

          <div className="test-case-detail-panel">
            {!selectedTestCase ? (
              <div className="ai-empty-result">
                <div className="ai-empty-icon">
                  <ClipboardCheck
                    size={34}
                  />
                </div>

                <h3>
                  Select a test case
                </h3>

                <p>
                  Select a test case
                  from the list to view
                  its steps.
                </p>
              </div>
            ) : (
              <>
                {/* DETAIL HEADER */}

                <div className="test-detail-header">
                  <div>
                    <div className="eyebrow dark-eyebrow">
                      <Bot size={15} />

                      TEST CASE
                    </div>

                    <h2>
                      {
                        selectedTestCase.name
                      }
                    </h2>

                    <p>
                      {selectedTestCase.description ||
                        "No description provided."}
                    </p>
                  </div>

                  <span
                    className={`priority-badge ${selectedTestCase.priority.toLowerCase()}`}
                  >
                    {
                      selectedTestCase.priority
                    }
                  </span>
                </div>

                {/* EXECUTION TOOLBAR */}

                <div className="execution-toolbar">
                  <div>
                    <span>
                      {testSteps.length}{" "}
                      step
                      {testSteps.length ===
                      1
                        ? ""
                        : "s"}
                    </span>

                    {latestRun && (
                      <span
                        className={`run-status ${latestRun.status.toLowerCase()}`}
                      >
                        {latestRun.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      handleRunTest
                    }
                    disabled={
                      running ||
                      loadingSteps ||
                      testSteps.length ===
                        0
                    }
                  >
                    <PlayCircle
                      size={18}
                    />

                    {running
                      ? "Running Test..."
                      : "Run Test"}
                  </button>
                </div>

                {/* EXECUTION RESULT */}

                {latestRun && (
                  <>
                    <ExecutionResult
                      run={latestRun}
                    />

                    <TestExecutionSteps
                      steps={runSteps}
                      loading={
                        loadingRunSteps
                      }
                    />
                  </>
                )}

                {/* TEST STEPS */}

                <div className="test-steps-panel">
                  <div className="steps-heading">
                    <ClipboardCheck
                      size={18}
                    />

                    <strong>
                      Test Steps
                    </strong>

                    <span>
                      {testSteps.length}{" "}
                      steps
                    </span>
                  </div>

                  {loadingSteps ? (
                    <div className="page-loading small">
                      <div className="loading-spinner" />

                      <p>
                        Loading steps...
                      </p>
                    </div>
                  ) : testSteps.length ===
                    0 ? (
                    <div className="empty-card">
                      <strong>
                        No test steps
                      </strong>

                      <span>
                        This test case
                        does not contain
                        any saved steps.
                      </span>
                    </div>
                  ) : (
                    testSteps.map(
                      (step) => (
                        <TestStepView
                          key={
                            step.id
                          }
                          step={step}
                        />
                      ),
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TEST EXECUTION STEPS
========================================================= */

function TestExecutionSteps({
  steps,
  loading,
}: {
  steps: TestRunStep[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="execution-steps-panel">
        <div className="steps-heading">
          <Activity size={18} />
          <strong>Execution Results</strong>
        </div>

        <div className="page-loading small">
          <div className="loading-spinner" />
          <p>Loading execution results...</p>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="execution-steps-panel">
        <div className="steps-heading">
          <Activity size={18} />
          <strong>Execution Results</strong>
        </div>

        <div className="empty-card">
          <strong>No execution step results</strong>
          <span>Step-level execution results are not available yet.</span>
        </div>
      </div>
    );
  }

  const passed = steps.filter(
    (step) => step.status.toLowerCase() === "passed",
  ).length;
  const failed = steps.filter(
    (step) => ["failed", "error"].includes(step.status.toLowerCase()),
  ).length;
  const completed = steps.filter(
    (step) => step.finished_at !== null,
  ).length;
  const totalDuration = steps.reduce(
    (total, step) => total + (step.duration_ms ?? 0),
    0,
  );

  return (
    <div className="execution-steps-panel">
      <div className="steps-heading execution-heading">
        <div className="execution-heading-title">
          <Activity size={18} />
          <strong>Execution Results</strong>
        </div>
        <span>{steps.length} steps</span>
      </div>

      <div className="execution-summary">
        <div className="execution-summary-card">
          <span className="execution-summary-icon total"><Activity size={16} /></span>
          <div><strong>{steps.length}</strong><span>Total Steps</span></div>
        </div>
        <div className="execution-summary-card passed">
          <span className="execution-summary-icon"><CheckCircle2 size={16} /></span>
          <div><strong>{passed}</strong><span>Passed</span></div>
        </div>
        <div className="execution-summary-card failed">
          <span className="execution-summary-icon"><XCircle size={16} /></span>
          <div><strong>{failed}</strong><span>Failed</span></div>
        </div>
        <div className="execution-summary-card">
          <span className="execution-summary-icon duration"><Clock3 size={16} /></span>
          <div><strong>{(totalDuration / 1000).toFixed(2)}s</strong><span>Duration</span></div>
        </div>
      </div>

      <div className="execution-progress">
        <div className="execution-progress-track">
          <span style={{ width: `${steps.length ? (completed / steps.length) * 100 : 0}%` }} />
        </div>
        <span>{completed} of {steps.length} completed</span>
      </div>

      <div className="execution-steps">
        {steps.map((step, index) => {
          const status = step.status.toLowerCase();
          const isPassed = status === "passed";
          const isFailed = status === "failed" || status === "error";
          const duration =
            step.duration_ms !== null
              ? `${(step.duration_ms / 1000).toFixed(2)}s`
              : "—";

          return (
            <div className={`execution-step ${status}`} key={step.id}>
              <div className={`execution-step-number ${status}`}>
                {isPassed ? <CheckCircle2 size={17} /> : isFailed ? <XCircle size={17} /> : index + 1}
              </div>

              <div className="execution-step-content">
                <div className="execution-step-header">
                  <div>
                    <strong>Step {index + 1}</strong>
                    <span className="execution-step-action">
                      {step.test_step_id ? `Test step #${step.test_step_id}` : "Automated step"}
                    </span>
                  </div>

                  <span className={`execution-step-status ${status}`}>
                    {step.status.toUpperCase()}
                  </span>
                </div>

                {step.message && <p>{step.message}</p>}

                <div className="execution-step-meta">
                  <span><Clock3 size={13} /> Duration: {duration}</span>
                  {step.finished_at && <span><CheckCircle2 size={13} /> Completed</span>}
                </div>
              </div>

              {step.screenshot_path && (
                <div className="execution-screenshot">
                  <div className="execution-screenshot-icon">
                    <Activity size={16} />
                  </div>
                  <span>Screenshot captured</span>
                </div>
              )}

              {!step.screenshot_path && isFailed && (
                <div className="execution-screenshot missing">
                  <AlertCircle size={16} />
                  <span>Failure details</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   EXECUTION RESULT
========================================================= */

function ExecutionResult({
  run,
}: {
  run: TestRun;
}) {
  const duration =
    run.finished_at
      ? Math.max(
          0,
          new Date(run.finished_at).getTime() -
            new Date(run.started_at).getTime(),
        )
      : null;

  const status = run.status.toLowerCase();
  const passed = status === "passed";
  const failed = status === "failed" || status === "error";

  return (
    <div className={`execution-result ${status}`}>
      <div className="execution-result-main">
        <div className="execution-result-icon">
          {passed ? <CheckCircle2 size={23} /> : failed ? <XCircle size={23} /> : <Activity size={23} />}
        </div>

        <div>
          <div className="execution-result-title-row">
            <strong>Test {run.status.toUpperCase()}</strong>
            <span className={`run-status ${status}`}>{run.status.toUpperCase()}</span>
          </div>
          <p>
            {run.error_message ||
              (passed
                ? "All automated test steps completed successfully."
                : status === "running"
                  ? "The automated test is currently running."
                  : "The test execution completed with an issue.")}
          </p>
        </div>
      </div>

      <div className="execution-result-meta">
        {duration !== null && (
          <div>
            <Clock3 size={15} />
            <span>{(duration / 1000).toFixed(2)}s</span>
          </div>
        )}
        {run.finished_at && (
          <div>
            <CheckCircle2 size={15} />
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TEST STEP VIEW
========================================================= */

function TestStepView({
  step,
}: {
  step: TestStep;
}) {
  return (
    <div className="generated-step">
      <div className="step-number">
        {step.step_number}
      </div>

      <div className="step-content">
        <div className="step-top">
          <span className="action-badge">
            {step.action.toUpperCase()}
          </span>

          <strong>
            {step.description}
          </strong>
        </div>

        {step.target && (
          <div className="step-detail">
            <span>Target</span>

            <code>
              {step.target}
            </code>
          </div>
        )}

        {step.value && (
          <div className="step-detail">
            <span>Value</span>

            <code>
              {step.value}
            </code>
          </div>
        )}

        {step.expected_result && (
          <div className="step-expected">
            <ShieldCheck size={14} />

            <span>
              {
                step.expected_result
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   APPLICATIONS PAGE
========================================================= */

function ApplicationsPage({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  applications,
  loadingProjects,
  loadingApplications,
  reloadApplications,
  onCreateProject,
}: {
  projects: Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (
    id: number,
  ) => void;
  applications: Application[];
  loadingProjects: boolean;
  loadingApplications: boolean;
  reloadApplications: () => void;
  onCreateProject: () => void;
}) {
  const [
    showAddApplication,
    setShowAddApplication,
  ] = useState(false);

  if (loadingProjects) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />

        <p>
          Loading projects...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard applications-page">
      <div className="page-intro">
        <div>
          <div className="eyebrow dark-eyebrow">
            <Globe size={15} />

            APPLICATION MANAGEMENT
          </div>

          <h2>
            Your Applications
          </h2>

          <p>
            Connect web applications to
            your QA automation workflow
            and let AI discover and
            generate tests.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowAddApplication(
              true,
            )
          }
          disabled={!selectedProjectId}
        >
          <Plus size={18} />

          Add Application
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderKanban size={32} />
          </div>

          <h3>
            Create your first project
          </h3>

          <p>
            Applications belong to a
            project. Create a project
            before adding your first
            application.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={
              onCreateProject
            }
          >
            <Plus size={17} />

            Create Project
          </button>
        </div>
      ) : (
        <>
          <div className="project-selector-card">
            <div>
              <span className="field-label">
                PROJECT
              </span>

              <strong>
                {projects.find(
                  (project) =>
                    project.id ===
                    selectedProjectId,
                )?.name ||
                  "Select project"}
              </strong>
            </div>

            <select
              value={
                selectedProjectId ??
                ""
              }
              onChange={(event) =>
                setSelectedProjectId(
                  Number(
                    event.target.value,
                  ),
                )
              }
            >
              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {loadingApplications ? (
            <div className="page-loading small">
              <div className="loading-spinner" />

              <p>
                Loading applications...
              </p>
            </div>
          ) : applications.length ===
            0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Globe size={30} />
              </div>

              <h3>
                No applications yet
              </h3>

              <p>
                Add your web application
                URL to begin AI-powered
                testing.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setShowAddApplication(
                    true,
                  )
                }
              >
                <Plus size={17} />

                Add Application
              </button>
            </div>
          ) : (
            <div className="application-grid">
              {applications.map(
                (application) => (
                  <ApplicationCard
                    key={
                      application.id
                    }
                    application={
                      application
                    }
                    projectId={
                      selectedProjectId!
                    }
                    onRefresh={
                      reloadApplications
                    }
                  />
                ),
              )}
            </div>
          )}
        </>
      )}

      {showAddApplication && (
        <AddApplicationModal
          projectId={
            selectedProjectId
          }
          onClose={() =>
            setShowAddApplication(
              false,
            )
          }
          onCreated={() => {
            setShowAddApplication(
              false,
            );

            reloadApplications();
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   APPLICATION CARD
========================================================= */

function ApplicationCard({
  application,
  projectId,
  onRefresh,
}: {
  application: Application;
  projectId: number;
  onRefresh: () => void;
}) {
  const [discovering, setDiscovering] =
    useState(false);

  async function handleDiscover() {
    try {
      setDiscovering(true);

      const response =
        await fetch(
          `http://127.0.0.1:8000/projects/${projectId}/applications/${application.id}/discover`,
          {
            method: "POST",
          },
        );

      if (!response.ok) {
        throw new Error(
          `Discovery failed with status ${response.status}`,
        );
      }

      alert(
        "Application discovery completed.",
      );

      onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        "Application discovery failed.",
      );
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="application-card">
      <div className="application-card-top">
        <div className="application-type-icon">
          <Globe size={22} />
        </div>

        <span className="web-badge">
          WEB
        </span>
      </div>

      <h3>
        {application.name}
      </h3>

      <a
        href={application.url}
        target="_blank"
        rel="noreferrer"
        className="application-url"
      >
        {application.url}
      </a>

      <div className="application-meta">
        <span>
          <ShieldCheck size={13} />

          Connected
        </span>

        <span>
          ID #{application.id}
        </span>
      </div>

      <div className="application-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handleDiscover}
          disabled={discovering}
        >
          <Activity size={16} />

          {discovering
            ? "Discovering..."
            : "Discover"}
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            alert(
              "AI Test Generator is available from the sidebar.",
            )
          }
        >
          <Sparkles size={16} />

          AI Tests
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ADD APPLICATION MODAL
========================================================= */

function AddApplicationModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: number | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!projectId) {
      setError(
        "Please select a project.",
      );

      return;
    }

    if (!name.trim()) {
      setError(
        "Application name is required.",
      );

      return;
    }

    if (!url.trim()) {
      setError(
        "Application URL is required.",
      );

      return;
    }

    try {
      setCreating(true);
      setError("");

      await createApplication(
        projectId,
        name.trim(),
        url.trim(),
      );

      onCreated();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create application.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal application-modal">
        <div className="modal-header">
          <div>
            <div className="modal-icon">
              <Globe size={21} />
            </div>

            <h2>
              Add Application
            </h2>

            <p>
              Connect a web application
              to your QA workspace.
            </p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="application-type-selected">
          <Globe size={19} />

          <div>
            <strong>
              Web Application
            </strong>

            <span>
              Test any application
              accessible through a URL.
            </span>
          </div>

          <span className="selected-check">
            ✓
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <label>
            Application Name
          </label>

          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder="e.g. Customer Portal"
          />

          <label>
            Application URL
          </label>

          <input
            value={url}
            onChange={(event) =>
              setUrl(
                event.target.value,
              )
            }
            placeholder="https://example.com"
            type="url"
          />

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={creating}
            >
              {creating
                ? "Connecting..."
                : "Connect Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   PROJECTS PAGE
========================================================= */

function ProjectsPage({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  onCreateProject,
}: {
  projects: Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (
    id: number,
  ) => void;
  onCreateProject: () => void;
}) {
  return (
    <div className="dashboard projects-page">
      <div className="page-intro">
        <div>
          <div className="eyebrow dark-eyebrow">
            <FolderKanban size={15} />

            PROJECT MANAGEMENT
          </div>

          <h2>Your Projects</h2>

          <p>
            Create and manage your QA
            automation projects from one
            workspace.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onCreateProject}
        >
          <Plus size={18} />

          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderKanban size={32} />
          </div>

          <h3>No projects yet</h3>

          <p>
            Create your first project to
            start building your automated
            QA workflow.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={onCreateProject}
          >
            <Plus size={18} />

            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const selected =
              selectedProjectId ===
              project.id;

            return (
              <div
                key={project.id}
                className={`project-management-card ${
                  selected
                    ? "selected"
                    : ""
                }`}
              >
                <div className="project-management-header">
                  <div className="project-management-icon">
                    <FolderKanban
                      size={22}
                    />
                  </div>

                  <span className="project-status">
                    <span className="status-dot" />
                    Active
                  </span>
                </div>

                <div className="project-management-content">
                  <h3>{project.name}</h3>

                  <p>
                    {project.description ||
                      "AI QA automation project"}
                  </p>

                  <span className="project-id">
                    Project #{project.id}
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    selected
                      ? "secondary-button"
                      : "primary-button"
                  }
                  onClick={() =>
                    setSelectedProjectId(
                      project.id,
                    )
                  }
                >
                  {selected
                    ? "Selected"
                    : "Select Project"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  projects,
  applications,
  onCreateProject,
}: {
  projects: Project[];
  applications: Application[];
  onCreateProject: () => void;
}) {
  return (
    <div className="dashboard">
      <div className="hero-section">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} />

            AI-POWERED QUALITY ENGINEERING
          </div>

          <h2>
            Build, test, and ship
            <br />
            with confidence.
          </h2>

          <p>
            Automate your QA workflow
            with AI-powered test
            generation, browser
            execution, and intelligent
            results analysis.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-button large"
              onClick={
                onCreateProject
              }
            >
              <Plus size={18} />

              Create Project
            </button>

            <button
              type="button"
              className="secondary-button large"
            >
              <PlayCircle size={18} />

              Explore Platform
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit">
            <div className="hero-center">
              <Bot size={40} />
            </div>

            <div className="orbit-node node-one">
              <Globe size={18} />
            </div>

            <div className="orbit-node node-two">
              <ClipboardCheck
                size={18}
              />
            </div>

            <div className="orbit-node node-three">
              <ShieldCheck
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={
            <FolderKanban
              size={21}
            />
          }
          label="Total Projects"
          value={String(
            projects.length,
          )}
          change={
            projects.length > 0
              ? "Active"
              : "Ready"
          }
        />

        <StatCard
          icon={<Globe size={21} />}
          label="Applications"
          value={String(
            applications.length,
          )}
          change={
            applications.length > 0
              ? "Connected"
              : "Ready"
          }
        />

        <StatCard
          icon={
            <ClipboardCheck
              size={21}
            />
          }
          label="Test Cases"
          value="0"
          change="Ready"
        />

        <StatCard
          icon={
            <BarChart3 size={21} />
          }
          label="Test Runs"
          value="0"
          change="Ready"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">
                PROJECTS
              </span>

              <h3>
                Recent Projects
              </h3>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={
                onCreateProject
              }
            >
              <Plus size={16} />

              New
            </button>
          </div>

          {projects.length ===
          0 ? (
            <div className="empty-card">
              <FolderKanban
                size={30}
              />

              <strong>
                No projects yet
              </strong>

              <span>
                Create your first
                project to start
                building automated
                tests.
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={
                  onCreateProject
                }
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="project-list">
              {projects
                .slice(0, 5)
                .map(
                  (project) => (
                    <div
                      className="project-row"
                      key={
                        project.id
                      }
                    >
                      <div className="project-icon">
                        <FolderKanban
                          size={18}
                        />
                      </div>

                      <div className="project-details">
                        <strong>
                          {
                            project.name
                          }
                        </strong>

                        <span>
                          {project.description ||
                            "AI QA Project"}
                        </span>
                      </div>

                      <div className="project-status">
                        <span className="status-dot" />

                        Active
                      </div>
                    </div>
                  ),
                )}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">
                ACTIVITY
              </span>

              <h3>
                Recent Activity
              </h3>
            </div>
          </div>

          <div className="activity-list">
            <ActivityRow
              icon={
                <Bot size={17} />
              }
              title="AI Engine initialized"
              time="Ready for testing"
            />

            <ActivityRow
              icon={
                <ShieldCheck
                  size={17}
                />
              }
              title="Backend connected"
              time="FastAPI service online"
            />

            <ActivityRow
              icon={
                <Sparkles
                  size={17}
                />
              }
              title="AI Test Generator"
              time="Ready for requirements"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  change,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-change">
          {change}
        </span>
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({
  icon,
  title,
  time,
}: {
  icon: ReactNode;
  title: string;
  time: string;
}) {
  return (
    <div className="activity-row">
      <div className="activity-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>

        <span>{time}</span>
      </div>
    </div>
  );
}

/* =========================================================
   TEST RESULTS PAGE
========================================================= */

function TestResultsPage({
  selectedProjectId,
}: {
  selectedProjectId: number | null;
}) {
  const [results, setResults] = useState<
    Array<{
      testCase: TestCase;
      application: Application;
      run: TestRun;
    }>
  >([]);

  const [selectedResult, setSelectedResult] =
    useState<{
      testCase: TestCase;
      application: Application;
      run: TestRun;
    } | null>(null);

  const [runSteps, setRunSteps] =
    useState<TestRunStep[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingSteps, setLoadingSteps] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (selectedProjectId === null) {
      setResults([]);
      return;
    }

    loadResults(selectedProjectId);
  }, [selectedProjectId]);

  async function loadResults(
    projectId: number,
  ) {
    try {
      setLoading(true);
      setError(null);

      const projectApplications =
        await getApplications(projectId);

      const allResults: Array<{
        testCase: TestCase;
        application: Application;
        run: TestRun;
      }> = [];

      for (const application of projectApplications) {
        const testCases =
          await getTestCases(
            projectId,
            application.id,
          );

        for (const testCase of testCases) {
          const runs =
            await getTestRuns(
              projectId,
              application.id,
              testCase.id,
            );

          for (const run of runs) {
            allResults.push({
              testCase,
              application,
              run,
            });
          }
        }
      }

      allResults.sort(
        (a, b) =>
          new Date(
            b.run.started_at,
          ).getTime() -
          new Date(
            a.run.started_at,
          ).getTime(),
      );

      setResults(allResults);

      if (allResults.length > 0) {
        await selectResult(allResults[0]);
      } else {
        setSelectedResult(null);
        setRunSteps([]);
      }
    } catch (err) {
      console.error(
        "Failed to load test results:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load test results.",
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function selectResult(
    result: {
      testCase: TestCase;
      application: Application;
      run: TestRun;
    },
  ) {
    setSelectedResult(result);
    setRunSteps([]);

    try {
      setLoadingSteps(true);

      const steps =
        await getTestRunSteps(
          result.application.project_id,
          result.application.id,
          result.testCase.id,
          result.run.id,
        );

      setRunSteps(steps);
    } catch (err) {
      console.error(
        "Failed to load run steps:",
        err,
      );

      setRunSteps([]);
    } finally {
      setLoadingSteps(false);
    }
  }

  const totalRuns = results.length;

  const passedRuns =
    results.filter(
      (item) =>
        item.run.status.toLowerCase() ===
        "passed",
    ).length;

  const failedRuns =
    results.filter(
      (item) =>
        item.run.status.toLowerCase() ===
        "failed",
    ).length;

  const runningRuns =
    results.filter(
      (item) =>
        item.run.status.toLowerCase() ===
          "running" ||
        item.run.status.toLowerCase() ===
          "pending",
    ).length;

  const passRate =
    totalRuns > 0
      ? Math.round(
          (passedRuns / totalRuns) * 100,
        )
      : 0;

  function formatDate(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleString();
  }

  function formatDuration(
    run: TestRun,
  ) {
    if (!run.finished_at) {
      return "Running";
    }

    const duration =
      new Date(
        run.finished_at,
      ).getTime() -
      new Date(
        run.started_at,
      ).getTime();

    if (duration < 1000) {
      return `${duration} ms`;
    }

    return `${(
      duration / 1000
    ).toFixed(2)} s`;
  }

  function statusClass(
    status: string,
  ) {
    const normalized =
      status.toLowerCase();

    if (
      normalized === "passed" ||
      normalized === "success"
    ) {
      return "result-status passed";
    }

    if (
      normalized === "failed" ||
      normalized === "error"
    ) {
      return "result-status failed";
    }

    return "result-status running";
  }

  return (
    <div className="test-results-page">
      {/* SUMMARY */}

      <div className="results-summary">
        <div className="result-stat-card">
          <div className="result-stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Total Runs</span>
            <strong>{totalRuns}</strong>
          </div>
        </div>

        <div className="result-stat-card">
          <div className="result-stat-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Passed</span>
            <strong>{passedRuns}</strong>
          </div>
        </div>

        <div className="result-stat-card">
          <div className="result-stat-icon">
            <XCircle size={20} />
          </div>

          <div>
            <span>Failed</span>
            <strong>{failedRuns}</strong>
          </div>
        </div>

        <div className="result-stat-card">
          <div className="result-stat-icon">
            <Gauge size={20} />
          </div>

          <div>
            <span>Pass Rate</span>
            <strong>
              {passRate}%
            </strong>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="results-layout">
        <section className="results-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Test Runs</h2>

              <p>
                Actual executions from
                your FastAPI backend.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                if (
                  selectedProjectId !==
                  null
                ) {
                  loadResults(
                    selectedProjectId,
                  );
                }
              }}
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="results-empty">
              <Activity
                size={24}
                className="spin"
              />

              <p>
                Loading test results...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="results-error">
              <AlertCircle size={20} />

              <span>{error}</span>
            </div>
          )}

          {!loading &&
            !error &&
            results.length === 0 && (
              <div className="results-empty">
                <BarChart3 size={42} />

                <h3>
                  No test runs yet
                </h3>

                <p>
                  Execute a test case
                  from Test Execution
                  to see results here.
                </p>
              </div>
            )}

          {!loading &&
            results.length > 0 && (
              <div className="results-table">
                {results.map(
                  (result) => {
                    const selected =
                      selectedResult?.run
                        .id ===
                      result.run.id;

                    return (
                      <button
                        type="button"
                        key={
                          result.run.id
                        }
                        className={`result-row ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          selectResult(
                            result,
                          )
                        }
                      >
                        <div className="result-row-main">
                          <strong>
                            {
                              result
                                .testCase
                                .name
                            }
                          </strong>

                          <span>
                            {
                              result
                                .application
                                .name
                            }
                          </span>
                        </div>

                        <span
                          className={statusClass(
                            result.run
                              .status,
                          )}
                        >
                          {
                            result.run
                              .status
                          }
                        </span>

                        <span className="result-duration">
                          {formatDuration(
                            result.run,
                          )}
                        </span>

                        <span className="result-date">
                          {formatDate(
                            result.run
                              .started_at,
                          )}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            )}
        </section>

        {/* DETAILS */}

        <section className="result-details-panel">
          {!selectedResult ? (
            <div className="results-empty">
              <FileText size={42} />

              <h3>
                Select a test run
              </h3>

              <p>
                Select an execution to
                inspect its individual
                steps.
              </p>
            </div>
          ) : (
            <>
              <div className="panel-heading">
                <div>
                  <h2>
                    {
                      selectedResult
                        .testCase
                        .name
                    }
                  </h2>

                  <p>
                    Run #
                    {
                      selectedResult
                        .run.id
                    }
                  </p>
                </div>

                <span
                  className={statusClass(
                    selectedResult.run
                      .status,
                  )}
                >
                  {
                    selectedResult.run
                      .status
                  }
                </span>
              </div>

              {selectedResult.run
                .error_message && (
                <div className="run-error">
                  <AlertCircle
                    size={20}
                  />

                  <div>
                    <strong>
                      Execution Error
                    </strong>

                    <p>
                      {
                        selectedResult
                          .run
                          .error_message
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="run-meta">
                <div>
                  <span>
                    Application
                  </span>

                  <strong>
                    {
                      selectedResult
                        .application
                        .name
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Started
                  </span>

                  <strong>
                    {formatDate(
                      selectedResult.run
                        .started_at,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Duration
                  </span>

                  <strong>
                    {formatDuration(
                      selectedResult.run,
                    )}
                  </strong>
                </div>
              </div>

              <div className="run-steps">
                <h3>
                  Execution Steps
                </h3>

                {loadingSteps && (
                  <div className="steps-loading">
                    Loading execution
                    steps...
                  </div>
                )}

                {!loadingSteps &&
                  runSteps.length ===
                    0 && (
                    <div className="steps-loading">
                      No execution steps
                      available.
                    </div>
                  )}

                {!loadingSteps &&
                  runSteps.map(
                    (step, index) => (
                      <div
                        key={step.id}
                        className="execution-step"
                      >
                        <div className="step-number">
                          {index + 1}
                        </div>

                        <div className="step-status">
                          {step.status
                            .toLowerCase() ===
                          "passed" ? (
                            <CheckCircle2
                              size={20}
                            />
                          ) : (
                            <XCircle
                              size={20}
                            />
                          )}
                        </div>

                        <div className="step-content">
                          <strong>
                            Step{" "}
                            {index + 1}
                          </strong>

                          <p>
                            {step.message ||
                              "No message returned."}
                          </p>

                          {step.duration_ms !==
                            null && (
                            <span>
                              {
                                step.duration_ms
                              }{" "}
                              ms
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </>
          )}
        </section>
      </div>

      {runningRuns > 0 && (
        <div className="running-notice">
          <Clock3 size={18} />

          {runningRuns} test run
          {runningRuns > 1
            ? "s"
            : ""}{" "}
          currently running.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PLACEHOLDER PAGE
========================================================= */

function PlaceholderPage({
  page,
}: {
  page: string;
}) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <Bot size={40} />
      </div>

      <h2>{page}</h2>

      <p>
        This module is ready for
        implementation. We will connect
        it to the FastAPI backend next.
      </p>

      <button
        type="button"
        className="primary-button"
      >
        <Sparkles size={18} />

        AI Module Coming Next
      </button>
    </div>
  );
}

/* =========================================================
   CREATE PROJECT MODAL
========================================================= */

function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    name: string,
    description: string,
  ) => void;
}) {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>
              Create New Project
            </h2>

            <p>
              Start a new AI-powered QA
              project.
            </p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <label>
          Project Name
        </label>

        <input
          value={name}
          onChange={(event) =>
            setName(
              event.target.value,
            )
          }
          placeholder="e.g. E-Commerce Platform"
        />

        <label>
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          placeholder="Describe your application or testing goals..."
        />

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              onCreate(
                name.trim(),
                description.trim(),
              )
            }
            disabled={!name.trim()}
          >
            <Plus size={17} />

            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;