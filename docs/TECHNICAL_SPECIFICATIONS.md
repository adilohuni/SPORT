# PromptGrid Studio — Technical Specifications & Implementation Guide

## 1. Core Data Models

### 1.1 AgentRun Model

```typescript
// File: src/types/agentRun.ts

export interface AgentRun {
  // Identifiers
  id: string; // UUID, extracted from URL: agentRunId
  taskId: string; // UUID, extracted from URL: taskId
  
  // Task Definition
  taskPrompt: string; // The original task description/prompt
  taskNotes?: string; // Additional context or notes
  
  // Metadata
  status: 'draft' | 'in-review' | 'approved' | 'archived';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string; // Annotator's user ID/name
  reviewedBy?: string; // QA reviewer's ID
  reviewedAt?: string; // ISO 8601
  
  // User & Workflow
  currentAnnotator?: string; // Who's working on it now
  assignedTo?: string; // Assigned reviewer
  
  // Run Content
  subtasks: Subtask[];
  steps: Step[];
  
  // Statistics
  totalSteps: number;
  completedSteps: number;
  flaggedSteps: number;
  averageQualityScore?: number; // 0-100
}

export interface Subtask {
  id: string; // UUID or generated incrementally
  index: number; // 0-based order
  title: string; // e.g., "Search for product"
  description: string; // Longer explanation
  stepIndices: number[]; // Which steps belong to this subtask [0, 3, 7]
  status: 'pending' | 'in-progress' | 'annotated' | 'reviewed' | 'approved';
  notes?: string;
}

export interface Step {
  // Identifiers
  id: string; // UUID
  index: number; // 0-based, within the run
  runId: string; // Reference to parent AgentRun
  subtaskId?: string; // Which subtask this belongs to
  
  // Action Data
  action: {
    type: 'click' | 'type' | 'scroll' | 'wait' | 'select' | 'navigate' | 'hover' | 'unknown';
    target?: string; // CSS selector, XPath, or human-readable element description
    value?: string; // For type, select, navigate actions
    description?: string; // Human-readable action summary
  };
  
  // Screenshot
  screenshot: {
    url: string; // URL (can be CDN, S3, or data URI for embedded)
    alt?: string; // Accessibility text
    thumbnailUrl?: string; // Smaller preview for list view
    timestamp?: string; // When the screenshot was captured
  };
  
  // CoT Thoughts (Core)
  thoughts: {
    thought1: string; // Screenshot diff / start state
    thought2: string; // Current state assessment
    thought3: string; // Next action / return info
  };
  
  // Optional: Extended reasoning
  extendedThoughts?: {
    higherReasoning?: string; // Additional inference beyond basic observation
    modelMemory?: string; // Recall from prior steps
    hypothesis?: string; // Why this action should work
  };
  
  // Validation & QA
  validationStatus: {
    passed: boolean;
    timestamp: string; // ISO 8601, when validated
    errors: ValidationError[];
  };
  
  issues: Issue[]; // Flagged problems (grammar, logic, clarity, etc.)
  
  // Versioning & Tracking
  versions: StepVersion[]; // History of edits
  currentVersion: number; // Which version is active
  lastEditedBy?: string;
  lastEditedAt?: string; // ISO 8601
  
  // Metadata
  createdAt: string;
  comments: Comment[];
}

export interface StepVersion {
  versionNumber: number;
  thoughts: {
    thought1: string;
    thought2: string;
    thought3: string;
  };
  extendedThoughts?: {
    higherReasoning?: string;
    modelMemory?: string;
    hypothesis?: string;
  };
  editedBy: string;
  editedAt: string;
  changesSummary?: string; // Human-readable diff summary
}

export interface ValidationError {
  code: string; // e.g., 'MISSING_FIRST_PERSON', 'NO_VISIBLE_ELEMENTS'
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion?: string;
}

export interface Issue {
  id: string;
  type: 'grammatical' | 'spelling' | 'formatting' | 'logic' | 'missing-context' | 'contradiction' | 'accessibility';
  severity: 'minor' | 'major';
  description: string;
  charStart?: number; // Position in thought text
  charEnd?: number;
  suggestion?: string;
  autoFixable: boolean;
  fixApplied?: boolean;
}

export interface Comment {
  id: string;
  stepIndex: number;
  author: string;
  authorRole: 'annotator' | 'reviewer' | 'admin';
  type: 'question' | 'suggestion' | 'correction' | 'approval' | 'note';
  text: string;
  resolved: boolean;
  createdAt: string;
  replies: Comment[]; // Threaded replies
  
  // If this is a suggestion, track acceptance
  suggestion?: {
    type: 'thought1' | 'thought2' | 'thought3';
    originalText: string;
    suggestedText: string;
    status: 'pending' | 'accepted' | 'rejected';
    acceptedAt?: string;
  };
}
```

