# PromptGrid Studio — Future Vision & Requirements Document

## Executive Summary

PromptGrid Studio is evolving from a **template editor and viewer** into a comprehensive **Agent Run Data Management & CoT (Chain-of-Thought) Refinement Platform**. The tool will enable annotation teams to efficiently create, edit, validate, and organize multi-step task runs with embedded chain-of-thought reasoning, specifically designed for **training browser agents**.

**Core Mission:** Bridge the gap between raw agent execution runs and production-ready training data by providing a collaborative, structured interface for CoT annotation and run management.

---

## Current State Analysis

### What Exists Today
- **Template Management**: A React-based app for creating/editing CoT templates with a grid-based interface
- **JSON Schema Validation**: Templates are validated against parsed JSON structures
- **Import/Export**: Collections can be imported/exported as JSON files
- **Template Library**: Pre-built templates for common patterns (success, failure, native dropdowns, external failures, wait steps, scrolling, popups, model memory, higher reasoning)

### What's Working
1. Grid-based template visualization (title + buttons per cell)
2. Serialization/deserialization of JSON template data
3. Import validation and error handling
4. Template examples rendered as HTML
5. Metadata support (name, data, example)

### Current Gaps
1. **No Run-Level Organization**: Each CoT is isolated; no concept of a "run" (multi-step task)
2. **No URL Parsing**: Cannot handle agent run URLs with parameters (agentRunId, taskId, qa flag)
3. **No Split-Screen Editing**: UI doesn't reflect the "left panel (multiple runs) + right panel (static tools)" architecture
4. **No Screenshot Integration**: Cannot attach/reference screenshots per step
5. **No Collaborative Workflow**: Single-user focused; no support for QA reviewers or higher-ups
6. **No Task Decomposition**: Cannot break large tasks into subtasks
7. **Limited Metadata**: No author, version, status tracking for runs
8. **No Data Aggregation**: Cannot batch-export multiple runs for training data collection

---

## Future Application Architecture

### 1. Core Concept: "Agent Run" as the Central Entity

An **Agent Run** represents a complete execution trace of a browser agent performing a task. It contains:

```typescript
interface AgentRun {
  id: string; // UUID from URL parameter: agentRunId
  taskId: string; // From URL parameter: taskId
  qa: boolean; // From URL parameter: qa (whether this is in QA mode)
  
  // Metadata
  taskPrompt: string; // Original user task description
  status: 'draft' | 'in-review' | 'approved' | 'archived';
  createdAt: ISO8601;
  updatedAt: ISO8601;
  createdBy: string; // User/annotator name
  reviewedBy?: string; // QA reviewer name
  
  // Task Decomposition
  subtasks: Subtask[]; // Array of logical steps
  totalSteps: number;
  
  // Hierarchical Structure
  steps: Step[]; // Each step = screenshot + CoT + metadata
}

interface Subtask {
  id: string;
  title: string; // e.g., "Search for product"
  description: string; // More detail
  stepRange: [number, number]; // Steps 0-3 belong to this subtask
  status: 'pending' | 'annotated' | 'reviewed';
}

interface Step {
  index: number; // 0-based
  screenshot: {
    url: string; // CDN link or embedded base64
    timestamp: ISO8601;
  };
  action: {
    type: 'click' | 'type' | 'scroll' | 'wait' | 'select' | 'navigate';
    target: string; // CSS selector or element description
    value?: string; // For type/select actions
  };
  
  // CoT Thoughts (3-part structure)
  thoughts: {
    thought1: string; // Screenshot diff / start state
    thought2: string; // Current state assessment
    thought3: string; // Next action / return info
  };
  
  // Optional extended reasoning
  extendedThoughts?: string[]; // Additional context (higher reasoning, memory, etc.)
  
  // QA Metadata
  verified: boolean;
  issues: Issue[];
  lastEditedBy: string;
  lastEditedAt: ISO8601;
}

interface Issue {
  type: 'grammatical' | 'formatting' | 'logic' | 'missing-context' | 'contradiction';
  severity: 'minor' | 'major';
  description: string;
  suggestion?: string;
}
```

---

## 2. New UI Layout: Dual-Panel Architecture

### Left Panel (Scrollable)
**Purpose**: Browse and manage multiple subtasks/steps within a run

- **Run Header**
  - Task title and description
  - Status badge (draft/in-review/approved)
  - Run metadata (created by, last updated, progress %)
  - Quick action: Export, Archive, Duplicate

- **Subtask List** (collapsible accordion)
  - Each subtask shows title, description, step count, completion %
  - Visual indicator: pending → annotated → reviewed
  - Click to expand and see child steps

