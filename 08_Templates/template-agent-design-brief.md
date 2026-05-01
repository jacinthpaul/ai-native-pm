<!--
title: Template — Agent Design Brief
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: template, agent, agentic-ai, design-brief
difficulty: intermediate
-->

<!-- HOW TO USE THIS TEMPLATE
     Use this before scoping any agentic feature — before engineering starts, not after.
     The brief forces clarity on scope, autonomy level, and guardrails.
     Fill in every section. If you can't answer a question, that's a signal to resolve it before building.
     Delete this comment block before sharing.

     For background on agentic AI concepts, see:
     03_Agentic_Workflows/agentic-pm-primer.md
     03_Agentic_Workflows/designing-human-in-the-loop-checkpoints.md
-->

# Agent Design Brief: [Agent Name]

## 1. Agent Purpose

[One sentence: what problem does this agent solve, and for whom?]

---

## 2. Trigger and Invocation

| Field | Value |
|-------|-------|
| How is the agent triggered? | User action / Scheduled / Event-based / API call |
| Who can trigger it? | [Role or user segment] |
| Is there a rate limit or usage cap? | |

---

## 3. Goal and Stop Condition

**Goal:**
[What does a successful single run look like? Define the output or outcome.]

**Stop condition:**
[What causes the agent to stop and return results? Be specific.]

**What "done" looks like:**
[How does the user or system know the agent has finished?]

---

## 4. Tool and Action Inventory

| Tool / Action | What It Does | Reversible? | Requires Human Approval? |
|---------------|-------------|-------------|--------------------------|
| | | Yes / No | Yes / No |
| | | Yes / No | Yes / No |
| | | Yes / No | Yes / No |

**Tools the agent must NOT have access to:**
- [Any tools explicitly excluded and why]

---

## 5. Autonomy Level

Select one:

- [ ] **Fully manual** — agent assists, human takes every action
- [ ] **Human-in-the-loop** — agent proposes, human approves before each action
- [ ] **Human-on-the-loop** — agent acts, human reviews asynchronously
- [ ] **Fully autonomous** — agent acts, no regular human oversight

**Rationale for selected level:**
[Why is this the right level of autonomy for this use case and user context?]

---

## 6. Human Checkpoint Triggers

The agent must pause and request human approval before proceeding when:

- [ ] It is about to take an irreversible action: [specify which actions]
- [ ] Confidence falls below threshold: [define threshold if applicable]
- [ ] The task crosses a permission boundary: [specify]
- [ ] The task affects another user's data or account
- [ ] Other: [specify]

**Checkpoint UX:**
[What does the user see at a checkpoint? What information do they need to make a decision?]

---

## 7. Guardrails

The agent must never:
- [Action or output 1]
- [Action or output 2]
- [Action or output 3]

**How guardrails will be enforced:**
[System prompt constraints / output filtering / tool access controls / human review]

---

## 8. Failure Modes and Fallbacks

| Failure Mode | Expected Agent Behaviour |
|--------------|--------------------------|
| Tool unavailable | |
| Ambiguous or incomplete input | |
| Goal not achievable with available tools | |
| Infinite loop detected | |
| Rate limit hit | |
| User abandons mid-task | |

---

## 9. Logging and Observability

| Field | Value |
|-------|-------|
| What is logged per run? | [Inputs, tool calls, outputs, errors] |
| Log retention period | |
| Who reviews anomalies? | |
| Alert threshold for error rate | |

---

## 10. Open Questions

| Question | Owner | Due Date |
|----------|-------|----------|
| | | |
| | | |
