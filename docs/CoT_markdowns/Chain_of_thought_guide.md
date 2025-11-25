NOTE:
This is an internal documentation, avoid fetching links in this doc for personel use 

# Chain of Thought Guide

Chain of Thought is a prompt engineering technique used to improve the reasoning abilities of a model, by instructing it to generate a logical progression of thoughts before providing an answer (in our case: an action). For the model to be able to report its reasoning, we must teach it first, which means writing the CoT in its name. That means writing step-by-step reasoning behind the model actions in 3 building blocks (thoughts), in the first person, for every action/screenshot of a run.


# Where to annotate

In Agent Run Viewer (ARV), select the “Thoughts” tab on the right panel and the text fields should appear below the screenshots. That’s where the CoT should be added or edited.

[Image: Click on the first Icon to open the hidden section.png]Once you click on the icon, the thoughts section will become visible.
[Image: Untitled design.png]

# How to annotate

The CoT for each step should contain all 3 thoughts (described below), but keep in mind that they differ depending on whether the model is at the first, middle, or the final step of the task. Besides the required elements, it’s recommended to include the relevant description of visual indicators of a change, elements placement on the site, etc. The order of elements in each Thought can be changed, but the order of the Thoughts cannot.








[**Screenshot Difference and Action Assessment**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327)






[**Current State Assessment**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0)







[**Next Action and Expected Result**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228)
[Image: diag2.png]







[**Start State Overview**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ5c7620d8dd414481a007e6154)








[**Goal State Assessment**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa3312574a35a463699579b568)







[**Return Information**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJd5d8f241da6840ac9eb0e2342)


## **The first step/Step 0**

Keep in mind that the steps are indexed from 0, so the first step = Step 0.