### 1.2 User & Session Model

```typescript
export interface User {
  id: string; // UUID or username
  name: string;
  email: string;
  role: 'annotator' | 'reviewer' | 'qa_manager' | 'admin';
  permissions: {
    canCreateRun: boolean;
    canEditOwnRuns: boolean;
    canEditAllRuns: boolean;
    canApproveRuns: boolean;
    canExportData: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
  };
  metadata?: {
    department?: string;
    team?: string;
    joinedAt: string;
  };
}

export interface Session {
  id: string; // Session token
  userId: string;
  expiresAt: string;
  lastActiveAt: string;
}
```

### 1.3 Quality & Analytics Models

```typescript
export interface StepQualityScore {
  stepId: string;
  score: number; // 0-100
  breakdown: {
    structure: number; // 3-part present?
    clarity: number; // Grammar, readability
    completeness: number; // All required info?
    accuracy: number; // Accurate to screenshot?
  };
  timestamp: string;
  evaluatedBy?: string; // AI evaluator or human reviewer
}

export interface RunQualityReport {
  runId: string;
  overallScore: number; // Avg of step scores
  issuesFound: number;
  issuesResolved: number;
  timeSpentAnnotating: number; // in minutes
  timeSpentReviewing: number;
  annotator: string;
  reviewer?: string;
  generatedAt: string;
}

export interface AnnotatorMetrics {
  annotatorId: string;
  totalRunsAnnotated: number;
  totalStepsAnnotated: number;
  averageQualityScore: number;
  averageTimePerStep: number; // minutes
  mostCommonIssues: Array<{ issueType: string; count: number }>;
  consistencyScore: number; // How consistent across runs?
  period: { from: string; to: string };
}
```

### 1.4 Export & Collection Models

```typescript
export interface RunCollection {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  
  // Filter criteria (how this collection was created)
  filterCriteria: {
    statuses: string[]; // e.g., ['approved']
    dateRange?: { from: string; to: string };
    qualityScoreMin?: number;
    tags?: string[];
    annotators?: string[];
    domains?: string[]; // e.g., ['ecommerce', 'saas']
  };
  
  // Runs in this collection
  runIds: string[];
  
  // Metadata
  metadata: {
    totalRuns: number;
    totalSteps: number;
    averageQualityScore: number;
    coverageSummary: string; // Human-readable summary
  };
  
  exportedAt?: string;
  exportFormat?: 'json' | 'csv' | 'markdown';
  anonymized: boolean;
}

export interface ExportFormat {
  format: 'json' | 'csv' | 'markdown' | 'jsonl';
  includeScreenshots: boolean; // URLs or embedded?
  includeMetadata: boolean;
  anonymize: boolean; // Remove author names, timestamps?
  filterStatus?: string[];
  minQualityScore?: number;
}
```

---

## 2. Component Architecture

### 2.1 New Component Tree

