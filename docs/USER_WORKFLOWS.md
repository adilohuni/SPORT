# PromptGrid Studio — User Workflows & Use Cases

## Overview

This document details real-world workflows for different user personas and specific use cases they'll encounter.

---

## User Personas

### Persona 1: Maya (First-Line Annotator)
- **Background**: Recently joined the team, follows guidelines closely
- **Typical Task**: Annotate 5-10 agent runs per day
- **Pain Points**: 
  - Worrying about grammatical mistakes
  - Memorizing CoT structure for different step types
  - Manually copying similar CoT patterns
- **Goals**: 
  - Work fast and accurately
  - Get helpful suggestions without being slowed down
  - Understand when she makes mistakes so she can improve

### Persona 2: James (QA Reviewer)
- **Background**: 3 years experience, knows guidelines deeply
- **Typical Task**: Review and approve 20-30 runs per week
- **Pain Points**:
  - Time-consuming to read and mark issues
  - Cannot efficiently compare multiple versions
  - Wants to guide Maya without rewriting everything
- **Goals**:
  - Quickly identify and suggest fixes
  - Maintain consistent quality across annotators
  - Have annotators improve through constructive feedback

### Persona 3: Rajesh (Data Pipeline Engineer)
- **Background**: Builds ML training systems
- **Typical Task**: Weekly collection and export of approved runs
- **Pain Points**:
  - Manual filtering and formatting
  - Ensuring data quality before ingestion
  - Tracking which runs are in which datasets
- **Goals**:
  - Easy bulk export in multiple formats
  - Consistent metadata for downstream processing
  - Audit trail of what was exported

### Persona 4: Sarah (Team Lead / QA Manager)
- **Background**: Oversees annotation team and quality metrics
- **Typical Task**: Monitor team performance, ensure scaling
- **Pain Points**:
  - Cannot see aggregate quality trends
  - Difficult to identify training needs for annotators
  - No visibility into bottlenecks
- **Goals**:
  - Dashboard showing team metrics
  - Identify underperforming annotators
  - Track consistency across runs

---

## Workflow 1: Annotator Creating a Run (Maya's Day)

### Scenario
Maya receives an email notification: "New agent run ready: `agentRunId=5412e928...&taskId=7d09256d...&qa=false`"

### Step-by-Step Workflow

#### 1. Initialization
```
Maya opens email link
→ App loads run with 12 steps
→ Left panel shows task: "Search for blue headphones on Amazon, add to cart"
→ Left panel shows subtasks:
    - Search for product (steps 0-2)
    - Review product page (steps 3-5)
    - Add to cart (steps 6-8)
    - Verify cart (steps 9-11)
→ Right panel loads step 0 screenshot + empty thought fields
→ Status: "Draft"
```

#### 2. Start First Step
```
Maya sees:
  LEFT:  Step 0 highlighted in list
  RIGHT: Screenshot of Amazon homepage
         Action: Click search bar
         Thoughts: [empty] [empty] [empty]

Maya reads the guideline (side reference panel):
  "Step 0 = Start state overview + current state + next action"
```

#### 3. Select Template
```
Maya clicks "Template Quick Insert" dropdown
→ Shows templates filtered for "first step"
→ Selects "General Guideline (successful)"
→ Template auto-populates:
    T1: "I am on the <homepage name> homepage. My task is to <insert prompt>."
    T2: "I need to <specific subtask>. I can see <elements visible>, but <what is wrong>."
    T3: "I should <specific action> to <expected outcome>."

Maya customizes:
    T1: "I am on the Amazon homepage. My task is to search for blue headphones and add them to my cart."
    T2: "I need to search for blue headphones. I can see the search bar at the top of the page, but it is currently empty."
    T3: "I should type 'blue headphones' into the search bar and press Enter to initiate the search."
```

#### 4. Validation Check
```
Maya clicks outside text area → validation panel shows:
  ✓ First-person "I" present
  ✓ Visible elements mentioned (search bar)
  ✓ Concrete action specified (type + Enter)
  ✓ All 3 thoughts present
  ✓ Grammar score: 98/100
  ⚠ Minor: "headphones" should be hyphenated or lowercase in this context (suggestion accepted)

Grammar checker highlights minor issue:
  "My task is to search for blue headphones..."
  Suggestion: "...for blue headphones (search term should be exactly as intended)"
  
Maya accepts the suggestion (no actual change needed, just clarification)
```

