<!--
title: Agentic AI — A Primer for Product Managers
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: agents, agentic-ai, product-management, foundations
difficulty: beginner
-->

# Agentic AI: A Primer for Product Managers

## Overview

An AI "agent" is a system that can take a sequence of actions to achieve a goal — not just generate a response. This changes the PM's job. Instead of specifying what a feature should display, you're specifying what a system is allowed to do. This primer explains the key concepts without the engineering jargon.

## Key Concepts

### The Agent Loop

At its core, every agent runs through a loop:

1. **Perceive** — receives input (user request, data, environment state)
2. **Plan** — decides what actions to take to achieve the goal
3. **Act** — uses tools to take those actions (browse the web, run code, send a message, query a database)
4. **Observe** — sees the result of the action
5. **Repeat** until the goal is complete or a stop condition is hit

As a PM, you don't need to build this loop — but you do need to define its boundaries.

### Tools Are the Agent's Hands

An agent's capabilities are defined by the tools it has access to. A tool is any function the model can call: search the web, read a file, send an email, place an order, call an API.

**The tool list is a product decision.** Giving an agent access to a tool is giving it the ability to take that action. Think carefully about:
- What can go wrong if this tool is used incorrectly?
- Is this action reversible?
- Should this action ever require human approval?

### Memory Types

| Memory Type | What It Is | PM Implication |
|-------------|-----------|----------------|
| In-context | What's in the current conversation window | Gets lost between sessions |
| External | Databases, files, knowledge bases the agent can query | Needs access controls and maintenance |
| Procedural | Stored instructions or learned workflows | May need versioning and oversight |

### Orchestration vs. Subagent Roles

In multi-agent systems, some agents orchestrate (plan and delegate tasks) while others execute (take specific actions). Think of it like a project manager and individual contributors.

As a PM, the key question is: **who is accountable when something goes wrong in a multi-agent pipeline?** That accountability must be designed in from the start.

### The PM's Questions for Any Agentic Feature

Before scoping an agentic feature, answer these:

1. **What is the agent's goal?** (One clear sentence)
2. **What is the stop condition?** (How does it know it's done?)
3. **What tools does it need?** (And what tools should it explicitly not have?)
4. **What can the agent do that is irreversible?** (These are the highest-risk actions)
5. **When should it pause and ask a human?** (Define the escalation triggers)
6. **What does the fallback look like if the agent fails?**

Use the [Agent Design Brief template](../08_Templates/template-agent-design-brief.md) to work through these before engineering starts.

## Practical Application

**The minimum viable agentic PRD addition:**

Any PRD for an agentic feature should include these four elements beyond the standard template:

| Element | Question It Answers |
|---------|-------------------|
| Tool inventory | What can the agent do? |
| Guardrails | What can it never do? |
| Autonomy level | How much human oversight is required? |
| Failure behaviour | What happens when it can't complete the task? |

## Further Reading

- [Designing Human-in-the-Loop Checkpoints](./designing-human-in-the-loop-checkpoints.md) — this repo
- [Template: Agent Design Brief](../08_Templates/template-agent-design-brief.md) — this repo
- [GenAI Mental Models for PMs](../01_Foundations/genai-mental-models-for-pms.md) — this repo
