<!--
title: Playbook — Running Sprint Ceremonies with AI Assist
author: Jacinth Paul
date_added: 2026-05-01
last_updated: 2026-05-01
tags: agile, sprint, ceremonies, ai-assist, playbook
difficulty: beginner
-->

# Playbook: Running Sprint Ceremonies with AI Assist

## Trigger

Use this playbook when you want to introduce AI assistance into standard Agile sprint ceremonies — planning, standups, reviews, and retrospectives. Useful for any PM running sprints who wants to reduce ceremony overhead without losing the value of the rituals.

**Important caveat:** AI should augment ceremonies, not replace them. The value of ceremonies is in the conversation, alignment, and shared understanding — not the artefacts.

---

## Sprint Planning with AI

**Before the ceremony:**

Use AI to prepare a backlog summary so the team can spend planning time on decisions, not reading tickets.

Prompt:
> "Here are this sprint's candidate tickets: [paste titles and descriptions]. Summarise the top 5 by priority, flag any that seem ambiguous or have missing acceptance criteria, and identify any dependencies I should raise with the team."

Review and correct the summary before sharing it. Never paste AI output directly into a team meeting without reviewing it first.

**During the ceremony:**

Use AI to support estimation discussions (not to replace them):
> "Here's a ticket description: [paste]. What unknowns or risks would you flag that the team should discuss before estimating?"

**After the ceremony:**

Generate the sprint commitment document:
> "Here are the tickets we committed to this sprint and their story point estimates: [list]. Write a one-paragraph sprint goal summary and a bullet list of the key commitments."

---

## Daily Standups

**For async teams:** Use AI to synthesise written standup updates into a daily digest.

Prompt (run on collected standup updates):
> "Here are today's standup updates from the team: [paste updates]. Summarise the key progress, blockers, and any items that need PM attention."

**For synchronous standups:** Keep AI out of the room. Standups are about connection and coordination — they're already short enough that AI assistance adds friction, not value.

---

## Sprint Review

Generate a draft sprint summary from ticket data before the review:
> "Here are the tickets completed this sprint: [list with descriptions]. Write a sprint review summary highlighting what was shipped, the user impact of each item, and any items that were deferred and why."

Use this as a starting point — it will need enrichment with context the model doesn't have (stakeholder reactions, demos that happened, decisions made).

---

## Sprint Retrospective

**Collecting inputs:** Use AI to anonymise and cluster retrospective input from a shared doc or retro tool:
> "Here are 24 retrospective inputs from the team: [paste inputs]. Group them into 4–6 themes and summarise each theme in one sentence."

**Important:** Share the themes with the team and let them verify the clustering before using it to drive the discussion. AI categorisation can miss nuance and merge distinct concerns.

**Generating action items:** After the discussion, use AI to draft the action items:
> "Based on these retrospective themes and our discussion notes, suggest 3 concrete, owner-assigned action items for next sprint."

---

## Outputs

At the end of applying this playbook you should have:
- [ ] A cleaner, faster sprint planning meeting
- [ ] Sprint commitment document generated and reviewed
- [ ] Daily async standup digest running (if async team)
- [ ] Sprint review summary drafted before the ceremony
- [ ] Retrospective themes clustered and verified by the team

## Common Gotchas

- **Team disengagement when AI "does the ceremony":** If team members feel the ceremony is just consuming AI output, they disengage. AI should prepare inputs, not run the show.
- **Sharing unreviewed AI output in ceremonies:** A bad summary from AI in a planning meeting wastes everyone's time and erodes trust in the PM's preparation.
- **Data privacy with standup tools:** Be careful about what standup content you send to third-party AI tools, especially if it includes sensitive business or personnel information.
- **AI retro clustering missing the real issue:** Sometimes the most important retrospective point is one person's comment that gets diluted in clustering. Review AI output with the team, not just for them.

## Further Reading

- [AI Tools for PM Workflows](../04_Tools_Stack/tools-for-pm-workflows.md) — this repo
- [AI-Assisted Product Discovery](../02_AI_Native_PMO/ai-assisted-product-discovery.md) — this repo
