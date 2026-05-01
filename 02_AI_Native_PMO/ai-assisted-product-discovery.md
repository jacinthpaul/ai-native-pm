<!--
title: AI-Assisted Product Discovery
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: discovery, research, ai-assisted, product-management
difficulty: intermediate
-->

# AI-Assisted Product Discovery

## Overview

Product discovery — the process of identifying and validating problems worth solving — is one of the highest-leverage places to apply AI. This article covers how to use AI to accelerate desk research, support problem framing, and synthesise inputs, while keeping human judgment at the centre of the process.

## Key Concepts

### What AI Changes (and What It Doesn't)

AI accelerates the *synthesis* and *structuring* parts of discovery. It does not replace the need to talk to users, understand context, or make judgment calls about what matters.

What AI does well in discovery:
- Synthesising large volumes of text (reviews, support tickets, survey responses)
- Generating alternative framings of a problem
- Identifying themes across disparate sources
- Producing first-draft research summaries and competitive overviews

What AI does poorly:
- Understanding the emotional nuance behind user behaviour
- Knowing what data is absent from its context
- Making value judgments about what a company should care about

### Phase 1: Desk Research Acceleration

Before jumping into user interviews, AI can help you build context fast.

**Prompt patterns that work:**

Competitive landscape summary:
> "I'm a PM at a [type of company] building [type of product]. Summarise the competitive landscape for [problem space], focusing on key player positioning, gaps in current solutions, and what users complain about most."

Market signals synthesis:
> "Here are 30 customer support tickets from the past month: [paste tickets]. Identify the top 5 recurring themes and suggest which represent product problems vs. support/training gaps."

**Watch out for:** AI will synthesise what's in its context. If your data is biased, the synthesis will be too. Always interrogate the output.

### Phase 2: Problem Framing with AI

Once you have raw inputs, AI can help you reframe problems and stress-test assumptions.

**Useful techniques:**

*Jobs-to-be-done reframing:*
> "Here's the problem statement I'm working with: [your statement]. Reframe this using the jobs-to-be-done lens — what is the user trying to accomplish, and what are the functional, emotional, and social dimensions?"

*Devil's advocate framing:*
> "Here are my top 3 assumptions about this problem. For each one, give me the strongest argument for why it might be wrong."

### Phase 3: Opportunity Scoring

Once you have a list of potential problem spaces, AI can help you think through relative priority — but the final call is always yours.

**Prompt approach:**
> "Here are 6 opportunity areas we've identified. Score each one against these criteria: market size, user pain intensity, our ability to solve it, and strategic fit with our roadmap. Use a 1–5 scale and explain your reasoning."

Review the scores critically. The model doesn't know your company strategy, competitive position, or engineering constraints unless you provide them.

## Practical Application

**AI-assisted discovery workflow (adapted to your process):**

| Step | Activity | AI Involvement |
|------|----------|----------------|
| 1 | Define the problem space | Human-led |
| 2 | Desk research and competitive scan | AI-accelerated |
| 3 | User interview planning | AI drafts questions, human reviews |
| 4 | Interview synthesis | AI clusters themes, human validates |
| 5 | Problem statement drafting | AI generates options, human selects |
| 6 | Opportunity sizing | AI supports, human owns the estimate |

## Further Reading

- [Writing PRDs in the Age of AI](./ai-native-prd-writing-guide.md) — this repo
- [AI-Driven Feature Prioritisation](../06_Use_Cases/use-case-ai-driven-prioritization.md) — this repo
- [08_Templates — AI PRD Template](../08_Templates/template-ai-prd.md) — this repo