#### 5. Submit Step & Move Forward
```
Maya clicks "Save & Next Step" 
→ Right panel shows step 1
→ Left panel shows step 0 now marked as "Complete" ✓
→ Step 1 screenshot loads
→ Step 1 is a "middle step" (search results page appeared)
→ Template updates to "In between steps successful"
```

#### 6. Middle Steps (Steps 1-10)
```
Maya repeats similar flow:
  - Select or modify template for each step type
  - Validate in real-time
  - Use grammar checker
  - Move to next step

At step 5 (review product page):
  Maya notices a popup ad appeared on screenshot
  She selects template "Popup" from dropdown
  Template includes guidance on closing popup
  She fills in the template with specifics
  
At step 8 (add to cart):
  Previous action should have added headphones
  Grammar checker warns: "...but the cart still empty."
  Should be "...but the cart is still empty."
  Maya accepts auto-fix
```

#### 7. Final Step
```
Maya reaches step 11 (final)
Template switches to "Last step successful"
T1: Screenshot difference + success assessment
T2: Goal state assessment (summarize what was accomplished)
T3: Return information

Maya fills in:
  T1: "The product was added to the cart and the cart count increased to 1."
  T2: "I have successfully searched for 'blue headphones' on Amazon, reviewed the product, and added it to my cart."
  T3: "My task is now complete. I was not asked to return any specific information, so I should simply return."

Validation panel shows:
  ✓ Error handling format correct
  ✓ Task completion statement clear
```

#### 8. Submit for Review
```
Maya clicks "Submit Run for Review"
→ Confirmation dialog: "This run will be sent to QA for review. Continue?"
→ Run status changes from "Draft" → "In Review"
→ Left panel shows lock icon on all steps (read-only in annotator view)
→ Right panel shows message: "This run is now pending review."
→ Notification sent to James (reviewer)
→ Maya can now see in left panel: "Assigned to: James K."

Stats displayed:
  Total steps: 12
  Completed: 12 ✓
  Average quality: 91%
  Time spent: 18 minutes
```

---

## Workflow 2: QA Reviewer Approving a Run (James's Day)

### Scenario
James receives notification: "Run 5412e928 from Maya awaiting review"

### Step-by-Step Workflow

#### 1. Load Run in Review Mode
```
James opens app with qa=true
→ URL: /agent-runs?agentRunId=5412e928...&qa=true
→ App loads same run but in "Review Mode"
→ Left panel shows all 12 steps with quality scores
→ Each step shows "Quality: 91% ✓" or flags if <85%
→ Right panel shows step 0 with Maya's completed thoughts
→ Toggle: "View Mode: Annotator's Version" (can later switch to "My Edits")
```

#### 2. Quick Scan
```
James scrolls through left panel to get overview:
  Step 0: ✓ 92% (good intro)
  Step 1: ✓ 91%
  Step 2: ✓ 93%
  Step 3: ✗ 78% (flagged - potential issue)
  Step 4: ✓ 89%
  Step 5: ⚠ 85% (borderline)
  Steps 6-11: All ✓ (90%+)

James clicks on step 3 to investigate the 78% score
```

#### 3. Review Problematic Step
```
Step 3 screenshot: Product page with popup ad

James reads Maya's thoughts:
  T1: "The search results page loaded, so my previous action was successful."
  T2: "I need to click on the first product result. I can see a popup ad covering part of the page."
  T3: "I should click the X button on the popup to close it, then click the product link."

James notes:
  - Thought 1 is clear ✓
  - Thought 2 mentions popup but doesn't explain what's wrong clearly
  - Thought 3 combines two actions (close popup AND click product) - should be separate or clarified

James hovers over the 78% to see breakdown:
  Structure: 90% ✓
  Clarity: 75% ⚠ (could be clearer)
  Completeness: 80% ⚠ (missing details)
  Accuracy: 72% ✗ (not accurate to screenshot)
```

