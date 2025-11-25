**Chain-of-Thought — Official Guide**

Purpose: Provide a single, practical, and editable reference for writing Chain-of-Thought (CoT) annotations used across our annotation toolset. This document consolidates the existing internal guide, upgraded guidance, and template examples into a concise, useable standard with ready-to-use phrasing and alternatives.

**Scope**: Applies to all annotators and QA reviewers who add or edit CoT for agent runs, including single-step, multi-step, and special-case runs (native dropdowns, popups, external failures, waits, captcha, etc.).

**Principles**
- **Clarity**: Use plain, first-person language (the agent speaks as "I").
- **Actionable**: Each thought should help the agent decide the next measurable action.
- **Concise but informative**: Keep thoughts focused — additional context is allowed only when it changes the chosen action.
- **Verifyable**: Observations should be grounded in visible UI elements or plausible, testable inferences.
- **Respect structure**: Use the three-thought structure as baseline, expand only to add meaningful context.

**Structure: The 3 Thoughts (Baseline)**
- **Thought 1 — Start / Screenshot diff / Assessment**: Briefly state where you are and whether the previous action succeeded. (If first step, include the starting state and task objective.)
- **Thought 2 — Current State Assessment**: Say what needs to be done next, describe the visible elements that support that choice, and explain what is currently wrong or missing.
- **Thought 3 — Next Action & Expected Result / Return Info**: State the exact next action and the expected page or UI change. If this is the final step, include what will be returned (if anything) or the exact error message to throw.

**Differences by Step Type**
- **First step (Step 0)**: Thought 1 = Start state overview + task objective. Thought 2 = what's next and key visible elements. Thought 3 = action to begin and expected result.
- **Middle steps**: Thought 1 = Screenshot change + success assessment. Thought 2 = current task substep and observed problems. Thought 3 = action + expected transition.
- **Final step**: Thought 1 = Screenshot change + success assessment. Thought 2 = summarize actions taken and what is visible now. Thought 3 = return information or a specific error message (if task cannot be completed).

**Special Cases & Templates**
Below are short templates and several alternative phrasings for reuse. Replace angled placeholders (e.g., <element>) with concrete values.

- **Success acknowledgement (Thought 1)**:
  - Template: "The <element or page> has <indicator of success>, meaning my previous action was successful."
  - Alternatives: "The page updated and shows <indicator>, so the previous step succeeded.", "I can see <indicator>, indicating my last action completed successfully."

- **Failure acknowledgement (Thought 1)**:
  - Template: "The <element or page> has <indicator of failure>, meaning my previous action was unsuccessful."
  - Alternatives: "Nothing changed on the page, so my previous action failed.", "An error or missing element indicates the action did not complete."

- **Start state + objective (First step)**:
  - Template: "I am on the <homepage name or UI label> homepage. My task is to <task description>."
  - Alternatives: "I am on <site/page>. I need to <task>.", "Starting at <page>, goal: <brief task statement>."

- **Current state & what’s wrong (Thought 2)**:
  - Template: "I need to <subtask>. I can see <elements visible in the screenshot>, but <what is wrong>."
  - Alternatives: "To complete <subtask> I see <element>, however <problem>.", "The <element> is present but currently <state>, so I must <action>."

- **Next action & expected result (Thought 3)**:
  - Template: "I should <specific action> to <expected outcome>."
  - Alternatives: "I will click/type/select <target> to cause <expected change>.", "I will wait for <condition> and then <action> to verify <result>."

- **Return / Error (Final step)**:
  - Success return template: "My task is now complete. I was asked to return <item>, I should return <exact item>."
  - No-return template: "My task is now complete. I was not asked to return anything so I should simply return."
  - Error template: "My task cannot be completed, so I should throw an error stating '<specific error message>'."

**Common wording substitutions**
- Success: succeeded, completed, successful, indicates success, updated, visible
- Failure: unsuccessful, failed, unavailable, broken, missing, no change, error
- Actions: click, type, select, input, wait, scroll, open, close
- Expected: should, will, expected to, will likely, should result in

**Examples (short, ready-to-copy)**
- First-step example:
  - T1: "I am on the Google homepage. My task is to search for a history article and open the first result."
  - T2: "I need to search for a history article. I can see the search field in the middle of the page, but it is empty."
  - T3: "I should type 'history article' into the search field and press Enter to initiate the search."

