# Contributing to ai-native-pm

Welcome, and thank you for contributing. This knowledge base grows through people sharing what they know — no coding background required.

---

## Before You Start

1. Read this document in full.
2. Read the [Code of Conduct](./CODE_OF_CONDUCT.md).
3. Check open [Issues](https://github.com/jacinthpaul/ai-native-pm/issues) to avoid duplicating work.
4. Browse the relevant folder to understand the expected format before writing.

---

## Types of Contributions

| Type | Description |
|------|-------------|
| New article or guide | Original content in any of the 10 topic folders |
| Template | A reusable PM template (add to `08_Templates/`) |
| Case study | A real-world or anonymized example (add to `09_Case_Studies/`) |
| Correction | Fixing an error, outdated info, or stale link |
| Tool entry | Adding or updating a tool in `04_Tools_Stack/` |
| Research pointer | Adding a reading list entry in `10_Research_and_Trends/` |

---

## File and Folder Naming Conventions

| Rule | Convention | Example |
|------|-----------|---------|
| Case | All lowercase | `prompt-engineering-basics.md` |
| Separator | Hyphens only (no underscores, no spaces) | `ai-product-roadmapping.md` |
| Style | Descriptive noun phrase | `sprint-planning-with-llms.md` |
| Templates | Prefix with `template-` | `template-prd-with-ai-assist.md` |
| Case studies | Prefix with `case-study-` | `case-study-copilot-adoption.md` |
| Folder READMEs | Always `README.md` | `README.md` |
| Assets | Lowercase, hyphenated | `agentic-loop-diagram.png` |

Do not include version numbers in filenames. Use git history for versioning.

---

## Article Format Standard

Every article must begin with a frontmatter metadata block:

```html
<!--
title: Your Article Title
author: Your Name (or "Anonymous")
date_added: YYYY-MM-DD
last_updated: YYYY-MM-DD
tags: tag-one, tag-two, tag-three
difficulty: beginner | intermediate | advanced
-->
```

**Required sections in every article:**

1. **Overview** — what the article covers and who it's for (2–4 sentences)
2. **Key Concepts** — the core ideas, explained clearly
3. **Practical Application** — how a PM would apply this (concrete steps, examples, or a checklist)
4. **Further Reading** — links to related content in this repo and/or external resources

**Word count target:** 400–1,500 words per article. Quality over length.

**What not to include:**
- Promotional or affiliate content
- AI-generated content that has not been meaningfully edited by a human
- Content outside the scope of AI PM practice

---

## How to Submit a Contribution

1. **Fork** this repository.
2. **Create a branch** with a descriptive name:
   ```
   git checkout -b add/your-article-name
   ```
3. **Add your file** to the correct folder, following the naming and format conventions above.
4. **Open a Pull Request** against the `main` branch using the PR template.
5. **Address review feedback** — maintainers aim to respond within 7 business days. Two rounds of review maximum.

### PR Title Convention

Format: `[FolderNumber_FolderName] Short description`

Examples:
- `[03_Agentic_Workflows] Add guide on multi-agent orchestration`
- `[07_Metrics_and_KPIs] Fix stale link in reading list`

---

## Review Process

All PRs are reviewed by maintainers. Feedback will be constructive and specific. We are committed to a respectful, efficient review process.

If your PR has not received a response within 7 business days, feel free to comment on the PR to follow up.

---

## Questions?

Open a GitHub Issue with the label `question`, or reach out at contact.jacinth@gmail.com.