```
App (root)
├── Layout
│   ├── Header
│   │   ├── Logo / Title
│   │   ├── UserMenu
│   │   └── Notifications
│   ├── Navigation (breadcrumb, back button)
│   ├── MainContent (dual-panel layout)
│   │   ├── LeftPanel (scrollable run browser)
│   │   │   ├── RunHeader
│   │   │   ├── TaskPromptDisplay
│   │   │   ├── SubtaskAccordion (collapsible)
│   │   │   │   ├── SubtaskHeader
│   │   │   │   └── StepList (virtualized)
│   │   │   │       ├── StepListItem (click → load in right panel)
│   │   │   │       ├── StepListItem
│   │   │   │       └── ... (scrollable)
│   │   │   └── StepSearch / Filter
│   │   └── RightPanel (static editor)
│   │       ├── ScreenshotViewer
│   │       ├── ActionDisplay
│   │       ├── ThoughtEditor (3 text areas)
│   │       ├── ExtendedThoughtsEditor (optional)
│   │       ├── ValidationPanel
│   │       ├── ToolsPanel
│   │       │   ├── GrammarChecker
│   │       │   ├── JSONFormatter
│   │       │   ├── TemplateQuickInsert
│   │       │   ├── IssueTracker
│   │       │   └── ReferencePanel (guidelines, examples)
│   │       ├── CommentsPanel (threaded)
│   │       └── NavigationButtons (prev, next, save, submit)
│   └── Footer
│       ├── Status indicators
│       └── Help / Shortcuts
└── Modals
    ├── TaskDecompositionModal
    ├── TemplateLibraryModal
    ├── ExportModal
    ├── ConfirmDialog
    └── SuggestChangeDialog
```

### 2.2 Key Component Specs

#### LeftPanel / RunBrowser

**Props:**
```typescript
interface RunBrowserProps {
  run: AgentRun;
  currentStepIndex: number;
  onStepSelect: (stepIndex: number) => void;
  onSubtaskSelect: (subtaskId: string) => void;
  mode: 'edit' | 'review';
  userRole: UserRole;
}
```

**Features:**
- Virtual scrolling for 100+ steps
- Search/filter steps by action type or keyword
- Expand/collapse subtasks
- Visual progress indicators
- Drag-to-reorder steps (optional)

#### RightPanel / StepEditor

**Props:**
```typescript
interface StepEditorProps {
  step: Step;
  run: AgentRun;
  mode: 'edit' | 'review';
  userRole: UserRole;
  onUpdate: (updatedStep: Step) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (action: 'mark-complete' | 'flag-review' | 'request-changes') => void;
}
```

**Sections:**
1. Screenshot viewer (zoom, fullscreen)
2. Action display (read-only or editable)
3. Thought 1, 2, 3 text areas
4. Extended thoughts (collapsible)
5. Validation status & issues
6. Comments & suggestions sidebar
7. Navigation & submit buttons

#### GrammarChecker Component

**Props:**
```typescript
interface GrammarCheckerProps {
  text: string; // Thought text
  onIssueDetected: (issue: Issue) => void;
  onAutoFix: (originalText: string, fixedText: string) => void;
  strictMode: boolean; // Lenient vs. strict checking
}
```

**Features:**
- Real-time checking (debounced)
- Inline highlights
- Suggestion dropdown
- Batch fix multiple issues
- Integration with LanguageTool API

#### TemplateQuickInsert Component

**Props:**
```typescript
interface TemplateQuickInsertProps {
  templates: CoTTemplate[];
  stepAction: Step['action'];
  stepIndex: number;
  isFirstStep: boolean;
  isFinalStep: boolean;
  onSelectTemplate: (template: CoTTemplate, placeholders: Record<string, string>) => void;
}
```

**Features:**
- Filter templates by step position
- Preview template with placeholders
- Interactive placeholder filling
- Auto-populate thoughts

#### ValidationPanel Component

**Props:**
```typescript
interface ValidationPanelProps {
  step: Step;
  validationRules: ValidationRule[];
  onIssueSelected: (issue: ValidationError) => void;
}
```

**Checks:**
- ✓/✗ Three thoughts present
- ✓/✗ First-person "I" in Thought 1
- ✓/✗ Visible element references in Thought 2
- ✓/✗ Concrete action in Thought 3
- ✓/✗ No ambiguous pronouns
- ✓/✗ If final step, error message format
- ✓/✗ Grammar score > threshold

