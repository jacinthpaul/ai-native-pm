# assets/

Supporting visuals, diagrams, and media referenced across the repo.

## Subfolders

| Folder | Contents |
|--------|----------|
| `images/` | Screenshots, photos, UI examples |
| `diagrams/` | Architecture diagrams, flowcharts, frameworks |

## Naming Convention

All asset files must be:
- Lowercase
- Hyphen-separated
- Descriptive enough to understand the content from the filename alone

Examples:
- `agentic-loop-diagram.png`
- `human-in-the-loop-spectrum.svg`
- `ai-feature-launch-timeline.png`

Include the folder context in the name to avoid collisions across folders.

## How to Reference Assets in Articles

Use relative paths from the article's location:

```markdown
![Alt text description](../assets/diagrams/agentic-loop-diagram.png)
```

Always include meaningful alt text — it improves accessibility and SEO.

## File Size and Format Guidelines

| Type | Preferred Format | Max Size |
|------|-----------------|----------|
| Diagrams | SVG (scalable, small) | — |
| Screenshots | PNG | 1MB |
| Photos | JPG | 1MB |

Do not store PDFs, videos, or files already hosted externally. Link to external content instead of mirroring it here.
