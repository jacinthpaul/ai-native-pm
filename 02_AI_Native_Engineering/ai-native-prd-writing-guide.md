<!--
title: Writing PRDs in the Age of AI
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: prd, documentation, ai-assisted, product-management
difficulty: intermediate
-->

# Writing PRDs in the Age of AI

## Overview

AI doesn't replace the PM's judgment in a PRD — it removes the blank-page problem and accelerates the scaffolding. This guide covers how to use AI to write better PRDs faster, and what the AI PRD must include that a traditional PRD often omits: the specification of AI behaviour itself.

## Key Concepts

### What Changes vs. What Stays the Same

**What stays the same:**
- The PM owns the problem statement, success metrics, and trade-off decisions
- Stakeholder alignment is still a human process
- The PRD is still a communication tool, not just a document

**What changes:**
- First drafts can be generated in minutes, not hours
- AI can flag missing sections or inconsistencies
- PRDs for AI features require new sections that traditional templates don't include

### New Sections Required for AI Features

A PRD for a feature that includes AI behaviour needs to explicitly specify:

**AI Behaviour Specification**
- What the AI should do (in plain language)
- What the AI must never do (guardrails)
- What happens when the model is uncertain or low confidence
- When the system escalates to a human

**Failure Modes**
- What does a bad output look like?
- How does the product behave when the model fails?
- Is there a fallback to a non-AI experience?

**Evaluation Criteria**
- How will you know the AI is performing acceptably post-launch?
- Who reviews model outputs, and how often?

### The AI-Assisted PRD Workflow

**Step 1: Brief the model with full context**

Don't start with "write me a PRD for X." Start with context:
> "I'm a PM at a [company type] building a [feature type] for [user type]. The problem we're solving is [problem statement]. Our success metric is [metric]. Here are the constraints: [constraints]. Now help me draft a PRD outline."

**Step 2: Generate the scaffold, then deepen it**

Use the AI output as a first-draft skeleton. Every section it generates should be interrogated: Is this what we actually decided? Is there a constraint the model doesn't know about?

**Step 3: Write the AI behaviour specification yourself**

This section should not be AI-generated. You need to think through the behaviour specification with your team — it requires real decisions about trust, autonomy, and acceptable risk.

**Step 4: Stakeholder review loop**

Use AI to generate a summary version of the PRD for stakeholders who need the TLDR:
> "Summarise this PRD in 5 bullet points for an executive audience who care about business impact, timeline, and risk."

## Practical Application

The ready-to-use template for AI feature PRDs is in:
[08_Templates/template-ai-prd.md](../08_Templates/template-ai-prd.md)

Copy it, fill in the brackets, and delete the instructional comments before sharing.

**Common mistakes when using AI for PRD writing:**

- Accepting the first draft without checking it against what was actually discussed in discovery
- Omitting the AI behaviour specification section because it's hard to write
- Using AI-generated success metrics that sound good but aren't measurable in your system
- Not specifying the fallback experience when the AI fails

## Further Reading

- [Template: AI PRD](../08_Templates/template-ai-prd.md) — this repo
- [AI-Assisted Product Discovery](./ai-assisted-product-discovery.md) — this repo
- [Playbook: Launching an AI Feature](../05_Execution_Playbooks/playbook-ai-feature-launch.md) — this repo