- **Step List** (within each subtask)
  - Step number, action type icon, thumbnail of screenshot
  - Current CoT summary (first 50 chars of Thought 1)
  - Status indicator (needs annotation, done, flagged for review)
  - Quick edit button (opens right panel)

- **Scroll Context**: 
  - Can have 5–20+ steps, so virtualization recommended
  - Sticky header for current run info

### Right Panel (Static, Action-Focused)
**Purpose**: Editing and validation tools

- **Step Editor**
  - Screenshot display (full size or zoom-able)
  - Action selector (type, target, value)
  - Three text areas for Thought 1, 2, 3
  - Character count + grammar check badge
  - Real-time suggestion panel (see below)

- **Tools & Options**
  - **Grammar & Formatting Checker**
    - Highlight grammatical issues
    - Auto-correct suggestions
    - Toggle: strict vs. lenient mode
  
  - **JSON Formatter**
    - Convert `{` to `\{`, `}` to `\}`
    - Validate JSON in thoughts
    - Format existing JSON blobs
  
  - **Template Quick-Insert**
    - Dropdown menu of pre-built CoT templates
    - Click to populate Thought 1/2/3 with template
    - Customize with step-specific details
  
  - **Issue Tracker**
    - List of flagged issues for this step
    - Links to suggested fixes
  
  - **Validation Panel**
    - Real-time checks: 3-part structure present?
    - First-person "I" usage
    - Visible element references
    - Error message format (if final step error)
  
  - **Navigation**
    - Previous / Next Step buttons
    - Jump to specific step or subtask
    - Save & Mark Complete
    - Save & Flag for Review

---

## 3. URL Parsing & Initialization Flow

### Parse Agent Run URL

```
/agent-runs?agentRunId=5412e928-9b96-4062-887d-69ab101b675a&taskId=7d09256d-2a44-4654-98c6-dd80f96db2f4&qa=true
```

**On App Load:**
1. Extract `agentRunId`, `taskId`, `qa` from URL params
2. Fetch run metadata from backend (or load from localStorage if offline)
3. Populate left panel with subtasks and steps
4. Select first incomplete step (or first step if all complete)
5. Load step screenshot and CoT into right panel
6. If `qa=true`, enable review mode (read-only with comment/suggest features)

---

## 4. Multi-Step Task Decomposition

### Feature: "Create Run from Task Prompt"

Users can input a task prompt and decompose it into subtasks:

**Example:**
```
Prompt: "Find 5 available studio apartments in Boston under $10,000/month that were listed in the last 7 days, sorted by newest first, and record their addresses and prices."

Suggested Subtasks:
1. Navigate to Craigslist apartments section
2. Filter by location (Boston)
3. Filter by price (< $10k/month)
4. Filter by recency (last 7 days)
5. Sort by newest first
6. Record first 5 results (address + price)
7. Return collected data
```

**UI Implementation:**
- Text input for task prompt
- AI-powered suggestion (optional, using LLM)
- Manual split: drag-and-drop dividers between steps
- Assign step ranges to each subtask
- Name and describe each subtask

---

## 5. Enhanced Editing Features

### A. Real-Time Grammar & Formatting Validation

```typescript
interface ValidationResult {
  issues: Array<{
    type: 'spelling' | 'grammar' | 'punctuation' | 'format';
    location: { start: number; end: number }; // Character positions
    message: string;
    suggestion: string;
  }>;
  score: number; // 0-100, higher is better
}
```

**Tools to Integrate:**
- **Grammar**: LanguageTool API or similar
- **Spelling**: Built-in or Hunspell
- **Format**: Custom regex rules for CoT structure

**Features:**
- Highlight errors inline
- Click suggestion to apply
- Batch-fix similar issues across all steps

### B. JSON Bracket Escaping Tool

When users paste JSON into CoT thoughts:
- Auto-detect `{` and `}` brackets
- Convert to `\{` and `\}` with user confirmation
- Validate JSON syntax before and after conversion
- Show preview of result

### C. Template-Powered Thought Generation

Pre-built templates for 10+ scenarios:
- General success/failure
- Native dropdowns
- External failures
- Wait steps
- Scrolling
- Popups
- Model memory
- Higher reasoning

**Workflow:**
1. User selects template from dropdown
2. Template fields auto-fill (e.g., `<element>`, `<action>`)
3. User customizes placeholders for this specific step
4. System validates completed template
5. Populate Thought 1/2/3 fields

### D. Structure Validation Checklist