---

## 3. State Management

### 3.1 Zustand Store Structure

```typescript
// File: src/store/runStore.ts

import create from 'zustand';

interface RunStoreState {
  // Loaded Run
  currentRun: AgentRun | null;
  currentStepIndex: number;
  
  // Edit State
  editMode: 'view' | 'edit' | 'review';
  unsavedChanges: boolean;
  
  // UI State
  leftPanelCollapsed: boolean;
  commentsPanelOpen: boolean;
  validationPanelOpen: boolean;
  selectedSubtaskId?: string;
  
  // Actions
  loadRun: (agentRunId: string, taskId: string) => Promise<void>;
  selectStep: (stepIndex: number) => void;
  updateStep: (stepIndex: number, updates: Partial<Step>) => void;
  saveStep: (stepIndex: number) => Promise<void>;
  saveRun: () => Promise<void>;
  submitRunForReview: () => Promise<void>;
  approveRun: (reviewerNotes?: string) => Promise<void>;
  
  // UI Actions
  toggleLeftPanel: () => void;
  toggleCommentsPanel: () => void;
  setEditMode: (mode: 'view' | 'edit' | 'review') => void;
  
  // Cleanup
  clearRun: () => void;
}

export const useRunStore = create<RunStoreState>((set, get) => ({
  // State initialization...
  currentRun: null,
  currentStepIndex: 0,
  editMode: 'view',
  unsavedChanges: false,
  leftPanelCollapsed: false,
  commentsPanelOpen: false,
  validationPanelOpen: true,
  
  // Async action: Load run from backend or localStorage
  loadRun: async (agentRunId, taskId) => {
    try {
      const run = await fetchRun(agentRunId, taskId);
      set({ currentRun: run, currentStepIndex: 0 });
    } catch (error) {
      console.error('Failed to load run:', error);
    }
  },
  
  // Update step in-memory
  updateStep: (stepIndex, updates) => {
    set((state) => {
      if (!state.currentRun) return state;
      const newRun = { ...state.currentRun };
      newRun.steps[stepIndex] = {
        ...newRun.steps[stepIndex],
        ...updates,
        lastEditedAt: new Date().toISOString(),
      };
      return { currentRun: newRun, unsavedChanges: true };
    });
  },
  
  // Save single step to backend
  saveStep: async (stepIndex) => {
    const state = get();
    if (!state.currentRun) return;
    const step = state.currentRun.steps[stepIndex];
    await updateStepInBackend(state.currentRun.id, step);
    set({ unsavedChanges: false });
  },
  
  // Save entire run
  saveRun: async () => {
    const state = get();
    if (!state.currentRun) return;
    await updateRunInBackend(state.currentRun);
    set({ unsavedChanges: false });
  },
  
  // Other actions...
}));
```

### 3.2 UI Store (Local)

```typescript
// File: src/store/uiStore.ts

interface UIStoreState {
  theme: 'light' | 'dark';
  sidebarWidth: number; // pixels
  grammarCheckingEnabled: boolean;
  strictMode: boolean;
  notifications: Notification[];
  
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarWidth: (width: number) => void;
  addNotification: (notif: Notification) => void;
  removeNotification: (id: string) => void;
}
```

---

## 4. Backend API Endpoints (Future)

### 4.1 Run Management

```
GET  /api/runs?agentRunId=:id&taskId=:id
POST /api/runs
PATCH /api/runs/:id
GET  /api/runs/:id/steps/:stepIndex
PATCH /api/runs/:id/steps/:stepIndex
POST /api/runs/:id/submit-for-review
POST /api/runs/:id/approve (reviewer only)
POST /api/runs/:id/archive

GET  /api/runs/:id/comments
POST /api/runs/:id/comments
PATCH /api/runs/:id/comments/:commentId
```

### 4.2 Collections & Export

