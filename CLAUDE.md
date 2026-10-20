# Personal website: agent quick-reference

One product line of the same company as AL's HQ (`~/life`); the global rules
in `~/.claude/CLAUDE.md` apply here in full. Read `BRIEF.md` first: it holds
every design decision already made, so don't re-derive them.

- **Facts come from `~/life/corpus/achievements/`.** Nothing about Ram goes on
  the site unless it's there. Don't invent numbers.
- **Copy is in his voice:** `~/life/.claude/skills/writing/` (the `writing`
  skill and its `reference/voice.md`). No em dashes, no credential stacking.
- **Not AI-looking** is the requirement that overrides taste: specificity and
  asymmetry over uniform grids, Inter and fade-up-on-everything (`BRIEF.md`).
- Vanilla HTML/CSS/JS unless a dependency earns its place; say why when adding
  one.
- Check it in a real browser (the `playwright` MCP) before calling anything
  done.