#### 4. Leave Suggestion
```
James clicks "Leave Suggestion" on Thought 2
→ Comment panel opens with suggestion mode:

James types:
  "Thought 2 doesn't clearly describe what's blocking progress. 
   Suggest: 'I need to interact with the product, but a popup is blocking 
   my view of the page. I should close the popup first by clicking the X.'
   This makes it clear that the popup is the immediate blocker."

James sets suggestion type: "Correction" with severity "Medium"
James clicks "Submit Suggestion"
→ Suggestion appears in comment thread
→ Notification sent to Maya
→ Status of step 3: "Pending annotator feedback"
```

#### 5. Review Step 5
```
James clicks on step 5 (85% - borderline)

Thoughts look okay, but James notices:
  - Grammar is correct
  - Structure is correct
  - BUT: The action references a "Next" button that's not clearly visible in the screenshot

James leaves note (not a suggestion, just guidance):
  "Can you clarify: Is the Next button at the bottom of the page, or top-right? 
   Adding the position would help future annotators understand the action."

Type: "Question" (not blocking)
```

#### 6. Approve Run
```
James finishes review of all 12 steps
→ Issues found: 3 (1 major correction, 2 minor notes)
→ Steps ready to approve: 9/12

James decides:
  Option A: Approve now and let Maya address issues in next iteration (lenient)
  Option B: Send back for revision (strict)
  
James chooses Option A (this run is good enough for training)
→ He clicks "Approve Run with Comments"
→ Modal appears for final review comment:
    "Good work, Maya! Your annotations are very clear overall. 
     I've left some suggestions on steps 3 and 5 to refine them. 
     Please review and improve future annotations. Average quality: 91%."

James clicks "Finalize Approval"
→ Run status: "Draft" → "Approved"
→ Notification sent to Maya
→ Run moves to "Ready for Export" queue
→ James's stats updated: +1 run reviewed, avg time: 8 min
```

#### 7. Analytics Updated
```
Sarah (team lead) sees in dashboard:
  - Run 5412e928: Approved by James
  - Annotator: Maya, Score: 91%
  - Review time: 8 min
  - Quality trend for Maya: ↑ (improving)
```

---

## Workflow 3: Annotator Responds to Feedback (Maya Revises)

### Scenario
Maya sees notification: "Run 5412e928 review complete - 3 comments from James"

### Step-by-Step Workflow

#### 1. Load Run in Response Mode
```
Maya opens her submitted run
→ Run is now in "In Review" status
→ Left panel shows all steps with reviewer scores
→ Steps 3 and 5 have comment icons
→ Left panel status: "1 Correction, 2 Notes from James K."
```

#### 2. Address Major Correction
```
Maya clicks step 3 (marked with correction badge)
→ Right panel shows her original thoughts
→ Comments panel shows James's suggestion
→ Maya can:
    a) Accept suggestion (auto-apply)
    b) Manually edit and then accept
    c) Discuss in comment thread
    
Maya clicks "Accept Suggestion"
→ T2 updates with James's corrected version
→ Version history records: "Maya accepted suggestion from James on step 3"
→ Status: "Revision Complete"
```

#### 3. Address Minor Notes
```
Maya clicks step 5
→ Sees James's question about button position
→ Maya reviews screenshot again
→ Adds clarification to T3: "...by clicking the Next button at the bottom of the page"
→ Replies to comment: "Updated with position info. Thanks!"
→ Both minor items marked as "Addressed"
```

#### 4. Submit Revision
```
Maya clicks "Resubmit for Final Approval"
→ Changes summary shown:
    Step 3: Thought 2 revised
    Step 5: Thought 3 refined
    All changes: 2
→ Modal confirmation: "Changes will be visible to James. Continue?"
→ Maya confirms
→ Run status: "In Review" (but marked as "Revised - Awaiting Final Check")
→ Notification to James: "Maya has addressed your feedback on run 5412e928"
```

#### 5. James Final Approval
```
James gets notified of revision
→ Opens run, sees "3 changes since last review"
→ Diff view shows:
    Before: "I need to interact with the product..."
    After:  "I need to interact with the product, but a popup is blocking..."
→ James reviews changes (takes 2 minutes)
→ All look good ✓
→ James clicks "Final Approve"
→ Run status: "Approved" (locked, no more edits)
→ Can now be exported for training
```

---

## Workflow 4: Exporting Training Data (Rajesh's Collection)

### Scenario
Rajesh needs to prepare a batch of approved runs for model training

