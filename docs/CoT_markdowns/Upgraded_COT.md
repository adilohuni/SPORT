# Upgraded COT

 Upgraded Cot
**Goal:** Update guidelines on how we add thoughts to trajectories.

**Context:** Traditionally we have adhered to a rigid format for adding thoughts to trajectories [Chain-of-Thought Annotations: Chain-of-Thought Annotation [Outdated]](https://quip-amazon.com/xMMwAiPPbfhu#temp:C:MYA4ec11a4b46814fca9f12df119).
Our current guidelines specify:

We are looking to augment each action (i.e. workflow step) with a caption that consists of **3 lines of reasoning ‘thoughts’:**

1. **Thought 1: Start state overview / Screenshot difference + prior action assessment**
    1. Note: This will depend on whether it’s Step 1 or Step >1
    2. **Thought 2: Current state assessment**
    3. **Thought 3: Next action and expected webpage transition**
        1. Note: This will depend on whether it is the last step

        >**Throughout these captions, we put ourselves in the position of the agent, using “I” to refer to the agent.**


        We’ve found that as we increase complexity of tasks, this structured format doesn’t always allow for the thoughts to accurately reason what’s happening in the trajectory. We carried out an experiment with “high reasoning” trajectories and saw improved model performance. As such, we’d like to be less strict with how we’re adding thoughts to steps and allow annotators to include thoughts that may not follow the traditional structure but add helpful context to the trajectory.

        ***Note: We are still using the above format as a baseline, but adding additional context to steps where it will be helpful***



        **Guidance:**

        * We still always want to include the 3 parts of traditional COT, this update allows for *more* thoughts to be added, not less.
            * **That being said, more text doesn’t equate to better thoughts!**
                * Please make sure that the thoughts/details added directly impact the workflow in some way.
                * Reasoning that includes implicit human knowledge or more directly reflects how humans think is most helpful.
                    * Example: “I need to go to my cart, I know that the cart is typically located in the top right corner of the page and can be reached by clicking on a shopping cart icon”
                    * QC: QCers should look out for extraneous thoughts that don’t give context or contribute to the trajectory in a meaningful way. They should also add thoughts as they find necessary for improving a trajectory.




                    ### Examples:


                    [Example 1:](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?page=0&agentRunId=e4cf3472-482f-4c76-8c87-ffe3f4e6cda6&qa=true)(step 0)

                    **Prompt**: **Search the Blog for the term 'How to', sort the results by most recent, and then click on the first article. After viewing the article, return to the search results page and click on the second article from the list.**

                    **Original Action**: Scroll the page up to find the search bar

                    **New Action**: Click the communities drop down

                    **New Thought**: `"I am on the OVHcloud website, and my task is to search the blog for the term 'How to', sort the results by most recent, and then click on the first article.**I need to search the blogs but I don't see a search field or the blogs page . The blogs page might be an option in the Communities menu, since blogs are often the way that online/website communities interact.** I should select the communities dropdown tab to view the options and see if Blogs is there. **** `

                      **Added Context**: Added the context that Blogs might be under Communities, therefore we wouldn’t have to scroll up the page to find a search bar


                      [Example 2:](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=06c925f4-ce2d-4341-abaa-294cf765f1fe&page=0)(step 2)

                      **Prompt**: **Please add the first item in the Balms Section to my cart in fig green.**

                      **Original Action**: selecting the fig green option immediately, even though the color name is not visible

                      **New Thought**: `"I am now on the product page for the first result Balm Dotcom, meaning my last action was successful. f**to select a fig green option but none of the colors are labeled. There is only one color option that is close to green and it is a yellowish green color similar to the top of a fig.** I should select the yellowish green color option to check if it's the fig green color option."`

                      **Added Context**: Explained that there is only one green color, and it is similar to the top of a fig, so we should select that option first to see if it’s correct

                      [Example 2:](https://internal-tools.autonomy.agi.amazon.dev/agent-runs?agentRunId=f6e69825-11fb-4782-b38f-c55d1c645cde&page=0)(step 8)

                      **Prompt**: Find 5 available studio apartments in Boston under $10,000/month that were listed in the last 7 days, sorted by newest first, and record their addresses and prices

                      **Original Action**: retyping in 10000 since the original has the + symbol

                      **New Thought**: `"The 'Price' dropdown is now expanded, so my last action was successful. I can see a 'Max price' field that is currently populated with '$10,000+'. **That would indicate that I want to see houses over 10,000 when I only want to see 10000 and under.** I should type '10000' into the 'Max price' field to change it to '10000'."`

                      **Added Context**: Explained we only want to see 10000 and under
                      34
                    `"`