Real-time validator ensures CoT follows guidelines:
- ✓ Thought 1 includes change assessment (first-person "I")
- ✓ Thought 2 includes current state and reasoning
- ✓ Thought 3 includes concrete action + expected result
- ✓ For final step: includes return or error
- ✓ No ambiguous references ("it", "something")
- ✓ References visible UI elements
- ✓ If error, error message is exact and copyable

---

## 6. Workflow Modes

### Mode A: First-Line Annotators (Content Creators)

**Goal**: Create raw CoT annotations for browser agent runs

**Capabilities:**
- Load run from URL
- Edit/create CoT for each step
- Use templates and auto-correct
- Mark step as complete
- Submit for review

**Restrictions:**
- Cannot approve runs
- Cannot see other annotators' comments (unless in review)

### Mode B: QA Reviewers / Higher-Ups (Content Validating)

**Goal**: Review and refine CoT quality before training

**Capabilities:**
- Load run with `qa=true`
- View all steps and current CoT
- Highlight and suggest changes
- Rewrite problematic CoT
- Flag issues (grammar, logic, clarity)
- Leave comments/notes for original annotator
- Approve or reject run

**Restrictions:**
- Cannot directly edit; must suggest (original author accepts/rejects)
- OR: Can edit in "review mode" and track changes

**Additional Tools:**
- Diff viewer (show before/after)
- Batch review (review multiple runs, mark as approved)
- Historical view (see all versions and who changed what)

---

## 7. Advanced Features & Brainstorm

### A. Collaborative Annotations with Comments

```typescript
interface Comment {
  id: string;
  stepIndex: number;
  author: string;
  text: string;
  type: 'question' | 'suggestion' | 'correction' | 'approval';
  resolved: boolean;
  createdAt: ISO8601;
  replies: Comment[]; // Threaded replies
}
```

**UI:**
- Comment sidebar on right panel
- Inline highlights for commented passages
- Reply/resolve workflow

### B. Auto-Detection of Missing Patterns

Scan all thoughts for:
- Missing "I need" phrases → suggest adding
- Missing "but" contrast statements → suggest problem context
- Missing "I can see" observations → suggest visible elements
- Missing "I should" actions → suggest action phrase
- Inconsistent tense or voice

**UI**: Panel showing pattern misses with auto-fix suggestions

### C. Version History & Rollback

Track all edits per step:
- Timeline of who changed what and when
- Snapshot comparison
- Rollback to any previous version
- Show change summary (additions/deletions highlighted)

### D. Batch Export for Training Data

**Feature: Export Run Collections**

```typescript
interface RunCollection {
  id: string;
  name: string;
  description: string;
  runs: AgentRun[];
  metadata: {
    totalSteps: number;
    averageCoTQuality: number;
    createdAt: ISO8601;
    exportedAt: ISO8601;
  };
}
```

**Options:**
- Export single run or multiple runs
- Format: JSON (raw) or CSV (tabular)
- Include/exclude screenshots (URLs or embedded)
- Filter: by status (only approved), by date range, by annotator
- Anonymize: remove author names, timestamps
- Compress: ZIP archive for large exports

### E. Search & Filter Across Runs

**Capabilities:**
- Full-text search in task prompts and CoT content
- Filter by: status, date range, annotator, quality score
- Tag system (for curating themed collections)
- Advanced query: e.g., "runs with native dropdown steps"

### F. Template Reuse & Sharing Library

**Feature: Discover & Reuse High-Quality CoT Patterns**

- Annotators can "star" well-written CoT from past runs
- System extracts the CoT + action pattern as a micro-template
- Populate template library with real-world examples
- Search by action type, website domain, or similarity
- Suggest templates based on current step's action

### G. AI-Assisted CoT Generation (Optional)

**Low-risk Integration:**
- Given a screenshot + action metadata, suggest CoT content
- Use vision model (e.g., Claude, GPT-4V) to:
  - Identify visible elements
  - Generate Thought 2 (current state)
  - Draft Thought 3 (action prediction)
- Human annotator reviews and refines
- **Caveat**: Requires careful prompt design to avoid hallucination

### H. Quality Scoring & Analytics

**Metrics Per Step:**
- Readability score
- Compliance with 3-part structure
- Presence of visible element references
- Grammar/spelling score

**Metrics Per Run:**
- Overall quality %
- Time to annotate
- Number of review iterations
- Issues flagged and resolved

**Metrics Per Annotator:**
- Average quality of annotations
- Consistency with guidelines
- Review completion rate
- Peer comparison (anonymized)

### I. Integration with External Tools

