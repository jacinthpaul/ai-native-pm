<!--
title: Use Case — AI-Driven Feature Prioritisation
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: prioritisation, use-case, product-management, backlog
difficulty: intermediate
-->

# Use Case: AI-Driven Feature Prioritisation

## Problem Statement

PMs at growing companies face a common bottleneck: hundreds of feature requests arriving through support tickets, NPS surveys, sales calls, and user interviews — and not enough time to evaluate them all rigorously. Ad hoc prioritisation leads to squeaky-wheel bias, missed patterns, and low-confidence roadmap decisions.

## AI Opportunity

**What AI can realistically do here:**
- Synthesise and categorise large volumes of unstructured input (tickets, reviews, survey verbatims) at a speed no human team can match
- Surface recurring themes and quantify frequency of signals
- Apply prioritisation frameworks (RICE, ICE, WSJF) to a set of candidates, given criteria you define
- Generate first-draft rationales for prioritisation decisions

**What AI still cannot replace:**
- Strategic judgment about what your company should focus on
- Context about engineering effort, dependencies, and technical debt
- Stakeholder alignment — AI can support the conversation, it cannot have it
- The decision itself — that remains with the PM

## Implementation Approach

**Step 1: Consolidate and clean your inputs**

Gather all feature requests and signals into a single spreadsheet or document. The more context in each item (source, verbatim quote, estimated user segment), the better the AI synthesis.

**Step 2: AI-assisted categorisation**

Prompt:
> "Here are 80 feature requests from the last quarter: [paste list]. Group them into 6–8 themes. For each theme, summarise what users want and how many requests fall into it."

Review the clustering. Merge or split themes where the model got it wrong. Add strategic context the model doesn't have.

**Step 3: Score against your criteria**

Provide the model with your prioritisation criteria and ask it to score each theme:
> "Here are my 6 prioritisation criteria and their weights: [list]. Here are the 8 themes from step 2. Score each theme against each criterion on a scale of 1–5 and provide a brief rationale. Note: you don't have data on engineering effort — flag that as unknown for each item."

**Step 4: PM review and final ranking**

The AI output is a starting point. Review every score, correct where the model lacks context, add engineering effort estimates, and run your own judgment over the final ranking.

**Step 5: Document the rationale**

Use AI to draft the prioritisation rationale document that you'll share with stakeholders:
> "Here is my final priority ranking and the scores for each item. Draft a one-paragraph rationale for the top 3 priorities that explains the decision in terms of user impact and strategic fit."

## Outcome Indicators

You've done this well if:
- The prioritisation conversation with stakeholders is about strategy, not about defending the process
- You can trace every item in your ranking back to a user signal
- The PM feels more confident in the ranking, not less

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| AI reinforces existing bias in historical data | Actively look for under-represented user segments in your inputs |
| Stakeholders distrust AI-generated rankings | Be transparent that AI was used for synthesis, not decision-making |
| Model categorises items incorrectly | Always review clusters before using them — AI gets this wrong regularly |
| Over-reliance on frequency (what's loudest, not what's most important) | Explicitly weight strategic fit and underserved segments in your criteria |

## Further Reading

- [AI-Assisted Product Discovery](../02_AI_Native_PMO/ai-assisted-product-discovery.md) — this repo
- [Template: AI PRD](../08_Templates/template-ai-prd.md) — this repo
- [Measuring AI Feature Performance](../07_Metrics_and_KPIs/measuring-ai-feature-performance.md) — this repo