```
POST /api/collections
GET  /api/collections
GET  /api/collections/:id
POST /api/collections/:id/export
  ?format=json|csv|markdown
  &anonymize=true|false
  &includeScreenshots=true|false

GET  /api/runs/:id/export (single run)
```

### 4.3 Templates

```
GET  /api/templates
GET  /api/templates/:id
POST /api/templates (admin only)
PATCH /api/templates/:id (admin only)
DELETE /api/templates/:id (admin only)
```

### 4.4 Analytics

```
GET  /api/analytics/runs (curator dashboard)
GET  /api/analytics/annotators/:userId
GET  /api/analytics/quality-trends
```

---

## 5. URL Routing Strategy

### 5.1 Routes (React Router)

```typescript
// File: src/router.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const router = (
  <BrowserRouter>
    <Routes>
      {/* Landing / Auth */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Main Application */}
      <Route element={<ProtectedLayout />}>
        {/* Agent Run Editor */}
        <Route
          path="/agent-runs"
          element={<RunEditor />}
          loader={async ({ searchParams }) => {
            const agentRunId = searchParams.get('agentRunId');
            const taskId = searchParams.get('taskId');
            const qa = searchParams.get('qa') === 'true';
            // Load run data
            return { agentRunId, taskId, qa };
          }}
        />
        
        {/* Collections & Export */}
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        
        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        
        {/* Template Management */}
        <Route path="/templates" element={<TemplatesLibrary />} />
        
        {/* User Settings */}
        <Route path="/settings" element={<UserSettings />} />
      </Route>
      
      {/* Error Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default router;
```

### 5.2 URL Pattern Explanation

**Current Pattern (from existing app):**
```
/agent-runs?agentRunId=5412e928-9b96-4062-887d-69ab101b675a&taskId=7d09256d-2a44-4654-98c6-dd80f96db2f4&qa=true
```

**Parameters:**
- `agentRunId` (UUID): Unique ID for this agent execution
- `taskId` (UUID): The task this run is associated with
- `qa` (boolean, default false): Whether reviewer is in QA mode
  - If `qa=false`: Annotator mode (create/edit)
  - If `qa=true`: Reviewer mode (suggest/approve)

**Extended Pattern (future):**
```
/agent-runs?agentRunId=:id&taskId=:id&qa=:bool&step=:index&view=:mode
```
- `step`: Jump to specific step number
- `view`: 'editor' (side-by-side) or 'fullscreen' (step editor only)

---

## 6. Validation & Error Handling

### 6.1 CoT Structure Validation Rules

```typescript
// File: src/utils/cotValidation.ts

export interface ValidationRule {
  id: string;
  name: string;
  check: (thought: string, step: Step, stepIndex: number) => ValidationError | null;
  severity: 'info' | 'warning' | 'error';
}

const COT_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'first_person_usage',
    name: 'First-person "I" usage',
    check: (thought, step, stepIndex) => {
      if (!thought.includes('I ') && !thought.includes("I'")) {
        return {
          code: 'MISSING_FIRST_PERSON',
          severity: 'error',
          message: 'Thought should use first-person "I" to represent the agent.',
          suggestion: 'Start with "I am", "I see", "I need", "I should", etc.',
        };
      }
      return null;
    },
  },
  
  {
    id: 'visible_elements',
    name: 'Reference to visible elements',
    check: (thought, step, stepIndex) => {
      // Only enforce on Thought 2
      if (step.thoughts.thought2 === thought) {
        const hasElement = /can see|visible|see|element|button|field|link|menu/i.test(thought);
        if (!hasElement) {
          return {
            code: 'NO_VISIBLE_ELEMENTS',
            severity: 'warning',
            message: 'Thought 2 should mention specific visible elements.',
            suggestion: 'Reference elements like: "I see the search button", "I can see the email field", etc.',
          };
        }
      }
      return null;
    },
  },
  
  {
    id: 'action_specificity',
    name: 'Specific action in Thought 3',
    check: (thought, step, stepIndex) => {
      // Only enforce on Thought 3
      if (step.thoughts.thought3 === thought) {
        const hasAction = /should|will|let me|going to/i.test(thought);
        if (!hasAction) {
          return {
            code: 'NO_CONCRETE_ACTION',
            severity: 'error',
            message: 'Thought 3 must state a concrete action.',
            suggestion: 'Include "I should <action> to <expected result>".',
          };
        }
      }
      return null;
    },
  },
  
  {
    id: 'final_step_return',
    name: 'Final step has return or error',
    check: (thought, step, stepIndex) => {
      if (stepIndex === step.run.steps.length - 1) {
        const isFinalThought = step.thoughts.thought3 === thought;
        if (isFinalThought) {
          const hasReturn = /return|throw|error|complete|done/i.test(thought);
          if (!hasReturn) {
            return {
              code: 'NO_FINAL_RETURN',
              severity: 'error',
              message: 'Final step must specify what to return or error to throw.',
              suggestion: 'Include "return", "throw", or "error" statement.',
            };
          }
        }
      }
      return null;
    },
  },
  
  // More rules...
];

export function validateCoT(step: Step, stepIndex: number, allSteps: Step[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  Object.values(step.thoughts).forEach((thought) => {
    COT_VALIDATION_RULES.forEach((rule) => {
      const error = rule.check(thought, { ...step, run: { steps: allSteps } }, stepIndex);
      if (error) errors.push(error);
    });
  });
  
  return errors;
}
```

