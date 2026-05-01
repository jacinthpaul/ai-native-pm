<!--
title: Case Study — Rolling Out AI-Powered Search in a SaaS Product
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: case-study, search, rollout, saas, ai-feature
difficulty: intermediate
-->

<!-- NOTE: This is a scaffold / example case study to show the expected format.
     It is based on a generalised pattern from multiple real-world rollouts.
     Contributors: replace this with a real case study from your own experience.
     See template-case-study.md for the blank template.
-->

# Case Study: Rolling Out AI-Powered Search in a SaaS Product

## Context

| Field | Value |
|-------|-------|
| Industry | B2B SaaS (knowledge management) |
| Company stage | Growth |
| Team size | 12 (3-person PM/design/eng pod for this feature) |
| PM's role | Product Manager |
| Anonymised? | Yes |
| Year | 2024 |

---

## The Situation

The product had a keyword-based search that users consistently rated poorly. Exit surveys showed that ~40% of users who used search couldn't find what they were looking for. The team had tried improving ranking logic twice, with limited results.

When semantic search using LLM embeddings became cost-viable in 2023–2024, the PM proposed replacing the keyword search entirely. The challenge: no internal baseline existed for what "good search" looked like for this product's specific content and user base. The team had to define quality from scratch.

---

## What Was Built or Done

The team replaced keyword search with a semantic search system using embedding-based retrieval. A language model reranked results and generated a brief contextual summary for the top result. Users could still see the full result list below.

---

## The Process

**Phase 1: Define "good" before building**

Before any engineering work, the PM worked with support and power users to create a test set of 200 real queries with expected results. This became the evaluation dataset used throughout development — without it, the team would have had no objective way to compare keyword vs. semantic search.

**Phase 2: Parallel testing**

Both systems ran simultaneously in a shadow mode for 3 weeks. The PM reviewed a sample of queries where the systems disagreed. This revealed that semantic search was significantly better on natural language queries but occasionally worse on exact-match queries (e.g., searching for a specific document name).

**Phase 3: Staged rollout with escape hatch**

The team shipped semantic search to 10% of users with a "switch back" option if they preferred the old search. The escape hatch was used by less than 3% of users — mostly power users who relied on exact-match queries. The team built a hybrid mode for this segment.

---

## Results

**Quantitative outcomes:**
- Search success rate (user finds what they need in ≤3 results): 40% → 67%
- Search abandonment rate: 38% → 19%
- Support tickets related to search: -34% in the 60 days post-launch

**Qualitative outcomes:**
- Power users who relied on exact-match search were frustrated until the hybrid mode shipped (6 weeks after GA)
- The team's internal vocabulary shifted: "search quality" became a trackable metric, not a vibe

**Timeframe:**
- 8 weeks from discovery to GA for the initial release
- Hybrid mode shipped 6 weeks after GA

---

## What Worked

- Defining the evaluation dataset before building. Without it, "is this better?" would have been a subjective debate.
- The escape hatch for the rollout. Low usage, but it removed the risk objection from stakeholders and gave real data on who was unhappy.
- Separating the launch of semantic search (broad) from the hybrid mode (targeted fix for power users).

---

## What Didn't Work / Lessons Learned

- Underestimating power user impact. The PM had assumed "most users" would benefit and deprioritised the exact-match segment. They were right about the numbers but wrong about the influence: that segment included the company's largest accounts.
- The contextual summary added latency that users complained about. Removing it improved perceived speed with minimal quality impact — the team had over-built.

---

## What We'd Do Differently

- Segment the user base before defining success metrics. "Search success rate" averaged across all users masked the power-user degradation.
- Prototype the contextual summary with users before building it into the launch — the latency cost wasn't worth it for this use case.

---

## Key Takeaways for Other PMs

1. Build your evaluation dataset before you build the feature. If you can't define "good" without the model, you can't ship confidently.
2. The users who are loudest are not always the majority — but they may be the most valuable. Segment your rollout analysis.
3. Escape hatches cost little and buy a lot in stakeholder confidence. Use them on any meaningful UX change.

---

## Further Reading

- [Measuring AI Feature Performance](../07_Metrics_and_KPIs/measuring-ai-feature-performance.md) — this repo
- [Playbook: Launching an AI Feature](../05_Execution_Playbooks/playbook-ai-feature-launch.md) — this repo