- **Version Control**: Save/load runs from GitHub Gist or similar
- **Bug Tracking**: Flag runs with unresolved issues
- **Annotation Guidelines Link**: Embed link to CoT_OFFICIAL.md
- **Webhook**: Notify external system when run is approved

### J. Mobile/Responsive Design

- Mobile-friendly: stack panels vertically on small screens
- Tablet: two-column layout optimized for touch
- Screenshot zoom on mobile (pinch-to-zoom)
- Thought editing: full-screen text editor on mobile

---

## 8. Data Aggregation Workflow

### Scenario: Preparing Training Data

**Step-by-step:**

1. **Curator** creates a "collection" by filtering runs:
   - Status = "approved"
   - Quality score > 80%
   - Domain: "e-commerce" or "SaaS" (tag-based)
   - Date range: last 3 months

2. **System** gathers matching runs and computes collection metadata:
   - Total steps: 1,234
   - Domains covered: 12
   - Annotators: 8
   - Average annotation time per step: 4.5 min

3. **Curator** reviews sample runs for final QA

4. **System** generates export:
   - JSON (raw): All run data + screenshots (URLs only to save space)
   - CSV: Flat table of steps (one row per step, with screenshot URL, all 3 thoughts, action metadata)
   - Markdown: Human-readable summary with examples

5. **Data Pipeline** ingests exported collection:
   - Validate JSON schema
   - Download all screenshots (cache locally)
   - Organize into train/val/test splits
   - Feed to model training framework

---

## 9. Implementation Roadmap

### Phase 1: Core Dual-Panel UI (Weeks 1-2)
- [ ] Implement left panel with run/subtask/step list
- [ ] Implement right panel with step editor
- [ ] URL parameter parsing (agentRunId, taskId, qa)
- [ ] Load mock run data and render

### Phase 2: Enhanced Editing Tools (Weeks 3-4)
- [ ] Grammar/spelling validator (integrate LanguageTool)
- [ ] JSON bracket escape tool
- [ ] Template quick-insert dropdown
- [ ] Real-time CoT structure validation

### Phase 3: Workflow Modes (Weeks 5-6)
- [ ] Implement annotator mode (create/edit)
- [ ] Implement QA/reviewer mode (suggest/approve)
- [ ] Permission system (role-based access)
- [ ] Status tracking (draft → review → approved)

### Phase 4: Collaboration Features (Weeks 7-8)
- [ ] Comments and threaded replies
- [ ] Inline suggestions
- [ ] Version history & rollback
- [ ] Change tracking (who edited what)

### Phase 5: Advanced & Analytics (Weeks 9-10)
- [ ] Quality scoring system
- [ ] Search & filter across runs
- [ ] Batch export (JSON, CSV)
- [ ] Analytics dashboard

### Phase 6: Polish & Optimization (Week 11)
- [ ] Performance (virtualization for large runs)
- [ ] Mobile responsiveness
- [ ] Error handling & edge cases
- [ ] User documentation & tutorials

---

## 10. Technical Architecture

### Frontend Stack (Current)
- **React** + **TypeScript**: Component framework
- **Vite**: Build tool (already in use)
- **Tailwind CSS**: Styling (via shadcn UI)
- **shadcn/ui**: Component library

### Additional Libraries Needed
- **TanStack Query** (React Query): Data fetching & caching
- **Zustand** or **Redux Toolkit**: State management
- **React Hook Form**: Form handling
- **Zod** or **Yup**: Schema validation
- **LanguageTool API**: Grammar checking
- **Date-fns**: Date utilities
- **lucide-react**: Icons

### Backend Requirements (Future)
- **Node.js/Express** or **Python/FastAPI**: API server
- **PostgreSQL** or **MongoDB**: Run storage
- **S3/Blob Storage**: Screenshot storage
- **Redis**: Caching & session management
- **Webhooks**: Notifications to external systems

### Data Flow
```
URL → Parse params → Fetch run from backend → Render in left panel
User edits CoT → Validate → Auto-save to localStorage → Sync to backend
User approves run → Update status → Trigger export job → Notify data pipeline
```

---

## 11. Security & Permissions

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  ANNOTATOR = 'annotator', // Create/edit CoT
  REVIEWER = 'reviewer', // Review and suggest changes
  QA_MANAGER = 'qa_manager', // Approve and manage QA workflow
  ADMIN = 'admin', // Full access
}