* Thought 1: **Start State Overview**, which means the starting state assessment (the site) and the objective (the prompt). In other words, this thought should contain 2 elements: *where am I + why am I there
    *

    [Image: T1_1.png]
    * Thought 2: **Current State Assessment**, so what we need to do next, and the reasoning: what can we see to help us get what we need and what is currently ‘wrong’ with the situation. That means this thought should contain 3 elements: *what do I need to do + relevant element + what is currently “wrong”.*

    [Image: T1_2.png]
    * Thought 3: **Next Action and Expected Result** - based on the reasoning described in Thought 2, what action will be taken and what we expect to achieve by it. This thought should contain 2 elements: *what should I do + expected result.*

    [Image: T1_3.png]

    ## **Middle steps**

    The CoT rules are the same for all steps that are not the first or the final step.

    * Thought 1: **Screenshot Difference and Action Assessment**, which means what changed on the current screenshot in comparison to the previous one, and based on this change, was the previous action successful/correct or not. This thought should contain 2 elements: *what changed + was my action successful.*

    [Image: T2_1.png]
    * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) as in Step 0.

    [Image: T2_2.png]
    * Thought 3:[**_Next Action and Expected Result_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228)as in Step 0.

    [Image: T2_3.png]

    ## **The final step**

    * Thought 1:[**_Screenshot Difference and Action Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327) as in the middle steps.

    [Image: image]
    * Thought 2: **Goal State Assessment**, which means reiteration of the actions taken in previous steps to complete the task and describing the relevant information displayed on the last screenshot. This thought should contain 1 element: *what have I done.*

    [Image: image]
    * Thought 3: **Return Information** – information whether the task is complete or not, whether returning a specific value is required, and based on that, what kind of return should be performed. This thought should contain 3 elements: *is the task complete + return information + appropriate return.*

    [Image: last_t3.png]
    * Examples: [The run used above](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=a2282574-19cc-41af-828e-f496896260e1&startDate=1756628328790&page=0)



    ## Alternate cases

    #### **AgentError**

    When the prompt cannot be fulfilled, it can sometimes end with an error. This could happen, e.g., if completing the task would require using a functionality that would make sense to be present on the website, but it is unavailable at the moment.

    * Thought 1: [**_Screenshot Difference and Action Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327), as usual.
    * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0), as usual.
    * Thought 3: [**_Return Information_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJd5d8f241da6840ac9eb0e2342) – as the run won’t end with a return, the information about task not being complete should be present. Instead of information about the return, information about the error should be present. _The specific wording used to describe the contents of the error should also be the content of the error message_.
        * When possible, prioritize adding a negative prefix or suffix to the appropriate adjective over using the particle “not“, e.g. “unavailable” rather than “not available”.

        [Image: Error_t3.png]
        * Examples: [Throwing an error 1](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=664d8c38-e80b-4513-a3ed-4990346cedff&startDate=1756974036763&page=0)


            #### **Native Dropdown**

            A native dropdown is a dropdown element that inherits its appearance from the browser, which causes its options to be invisible on the screenshot. The only way to discern whether the dropdown on the page is a native one, is to actually click on it in the People Planner during a run.
            For more details about native dropdowns refer to the [Native Dropdown Guide](https://quip-amazon.com/cfJZAivp5juS).

            * Thought 1:[**_Screenshot Difference and Action Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327) – as the native dropdown is not visible on the screen, acknowledging that the list has been made available should replace the screenshot difference part.

            [Image: ND_t1.png]
            * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) – since the model doesn’t see the native dropdown as other elements on the screen, it cannot click on the required option, it has to type in the value for its label to select it. The value and the label should be described here.

            [Image: ND_t2.png]
            * Thought 3: **** [**_Next Action and Expected Result_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228), as usual.
            * Examples: [Native Dropdown 1](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=e8782abe-cfd5-4a71-9d4f-f62deafbadd3&page=0&startDate=1756977604146) ,


                #### **External Failure**

                In most cases an external failure would mean an actuation issue with a relevant element.

                * Thought 1: [**_Screenshot Difference and Action Assessment_**_,_](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327) as usual.
                * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) – it’s recommended to specify that the previous action still needs to happen and, e.g., the website error may have occurred, or the relevant element might be broken.

                [Image: ext_t2.png]
                * Thought 3:
                    * [**_Next Action and Expected Result_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228) – if we’re repeating the same action again, it’s recommended to add that it’s supposed to not only achieve its original purpose but also verify if the element we’re interacting with is working.

                    [Image: ext_t3.png]
                        * [**_AgentError_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ107b862f5a914a25b11d5a61a) - If selecting the same element 2 times or other workaround was unsuccessful.
                        * Examples: [External Failure 1](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=2ea01471-0705-4328-b541-2345838fc978)



                        #### Wait step

                        In some cases, webpage might take time to load completely and hence, some elements may not be visible.

                        * Thought 1: [**_Screenshot Difference and Action Assessment_**_,_](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327) as usual.
                        * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) – check and validate whether the webpage is still loading.
                            In some cases, you might not be able to validate that the webpage is still loading. In such situation you can rely on higher-level reasoning.
                            * Thought 3: [**_Next Action and Expected Result_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228) – i.e. Wait for the website to fully load so that all elements and results are displayed.

                            [Image: image(6).png]

                            #### **Higher Reasoning**

                            It’s recommended to add context to steps where it will provide relevant or necessary context to the action we are going to take. Sometimes that means adding to thoughts reasoning beyond basic observation, calling on common knowledge and more closely imitating a human way of thinking.

                            * Thought 1: [**_Start State Overview_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ5c7620d8dd414481a007e6154) / **** [**_Screenshot Difference and Action Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327) as usual, although sometimes more detailed explanation of why we think the action was successful or not might be needed.
                            * Thought 2:[**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) **** - in most cases that’s where the higher reasoning will come to play.

                            [Image: reasoning_t2.png]
                            * Thought 3: [**_Next Action and Expected Result_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228) / [**_Return Information_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJd5d8f241da6840ac9eb0e2342), as usual.
                            * Original Update: [Upgraded COT](https://quip-amazon.com/WboxA05RooCb)
                            * Examples: [Higher Reasoning 1 (Step 2)](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=88d684f2-92c5-4f6f-8a23-2bd875bde954&startDate=1756981559339&page=0)


                                #### **Model Memory**

                                The model should be able to remember past actions and screenshots starting from the first step.

                                * Thought 1:[**_Start State Overview_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ5c7620d8dd414481a007e6154) **** / **** [**_Screenshot Difference and Action Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ212ab5c7064e4a2087e949327), as usual.
                                * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) **** - when the model has to remember or recall some information, it should be described in the second thought.

                                [Image: memory_t2.png][Image: recall_t2.png]
                                * Thought 3: [**_Next Action and Expected Result_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ42bd06e39e364e3aa3e50a228) / [**_Return Information_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJd5d8f241da6840ac9eb0e2342), as usual.
                                * Examples: [Model Memory 1 (Steps 2 & 6)](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=88d684f2-92c5-4f6f-8a23-2bd875bde954&startDate=1756981559339&page=0)


                                    #### **1-step tasks**

                                    * Thought 1:[**_Start State Overview_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJ5c7620d8dd414481a007e6154), as usual.
                                    * Thought 2: [**_Current State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa2ca215ed29144128b701aae0) / **** [**_Goal State Assessment_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJa3312574a35a463699579b568) **** - as this step is the first step and the final step at the same time, those two has to be somewhat merged.

                                    [Image: 1step_2fixed.png]
                                    * Thought 3: [**_Return Information_**](https://quip-amazon.com/XBDWAahjWuJ0/Chain-of-Thought-Guide#temp:C:YGJd5d8f241da6840ac9eb0e2342), as usual.
                                    * Examples: [1-step 1](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=ba709a93-1f52-4454-9fc8-b22b5dc712fc&startDate=1756645500074&page=0)


                                        #### Captcha

                                        In the scenarios where the model encounters a Captcha challenge, but the prompt does not provide any instructions or context for solving it, the model will usually suggest `"I should not impersonate a human, or mis-direct being one by solving captchas or any other challenge`." in the last thought. When adjusting the CoT to match our guidelines, please include this phrase in the 2nd thought.

NOTE:
This file is internal documentation. External/internal links were removed and replaced with inline explanations and examples.

# Chain of Thought Guide

Chain of Thought is a prompt-engineering technique used to improve reasoning by instructing the agent to generate a short progression of thoughts before taking an action. For our annotations, record three short, first-person "thoughts" for every action/screenshot of a run.

# Where to annotate

In Agent Run Viewer (ARV) open the "Thoughts" tab on the right to reveal the text fields under screenshots. Enter or edit CoT text there.

# How to annotate

The CoT for each step should contain three thoughts. The structure varies for first, middle, and final steps. Include visible indicators of change, element placement, and concise reasoning. The order of elements inside a thought can vary, but keep the sequence: Thought 1 → Thought 2 → Thought 3.

Core summary:

- Thought 1: Screenshot difference / start assessment
- Thought 2: Current state assessment
- Thought 3: Next action and expected result / return info

## The first step (Step 0)

- Thought 1 — Start State Overview: where am I and the task objective (where am I + why am I here).
- Thought 2 — Current State Assessment: what to do next, visible elements that support the decision, and what is wrong or missing (what do I need to do + relevant element + problem).
- Thought 3 — Next Action and Expected Result: explicit action and expected outcome (what should I do + expected result).

## Middle steps

- Thought 1 — Screenshot Difference & Action Assessment: what changed from the prior screenshot and whether the previous action succeeded (what changed + was the action successful).
- Thought 2 — Current State Assessment: as above.
- Thought 3 — Next Action & Expected Result: what to do next and what to expect.

## Final step

- Thought 1 — Screenshot Difference & Action Assessment: as above.
- Thought 2 — Goal State Assessment: summarize the actions taken and the relevant content visible now (what have I done).
- Thought 3 — Return Information: is the task complete, what to return (if anything), or the precise error message to throw (is the task complete + return info + return value/error).

## Alternate cases

### AgentError

If the task cannot be completed due to missing site functionality or an unavailable feature, include the usual thoughts but make Thought 3 the precise error message. The error message in the thought should match exactly the message that will be thrown (e.g., "There is no price filter."). Prefer adjectives like "unavailable" rather than negative constructions.

### Native dropdowns

Native dropdowns use browser controls and options might not be visible. When a native dropdown is opened, record that the list is available (Thought 1), describe the label↔value mapping in Thought 2 (e.g., label 'June' ↔ value '6'), and in Thought 3 type the needed value to select the option.

Example (native dropdown):

T1: "The dropdown is open, so my last action succeeded."

T2: "I need to set the Month to June. The dropdown shows the value '6' corresponding to June, but the label is not visible in the screenshot."

T3: "I should type '6' into the dropdown to set the month to June."

### External Failure

If an element appears unresponsive, document that the prior action still needs to happen and suggest a hypothesis (e.g., page error, broken control). In Thought 3, repeat the action to verify and specify the error to throw if it still fails.

Example (external failure):

T1: "The 'Location (City)' field is still empty; my prior action did not succeed."

T2: "I still need to set 'Boston'; the field may be broken or the page may not accept input."

T3: "I should enter 'Boston' again to verify input; if it still fails, throw 'Location field broken'."

### Wait steps

If a page is still loading, note the loading indicator in Thought 2 and include a wait/verify action in Thought 3: "I see a loading spinner; I should wait for it to disappear before continuing." Prefer explicit verification over indefinite waiting.

### Higher reasoning

Add concise inference only when it changes the action (site conventions, UX patterns). Keep the reasoning short and linked to the chosen action.

### Model memory

When a step relies on previously seen information, recall it explicitly in Thought 2: "I recall from step 1 that <item>, so I will <action> to use that info." Keep recalls precise.

### One-step tasks

For one-step tasks merge first and final behaviors: Thought 1 = start & goal, Thought 2 = current vs goal, Thought 3 = return or error.

### Captcha

If the run encounters a Captcha and no solver instructions are provided, include this exact phrase in Thought 2: "I should not impersonate a human, or mis-direct being one by solving captchas or any other challenge" and then throw an error stating the task cannot continue.

## Examples (copy-ready)

Search example (first step):

T1: "I am on the Ulta homepage. My task is to search for 'Moisturizer' and sort by Price (High to Low)."

T2: "I see an empty search field with placeholder 'Search Ulta Beauty'."

T3: "I should type 'Moisturizer' and press Enter to begin the search."

Scroll example (multi-step):

Step 0 T1: "I am on the job description page; my task is to count occurrences of 'meeting'."

Step 0 T2: "I can see the description section and one occurrence so far; I need to search lower sections."

Step 0 T3: "I should scroll down to look for additional occurrences."

Continue with subsequent steps: when the page scrolls and new sections appear, indicate success in Thought 1 and continue the pattern until you reach final return.

Popup example:

T1: "A popup has appeared; I cannot see if my last action succeeded."

T2: "I see an 'X' icon at the top-right of the popup that should close it."

T3: "I should click the 'X' to close the popup and continue."

Alt output / Error example:

T1: "The filter popup opened, so my last action succeeded."

T2: "There are no price filters in the popup, so the task cannot be completed."

T3: "I should throw an error: 'There is no price filter.'"

## Do / Don't checklist (quick QC)

Do:
- Use first-person "I".
- Include visible evidence (element text, label, position).
- Be specific about actions and element labels.
- Provide exact, copyable error text when throwing errors.

Don't:
- Add irrelevant background or long digressions.
- Use ambiguous references like "it" or "something" without context.
- Invent UI elements that are not visible in the screenshot.

## Practical tips

- Prefer concrete element names. If unknown, use positional hints (e.g., "top-right menu labeled 'Account'").
- If you hypothesize a cause ("might be broken"), pair it with a verification step in the same thought set.
- Keep thoughts short and copy-paste friendly for the annotation UI.

---
This file now contains inline explanations instead of external links. If you want, I can also:

- extract a short `docs/COT_QA_CHECKLIST.md` with the quick QC bullets, or
- generate pre-filled micro-templates as a JSON file for import into the annotation tool.
