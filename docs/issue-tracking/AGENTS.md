# AGENTS.md — operating the tracker

Prefer the CLI over hand-editing frontmatter.

```bash
pnpm tracker:next
pnpm tracker:show SY-0009
pnpm tracker:move SY-0009 in_progress
pnpm tracker:lint
```

## Always

- Start from `track next`, not from a wish list.
- Run `track lint` before you commit.
- Update the issue in the same commit as the code.
- Check acceptance boxes only with evidence.
- Cite files and doc sections, not "the code".

## Never

- Delete an issue file.
- Edit `config.yml` without a human decision.
- Set `priority` (product-owned).
- Close an issue you did not execute.
- Hand-edit `index.md` (generated).
- Write `blocks:` by hand except through the seeder/linter inverse.

Only dependency-free, specified issues are `ready`. One agent owns an
`in_progress` issue at a time.
