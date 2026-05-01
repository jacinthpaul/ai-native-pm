<!--
title: Trend Watch — Agentic AI in Product (2025–2026)
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: trends, agentic-ai, product, 2025, 2026
difficulty: intermediate
-->

# Trend Watch: Agentic AI in Product (2025–2026)

## About This Document

A living snapshot of the agentic AI trend as it affects product management practice. Updated quarterly — check `last_updated` above.

*This document captures what's true as of May 2026. Some of this will be out of date by the time you read it. Use it as context, not gospel.*

---

## The Macro Trend: From Chat to Action

The dominant AI product pattern of 2023–2024 was the chat interface — users type a message, the model responds. In 2025–2026, the dominant pattern is shifting toward **agentic systems**: AI that can take a sequence of actions to accomplish a goal, not just respond to a query.

This shift is driven by:
- Better tool use and function calling in frontier models
- Lower latency making multi-step agent loops practical
- Enterprise appetite for automation beyond chat
- Investment in agent orchestration frameworks (LangGraph, AutoGen, Claude Agent SDK, etc.)

The result: PMs are increasingly being asked to define products where "the AI does something" rather than "the AI says something."

---

## What's Actually Shipping (vs. What's Hype)

**Shipping and proven:**
- Coding agents (Cursor, GitHub Copilot Workspace, Claude Code) — well-established, clear ROI
- Customer support agents with tool access (web search, ticket creation, escalation)
- Document processing agents (extract, classify, route)
- Research agents for knowledge workers (search, summarise, synthesise)

**Early but gaining traction:**
- Sales development agents (prospect research, email drafting, CRM update)
- Internal operations agents (HR, IT helpdesk, expense processing)
- Product analytics agents (generate queries, interpret results, flag anomalies)

**Overhyped / Not yet reliable:**
- Fully autonomous business process execution without human-on-the-loop
- General-purpose personal agents that handle complex, multi-domain tasks
- Agents in high-stakes regulated domains without significant oversight infrastructure

---

## Product Implications for PMs

**New UX paradigms**

The agent model changes the interaction contract. Instead of "I ask, you answer," it's "I delegate, you act." This requires new UX patterns:
- Showing the agent's plan before execution (not just the result)
- Progress indicators for multi-step tasks
- Transparent logs of what the agent did
- Clear escalation and override mechanisms

**New trust challenges**

Users are willing to delegate repetitive, low-stakes tasks immediately. High-stakes or irreversible tasks require earned trust — typically through demonstrated reliability on lower-stakes tasks first. Product strategy should reflect this: start with the task that's hardest to get wrong, not the task that's most impressive.

**The role of the PM is changing**

PMs building agentic products need to make decisions they didn't have to make before:
- What is the agent's scope of autonomy?
- What can it do that is irreversible, and how is that gated?
- How do users maintain meaningful control without re-doing the work themselves?
- Who is accountable when an agent makes an error?

---

## PM Role Evolution

Skills increasingly appearing in job descriptions for AI PM roles:
- Prompt engineering and LLM evaluation
- Familiarity with agent frameworks and architecture patterns
- Experience designing human-in-the-loop workflows
- Understanding of AI safety and responsible AI principles

Skills that remain foundational and are not being displaced:
- User research and discovery
- Prioritisation and roadmap ownership
- Stakeholder communication
- Cross-functional leadership

---

## Companies and Products to Watch

| Company / Product | Why It Matters for PMs |
|-------------------|------------------------|
| Anthropic (Claude Agent SDK) | Defines the developer primitives many products are built on |
| OpenAI (Operator / GPT Actions) | Setting the consumer-facing pattern for web-browsing agents |
| Salesforce Agentforce | Enterprise-scale agentic AI rollout — case study in managed deployment |
| Cursor / GitHub Copilot Workspace | Most mature human-in-the-loop agent products; study how they handle uncertainty |

---

## Open Questions for PMs Building Agentic Products

1. What does product-market fit mean for an agent? (Task completion rate? Hours saved? User trust scores?)
2. How do you measure user trust in an autonomous system — and how do you know when you've lost it?
3. What is the right escalation UX for an agent that encounters something it can't handle?
4. How do you handle agent errors in a product where the error may have real-world consequences?
5. As agents become capable of replacing PM activities (research, synthesis, spec writing), what is the PM's irreducible value?

---

## Further Reading

- [Agentic AI: A Primer for Product Managers](../03_Agentic_Workflows/agentic-pm-primer.md) — this repo
- [Designing Human-in-the-Loop Checkpoints](../03_Agentic_Workflows/designing-human-in-the-loop-checkpoints.md) — this repo
- [Curated Reading List: AI PM Foundations](./reading-list-ai-pm-foundations.md) — this repo