### 6.2 Error Boundary

```typescript
// File: src/components/ErrorBoundary.tsx

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{this.state.error?.message}</AlertDescription>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## 7. Performance Optimization

### 7.1 Virtualization for Large Step Lists

```typescript
// File: src/components/VirtualStepList.tsx

import { FixedSizeList } from 'react-window';

export function VirtualStepList({ steps, onStepSelect, currentStepIndex }) {
  const Row = ({ index, style }) => (
    <div style={style} onClick={() => onStepSelect(index)}>
      <StepListItem
        step={steps[index]}
        isActive={index === currentStepIndex}
      />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={steps.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 7.2 Memoization & Lazy Loading

```typescript
// Memoize components to prevent unnecessary re-renders
export const ThoughtEditor = React.memo(({ thought, onChange }) => {
  return <textarea value={thought} onChange={onChange} />;
});

// Lazy load heavy components
const ExportModal = React.lazy(() => import('./ExportModal'));

// Defer non-critical updates
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  // Use deferredQuery for search results
}
```

### 7.3 Caching Strategy

```typescript
// File: src/utils/cache.ts

import { useQuery } from '@tanstack/react-query';

export function useRun(agentRunId: string) {
  return useQuery({
    queryKey: ['run', agentRunId],
    queryFn: () => fetchRun(agentRunId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    staleTime: 1 * 60 * 60 * 1000, // 1 hour (templates rarely change)
  });
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// File: src/__tests__/utils/cotValidation.test.ts

import { validateCoT } from '@/utils/cotValidation';

describe('CoT Validation', () => {
  test('should fail if missing first-person "I"', () => {
    const step = {
      thoughts: {
        thought1: 'The page loaded.',
        thought2: 'Need to click button.',
        thought3: 'Should click the submit button.',
      },
    };
    const errors = validateCoT(step, 0, [step]);
    expect(errors).toContainEqual(
      expect.objectContaining({ code: 'MISSING_FIRST_PERSON' })
    );
  });

  test('should pass if first-person "I" is present', () => {
    const step = {
      thoughts: {
        thought1: 'I am on the homepage.',
        thought2: 'I need to click the submit button.',
        thought3: 'I should click the button to submit.',
      },
    };
    const errors = validateCoT(step, 0, [step]);
    expect(errors).toHaveLength(0);
  });
});
```

### 8.2 Integration Tests

```typescript
// File: src/__tests__/integration/runEditor.test.ts

import { render, screen, fireEvent } from '@testing-library/react';
import { RunEditor } from '@/components/RunEditor';

describe('RunEditor', () => {
  test('loads run from URL params and displays first step', async () => {
    render(
      <RunEditor params={{ agentRunId: 'abc123', taskId: 'xyz789' }} />
    );
    
    await screen.findByText(/Search for product/);
    expect(screen.getByDisplayValue(/I am on Amazon/)).toBeInTheDocument();
  });

  test('saves step changes to backend', async () => {
    const { rerender } = render(
      <RunEditor params={{ agentRunId: 'abc123', taskId: 'xyz789' }} />
    );
    
    const thoughtInput = screen.getByDisplayValue(/I am on Amazon/);
    fireEvent.change(thoughtInput, { target: { value: 'I am on eBay.' } });
    fireEvent.click(screen.getByText('Save'));
    
    await screen.findByText('Step saved');
  });
});
```

---

## 9. Security Considerations

### 9.1 Input Sanitization

```typescript
// File: src/utils/sanitize.ts

import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

export function sanitizeCoT(cot: string): string {
  // Remove potentially harmful scripts/tags while preserving text
  return cot
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
}
```

### 9.2 Authentication & Authorization

```typescript
// File: src/middleware/auth.ts

export async function requireAuth(request: Request) {
  const session = getSession(request);
  if (!session) {
    throw redirect('/login');
  }
  return session;
}

export async function requireRole(request: Request, roles: string[]) {
  const session = await requireAuth(request);
  if (!roles.includes(session.user.role)) {
    throw new Error('Insufficient permissions');
  }
  return session;
}
```

---

## 10. Accessibility (A11y)

### 10.1 ARIA Labels & Semantic HTML

```typescript
export function ThoughtEditor({ thoughtNumber, value, onChange }) {
  return (
    <div>
      <label htmlFor={`thought-${thoughtNumber}`}>
        Thought {thoughtNumber}
        <span className="text-red-500" aria-label="required">*</span>
      </label>
      <textarea
        id={`thought-${thoughtNumber}`}
        aria-describedby={`thought-${thoughtNumber}-help`}
        value={value}
        onChange={onChange}
      />
      <div id={`thought-${thoughtNumber}-help`} className="text-sm text-gray-600">
        Use first-person "I" and describe visible elements.
      </div>
    </div>
  );
}
```

### 10.2 Keyboard Navigation

```typescript
// File: src/hooks/useKeyboardShortcuts.ts

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveCurrentStep();
            break;
          case 'n':
            e.preventDefault();
            goToNextStep();
            break;
          case 'p':
            e.preventDefault();
            goToPreviousStep();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

---

## 11. Deployment & DevOps

### 11.1 Environment Configuration

```typescript
// File: src/config/env.ts

export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  ENVIRONMENT: process.env.NODE_ENV,
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  GRAMMAR_API_KEY: process.env.REACT_APP_GRAMMAR_API_KEY,
  GRAMMAR_API_URL: process.env.REACT_APP_GRAMMAR_API_URL || 'https://api.languagetool.org',
};
```

### 11.2 Build & CI/CD

```yaml
# File: .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Appendix: Development Checklist

### Phase 1: Core UI
- [ ] Dual-panel layout (left browser, right editor)
- [ ] URL parameter parsing
- [ ] Mock data loading
- [ ] Step list with virtualization
- [ ] Step editor with 3 thought textareas

### Phase 2: Editing Tools
- [ ] Grammar checker integration
- [ ] JSON formatter tool
- [ ] Template quick-insert
- [ ] Real-time validation panel

### Phase 3: State & Backend Integration
- [ ] Zustand store setup
- [ ] API client (fetch/axios)
- [ ] Save/load functionality
- [ ] Error handling

### Phase 4: Collaboration
- [ ] Comments system
- [ ] Version history
- [ ] Review mode UI
- [ ] Approval workflow

### Phase 5: Polish
- [ ] Mobile responsiveness
- [ ] Accessibility (ARIA)
- [ ] Performance optimization
- [ ] Documentation

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Status**: Draft for Development Team Review
