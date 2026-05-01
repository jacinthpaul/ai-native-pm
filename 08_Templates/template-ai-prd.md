<!--
title: Template — AI Feature PRD
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: template, prd, ai-feature, product-management
difficulty: beginner
-->

<!-- HOW TO USE THIS TEMPLATE
     Copy this file into your working documents folder.
     Replace all [BRACKETS] with your content.
     This template is intentionally comprehensive — it's a checklist, not a requirement to fill everything.
     Delete sections that don't apply to your feature.
     Delete this comment block before sharing.
     
     For guidance on using AI to help write PRDs, see:
     02_AI_Native_PMO/ai-native-prd-writing-guide.md
-->

# PRD: [Feature Name]

## Document Control

| Field | Value |
|-------|-------|
| Author | |
| Date | |
| Status | Draft / In Review / Approved |
| Version | |
| Stakeholders | |

---

## 1. Problem Statement

[Describe the user problem or opportunity in 2–4 sentences. What is the user trying to do? What is stopping them or making it harder than it should be? Why does this matter now?]

---

## 2. Goals and Success Metrics

**Goals:**
- Goal 1: [Measurable, time-bound]
- Goal 2:

**Success metrics:**

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|--------------------|
| Primary: | | | |
| Secondary: | | | |

**Non-goals (explicitly out of scope):**
- This PRD does not cover:

---

## 3. Users and Context

**Primary user:**
[Who is this for? Role, context, level of experience.]

**User story:**
> As a [user type], I want to [action] so that [outcome].

---

## 4. AI Behaviour Specification

*This section is unique to AI features. Fill it in with the team — do not leave it to be generated.*

**What the AI should do:**
- [In plain language — what is the AI's job in this feature?]

**What the AI must never do (guardrails):**
- [Actions or outputs that are off-limits, regardless of user input]

**Confidence and uncertainty handling:**
- If confidence is low, the system should: [e.g., show a disclaimer / offer alternatives / ask for clarification]
- Minimum confidence threshold before output is shown: [define if applicable]

**Human escalation triggers:**
- The system escalates to a human (or falls back to a non-AI experience) when:
  - [Condition 1]
  - [Condition 2]

**Fallback experience:**
[What happens if the AI fails entirely? Is there a non-AI path?]

---

## 5. Solution Overview

[Describe what you're building. 1–3 paragraphs or a diagram. Avoid implementation detail at this stage — focus on the user experience and behaviour.]

---

## 6. User Experience

**Key flows:**
[Describe the main user journey(s). Consider using a numbered list of steps.]

**How AI output is presented:**
[What does the user see? Is it clearly labelled as AI-generated?]

**How users provide feedback on AI output:**
[Thumbs up/down? Edit inline? Report a problem?]

---

## 7. Data Requirements

| Requirement | Details |
|-------------|---------|
| Training / fine-tuning data needed | |
| Evaluation dataset needed | |
| PII / privacy considerations | |
| Data retention policy | |

---

## 8. Technical Constraints

| Constraint | Value |
|-----------|-------|
| Model / provider | |
| Latency requirement (P95) | |
| Cost ceiling per query | |
| Context window requirements | |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| | | | |
| | | | |

---

## 10. Launch Plan

- Rollout approach: [Staged / Feature flag / Full launch]
- Target launch date: [YYYY-MM-DD]
- Rollback trigger: [State the specific condition that would trigger rollback]
- Human review plan: [How will AI outputs be monitored post-launch?]
- Link to full launch playbook: [05_Execution_Playbooks/playbook-ai-feature-launch.md]

---

## 11. Open Questions

| Question | Owner | Due Date |
|----------|-------|----------|
| | | |
| | | |