### Step-by-Step Workflow

#### 1. Create Collection
```
Rajesh opens "Collections" page
→ Clicks "Create New Collection"
→ Modal appears with filter options:
    ✓ Status: "Approved" (only)
    ✓ Date range: Last 30 days
    ✓ Quality score: ≥ 80%
    ✓ Domain: "ecommerce" (checkbox)
    ✓ Annotators: All (default)

Rajesh sets filters and clicks "Preview"
→ Shows: "Found 47 approved runs"
→ Sample preview shows 3 runs with thumbnails
→ Quality distribution: Avg 88%, Min 82%, Max 94%
```

#### 2. Customize Export Options
```
Rajesh names collection: "ecommerce_batch_nov2025"
→ Description: "Approved runs for Amazon/eBay flows (Nov 2025)"

Export options:
  ☑ Include screenshots (URLs only)
  ☑ Include metadata (timestamps, annotator)
  ☐ Include version history
  ☑ Anonymize author names
  Format: CSV (tabular format for ML pipeline)

Rajesh clicks "Generate Export"
```

#### 3. Download & Validate
```
System processes export:
  - Validates all 47 runs
  - Generates CSV with columns:
    run_id | step_index | action_type | thought_1 | thought_2 | thought_3 | 
    screenshot_url | quality_score | created_date

CSV downloads as: ecommerce_batch_nov2025.csv
Size: ~5.2 MB

Rajesh opens CSV and spot-checks:
  - All 47 runs present ✓
  - Steps formatted correctly ✓
  - URLs valid ✓
  - Author names anonymized (show "User_001" instead of names) ✓
  - Quality scores populated ✓
```

#### 4. Ingest to ML Pipeline
```
Rajesh uploads CSV to ML pipeline system
→ Pipeline runs validation:
    - Schema check ✓
    - All required columns ✓
    - Screenshot URLs accessible ✓
    - Text parsing ✓
→ Creates training dataset: ecommerce_batch_nov2025_train
→ Notifies Rajesh: "Dataset ready. 47 runs, 482 steps."

Rajesh marks collection as "Exported"
→ Collection now locked (can't modify filters)
→ Collection records: "Exported to training pipeline on Nov 24, 2025"
```

#### 5. Track in Analytics
```
Sarah (team lead) sees in dashboard:
  - New export: ecommerce_batch_nov2025
  - Size: 47 runs
  - Quality: Avg 88%
  - Impact: Expected to improve model accuracy on product search tasks
```

---

## Workflow 5: Task Decomposition (Complex Multi-Step Task)

### Scenario
New agent run arrives with 28 steps. Annotator wants to break it into logical subtasks.

### Step-by-Step Workflow

#### 1. Start Run Without Decomposition
```
Annotator loads run (28 steps visible in left panel)
→ Steps are listed numerically but have no logical grouping
→ Annotator clicks "Organize into Subtasks" button
→ Modal opens: "Task Decomposition Assistant"
```

#### 2. AI-Suggested Decomposition (Optional)
```
System reads task prompt:
  "Compare 3 vacation packages on Kayak, check prices, reviews, and 
   flight dates. Choose the cheapest and book it."

System suggests subtasks:
  1. Search for vacation packages (steps 0-3)
  2. View first package details (steps 4-7)
  3. View second package details (steps 8-11)
  4. View third package details (steps 12-15)
  5. Compare and choose cheapest (steps 16-20)
  6. Book selected package (steps 21-27)

Annotator can:
  ☑ Accept AI suggestion
  ☐ Manually adjust
  ☐ Create custom decomposition
```

#### 3. Manual Adjustment
```
Annotator modifies suggested decomposition:
  - Merges "View 2nd package" and "View 3rd package" → "Review alternatives"
  - Renames "Compare and choose" → "Analyze and select best option"

Final structure:
  1. Search for packages (0-3)
  2. Review package 1 (4-7)
  3. Review alternatives (8-15)
  4. Select cheapest (16-20)
  5. Complete booking (21-27)
```

#### 4. Visual Confirmation
```
Left panel now shows collapsible subtasks:
  ▼ Search for packages (4 steps)
     - Step 0
     - Step 1
     - Step 2
     - Step 3
  ▼ Review package 1 (4 steps)
     - Step 4
     - ... (collapsed)
  ▼ Review alternatives (8 steps)
  ▼ Select cheapest (5 steps)
  ▼ Complete booking (7 steps)

Annotator clicks "Save Decomposition"
→ Each subtask is tracked independently
→ Can mark subtask as "Annotated" before completing all steps
```