interface UserPermissions {
  canCreateRun: boolean;
  canEditOwnRuns: boolean;
  canEditAllRuns: boolean;
  canApproveRuns: boolean;
  canExportData: boolean;
  canViewAnalytics: boolean;
}
```

### Data Privacy
- Sanitize screenshot URLs (no sensitive data in filenames)
- Anonymization option for exports (remove author/timestamp)
- Audit logs (track all data access)

---

## 12. Success Metrics

### For Annotators
- **Annotation Speed**: Avg. time per step ↓
- **Quality**: % steps passing validation ↑
- **Reusability**: % of template-assisted annotations ↑

### For Reviewers
- **Review Efficiency**: Avg. time to approve a run ↓
- **Consistency**: % of approved runs maintaining quality standards ↑

### For Organization
- **Data Pipeline Throughput**: Runs → Training data ↑
- **Model Accuracy**: Downstream model performance on browser agents ↑
- **Annotator Retention**: Satisfaction scores ↑

---

## 13. Example Workflow: End-to-End

### Day 1: Annotator Creates a Run

1. Annotator opens app, receives a notification of a new agent run: `agentRunId=abc123&taskId=xyz789&qa=false`
2. App loads run with 8 steps:
   - Left panel shows steps 0–7 with screenshots and pending status
   - Right panel shows step 0 screenshot + empty CoT fields
3. Annotator uses template: selects "General Guideline (successful)" from template dropdown
4. Template populates Thought 1, 2, 3 with placeholders
5. Annotator fills in placeholders:
   - Thought 1: "I am on Amazon homepage. My task is to search for 'blue headphones'."
   - Thought 2: "I need to search for 'blue headphones'. I can see the search bar in the top-left, but it is currently empty."
   - Thought 3: "I should type 'blue headphones' and press Enter to search."
6. Grammar checker highlights "headphones" (suggest hyphen?), annotator approves
7. Validation panel shows ✓ all checks pass
8. Annotator clicks "Next Step" → loads step 1
9. Repeats for all 8 steps
10. Marks run as "Complete" → submits for review

### Day 2: QA Reviewer Reviews the Run

1. QA reviewer receives notification: "Run abc123 awaiting review"
2. Opens app with `qa=true` → loads same run in review mode
3. Left panel shows steps with annotator's CoT + quality scores
4. Reviewer scrolls through and spots an issue in step 3:
   - Thought 2 is missing a "but" statement explaining what's wrong
5. Reviewer clicks "Suggest Change" on step 3
6. Opens comment panel: "Thought 2 needs context: what's preventing progress?"
7. In edit mode, reviewer adds: "...but the search has not been executed yet."
8. Reviewer submits suggestion → notification sent to annotator
9. Annotator sees suggestion, accepts it
10. Reviewer approves run → status = "approved"

### Day 3: Data Pipeline Exports Training Data

1. Curator filters runs: status = "approved", quality > 80%, date range = last week
2. System finds 47 approved runs
3. Curator clicks "Export Collection"
4. Options:
   - Format: CSV (for ML engineers)
   - Include: screenshots (URLs only)
   - Exclude: author names
5. System generates `training_batch_20231124.csv` with columns:
   - `run_id, step_index, action_type, thought_1, thought_2, thought_3, screenshot_url, ...`
6. CSV is downloaded and ingested into training pipeline
7. ML engineers load CSV, fetch screenshots, tokenize CoT, train model

---

## 14. Migration from Current Version

### For Existing Users
1. All current templates remain available
2. New "Run" concept is opt-in (backward compatible)
3. Existing template-based workflows still function
4. Gradual migration: users can switch to new run-based workflow when ready

### Data Migration Steps
1. Export all templates from old app
2. Map templates to new Step/Thought structure
3. Create a "seed" run for each template
4. Populate with template examples
5. Validate and import into new system

---

## 15. Conclusion

PromptGrid Studio will evolve from a **template editor** into a **comprehensive run management and CoT annotation platform**. By combining:

- **Structured editing** (3-part CoT + validation)
- **Collaborative workflows** (annotators + reviewers)
- **Data aggregation** (export for training)
- **Developer experience** (templates, auto-fix, suggestions)

...the tool will become essential for organizations scaling annotation of browser agent training data.

**Key differentiators:**
- Purpose-built for CoT annotation (not generic annotation tool)
- Opinionated about structure (enforces best practices)
- Extensible template system (reusable patterns)
- Data pipeline ready (export for ML ingestion)

**Next Steps:**
1. Validate this vision with stakeholders (annotators, QA reviewers, data engineers)
2. Build Phases 1–2 (dual-panel UI + editing tools)
3. Gather user feedback and iterate
4. Expand to Phases 3–5 based on adoption and needs

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Author**: AI Assistant  
**Status**: Draft for Review