- Middle-step success example:
  - T1: "The search results have appeared, meaning my previous action was successful."
  - T2: "I need to open the first result. I can see the first result under the search bar but it has not been clicked yet."
  - T3: "I should click on the first result to open it."

- Middle-step failure example (external failure):
  - T1: "The 'Location (City)' field is still empty, which means my prior action was unsuccessful."
  - T2: "I still need to fill 'Boston' into the field; the field might be broken."
  - T3: "I should enter 'Boston' again to verify whether the field accepts input; if it still fails, throw 'Location field broken'."

- Final-step return example:
  - T1: "The page has loaded the target article, meaning my previous action was successful."
  - T2: "I have opened the requested article and verified the headline and author."
  - T3: "My task is complete. I should return the article title and author as {\"title\": <title>, \"author\": <author>}."

**Special-case guidance**
- **Native dropdowns**: note that options may be invisible. Thought 1 should acknowledge the dropdown is open. Thought 2 should note the option label/value mapping. Thought 3 should type the option value or input the visible numeric value.
  - Example: "I see '6' value in the dropdown corresponding to June; I should type '6' to set the month to June."

- **Popup blocking**: mention the popup and the element to close it (e.g., 'X' or 'Close' button). Prefer exact element labels.

- **Wait steps**: when loading indicators appear or change is uncertain, state the load indicator and specify a wait action and timeout if applicable: "I see a loading spinner; I should wait for it to disappear before continuing." Avoid indefinite waiting; be explicit about verifying change.

- **External failure / Actuation failure**: when elements appear unresponsive, repeat action and specify verification: "I will click <element> again to see if it triggers the expected state; if still unresponsive, throw 'Element <name> not responding'."

- **Captcha**: the model must not attempt to bypass a captcha. Include the phrase: "I should not impersonate a human, or mis-direct being one by solving captchas or any other challenge" in Thought 2, and then throw an error if no instruction exists for solving it.

**Higher reasoning and model memory**
- Use higher reasoning when the visible evidence benefits from inference (site conventions, neighboring UI patterns, plausible UX behaviors). Make the inference brief and link it to the action.
- When the model must remember previously seen info, explicitly recall it in Thought 2: "I recall from step 1 that <item>, so I will <action> to use that info." Keep recalls short and precise.

**One-step tasks**
- Merge First and Final behaviors: Thought 1 = start+goal; Thought 2 = current state vs goal; Thought 3 = return or error.

**Do / Don’t Checklist (Quick QC)**
- **Do**: Use first-person "I"; include visible evidence; be specific about actions and element labels; use exact error phrasing when throwing errors.
- **Don't**: Add irrelevant background or long digressions; leave ambiguous references (avoid "something" or "it"); invent unseen UI elements.

**Templates directory / reuse**
- Keep short templates for common micro-actions: search, click-first-result, open-menu, close-popup, select-option, wait-for-load, scroll-to-bottom, type-value.
- Example micro-template (search):
  - T1: "I am on <page>. My task is to search for '<term>' and return <value>."
  - T2: "I can see the search field with placeholder '<placeholder>'; it is empty/contains '<value>'."
  - T3: "I should type '<term>' into the field and press Enter to start the search."

**QA guidance for reviewers**
- Validate that each step contains the required three concepts (start/diff, current state, next action). If additional thoughts are present, ensure they change or clarify the chosen action.
- Check that return or error messages are precise and copyable.
- Check that the phrasing is agent-first-person and uses visible UI evidence.

**Examples Bank (copy-ready variations)**
- Use these to generate alternate CoTs for the same action (good for data augmentation):
  - Variation A (succinct): "T1: I am on <page>... T2: I see <element>... T3: Click <element> to <outcome>."
  - Variation B (explanatory): "T1: On <page>, goal: <task>. T2: The <element> exists but is <state>; that suggests <reason>. T3: I will <action> to produce <expected outcome>."

**Practical tips**
- Prefer concrete element names (button text, field labels). If unknown, use positional hints (top-right menu labeled 'Account').
- Avoid conditional language without follow-up: if you say "might be broken" add the verification action in the same thought set.
- Keep templates short enough to be copy-paste friendly into the annotation interface.

---
This file consolidates our current best practices. If you want, I can also:
- generate a short checklist `docs/COT_QA_CHECKLIST.md` for quick reviewer reference, or
- produce pre-filled micro-templates as a JSON file used by the tool.

File created: `docs/COT_OFFICIAL.md`