#### 5. Annotate by Subtask
```
Annotator starts with subtask 1: "Search for packages"
→ Left panel collapses other subtasks
→ Steps 0-3 are visible
→ Annotator focuses on 4 steps instead of 28
→ After completing subtask 1, can mark it as "Complete"

Progress visible:
  ✓ Search for packages (Complete)
  ⚠ Review package 1 (In Progress - step 5 of 4 done)
  ○ Review alternatives (Not started)
  ○ Select cheapest (Not started)
  ○ Complete booking (Not started)

This structure helps with:
  - Focus (not overwhelming with 28 steps at once)
  - Progress tracking
  - Reuse (similar package review steps can reference each other)
```

---

## Workflow 6: Quality Analytics Dashboard (Sarah Manages Team)

### Scenario
Sarah opens analytics dashboard to monitor team performance

### Step-by-Step Workflow

#### 1. Dashboard Overview
```
Sarah logs in with "qa_manager" role
→ Lands on Analytics Dashboard showing:

📊 TEAM PERFORMANCE (Last 30 days)
  - Total runs completed: 127
  - Total steps annotated: 1,843
  - Average quality score: 87%
  - Approved first-time %: 76% (good!)
  - Avg time per step: 5.2 minutes

👥 ANNOTATOR RANKINGS
  1. James: 45 runs, Avg quality 91%, Consistency 94%
  2. Maya: 38 runs, Avg quality 88%, Consistency 87% ⬆ (improving)
  3. Priya: 32 runs, Avg quality 85%, Consistency 79%
  4. Ahmed: 12 runs, Avg quality 81%, Consistency 75%

⏱️ BOTTLENECKS
  - Average review time: 8 min (target: 5 min)
  - Runs pending review: 15 (normal)
  - Runs rejected for revision: 8% (acceptable)
```

#### 2. Deep Dive: Maya's Performance
```
Sarah clicks on Maya's name
→ Detailed view opens:
  - Annotation trend: ⬆ (quality improving week-over-week)
  - Most common issues flagged:
    • Ambiguous element references (12 occurrences)
    • Missing context in Thought 2 (8 occurrences)
    • Typos/grammar (6 occurrences, decreasing)
  
  - Time to annotate: Decreasing (was 7 min/step, now 5.2 min/step)
  - Feedback from reviewers: "Very thorough, improving on clarity"

Sarah notes: "Maya is onboarding well. Minor coaching needed on element specificity."
```

#### 3. Identify Training Need
```
Sarah notices Priya's consistency score (79%) is lowest
→ Clicks on Priya's profile
→ Sees: Highest variance in quality across runs
  - Some runs 92% (excellent)
  - Some runs 71% (needs improvement)
  - No pattern related to task type

Sarah clicks "Generate Training Report"
→ System recommends: "Review Priya's low-scoring runs vs. high-scoring runs to identify patterns"

Sarah schedules 1-on-1 with Priya: "Let's review your annotation quality together"
```

#### 4. Export Metrics
```
Sarah clicks "Export Team Report"
→ Options:
  - Format: PDF (for management)
  - Include: Individual scores, trends, recommendations
  - Period: Last 30 days

Report generated:
  - Executive summary (1 page)
  - Team metrics (2 pages)
  - Per-annotator breakdown (1 page each)
  - Recommendations (1 page)

Sarah downloads and sends to management: 
  "Team is performing well. Recommend hiring 2 more annotators to meet Q4 targets."
```

---

## Workflow 7: API Integration (Programmatic Access)

### Scenario
Rajesh's ML pipeline needs to check export status and trigger notifications

### API Calls
```bash
# Check if new approved runs are available
GET /api/runs?status=approved&createdAfter=2025-11-24&limit=100
Response: { runs: [...], total: 47 }

# Get details of a specific run
GET /api/runs/5412e928-9b96-4062-887d-69ab101b675a
Response: { run: { id: "...", steps: [...], status: "approved" } }

# Trigger export collection creation
POST /api/collections
Body: {
  name: "ecommerce_batch_nov2025",
  filterCriteria: { statuses: ["approved"], dateRange: [...] },
  exportFormat: "csv"
}
Response: { collectionId: "uuid", status: "processing" }

# Poll export status
GET /api/collections/uuid/status
Response: { status: "completed", downloadUrl: "...", expiresAt: "..." }

# Download export
GET /api/collections/uuid/export?format=csv
Response: CSV file (5.2 MB)

# Record export in analytics
POST /api/analytics/export-event
Body: { collectionId: "uuid", exportedBy: "rajesh", timestamp: "..." }
Response: { success: true }
```

---

## Pain Point Solutions

### Pain Point 1: "I make grammatical mistakes"
**Solution:**
- Real-time grammar checker (integrated LanguageTool)
- Inline suggestions with one-click fix
- Grammar score shown for each step
- Over time, annotators learn from corrections

### Pain Point 2: "I forget the CoT structure"
**Solution:**
- Templates pre-populated for each step type
- Visual checklist enforcing 3-part structure
- Validation panel shows what's missing
- Side-by-side reference to guidelines

### Pain Point 3: "I waste time copying similar patterns"
**Solution:**
- Quick-insert templates from library
- Copy-from-previous-step option
- Template reuse across runs
- Macro system for common phrases

### Pain Point 4: "Reviews take forever"
**Solution:**
- Quality score shows issues at a glance
- Diff view highlighting changes
- Batch review mode for similar issues
- Quick suggestions (not full rewrites)

### Pain Point 5: "I don't know if I'm improving"
**Solution:**
- Personal metrics dashboard
- Trend lines showing improvement over time
- Feedback from reviewers in every review cycle
- Peer comparison (anonymized)

### Pain Point 6: "Exporting data is manual and error-prone"
**Solution:**
- Automated filtering and collection creation
- One-click export in multiple formats
- Validation before export
- Export history and audit trail

---

## Edge Cases & Error Scenarios

### Edge Case 1: Popup Blocking Step
**How app handles it:**
- Template "Popup" available in template library
- Guides annotator to recognize and handle popup
- Validates that thought mentions popup management

### Edge Case 2: Failed Action (External Failure)
**How app handles it:**
- Template "External Failure" provides structure
- Validator checks for verification step
- Ensures error message is precise

### Edge Case 3: Final Step with No Return Value
**How app handles it:**
- Validator flags: "Final step requires return or error"
- Template offers two options:
  - "Task complete, no return value"
  - "Task incomplete, throw error with message"
- Blocks submission until clarified

### Edge Case 4: Step with Ambiguous Screenshot
**How app handles it:**
- Grammar checker may not catch context issues
- Reviewer can flag: "Screenshot unclear - which element?"
- Suggests adding screenshot description in first thought

### Edge Case 5: Large Run (100+ Steps)
**How app handles it:**
- Virtualization keeps UI responsive
- Subtask grouping reduces cognitive load
- Progress bar shows position in run
- Can pause and resume later

---

## Success Metrics for Each Workflow

### Maya (Annotator)
- **Metric**: Time per step ↓ (from 7 min to 5 min in 2 weeks)
- **Metric**: Quality score ↑ (from 84% to 91% in 4 weeks)
- **Metric**: Revision requests ↓ (from 20% to 5%)
- **Metric**: Satisfaction ↑ (survey score: 4.2/5)

### James (Reviewer)
- **Metric**: Review time ↓ (from 12 min to 8 min per run)
- **Metric**: Issues resolved in first pass ↑ (from 60% to 80%)
- **Metric**: Annotator satisfaction ↑ (feedback improves team)
- **Metric**: Consistency ↑ (all annotators maintain 85%+ quality)

### Rajesh (Engineer)
- **Metric**: Export time ↓ (from 30 min manual to 2 min automated)
- **Metric**: Data quality ↑ (validation catches 95% of issues before ingestion)
- **Metric**: Throughput ↑ (can process 5x more runs per week)

### Sarah (Manager)
- **Metric**: Team visibility ↑ (real-time metrics dashboard)
- **Metric**: Training ROI ↑ (model accuracy improves 5-10%)
- **Metric**: Scaling ✓ (can onboard new annotators 3x faster)

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Status**: Ready for Review
