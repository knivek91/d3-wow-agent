# PR Creation

## When to Load
Use this skill when creating a pull request.

## Before Creating
1. Search for existing PRs to avoid duplicates
2. If the PR fixes an issue, note the issue number for reference

## PR Title Format
Use conventional commits: `<type>: <short description>`

Types:
- `fix:` — bug fixes, error corrections, preventive fixes
- `feat:` — new features, enhancements
- `chore:` — tooling, config, CI/CD, dependencies (no code logic changes)
- `refactor:` — code restructuring without behavior change
- `poc:` — proof of concept, experimental

## Labels
Apply the corresponding label based on the PR type:

| Type | Label |
|------|-------|
| `fix:` | `bugfix` |
| `feat:` | `enhancement` |
| `chore:` | `chore` |
| `refactor:` | `refactor` |
| `poc:` | `poc` |

If none of the above apply, leave unlabeled.

## Assignee
Set `knivek91` as the assignee.

## PR Body Structure
Use this template:

### Summary
Up to 2 paragraphs explaining what the PR does and why.

### Changes
Bullet list of files changed, with a brief description of each change.

### Testing
Checklist of what was verified:
- [ ] `npm run build` succeeds
- [ ] TypeScript compiles (`npx tsc --noEmit` or note pre-existing errors)
- [ ] Manual testing performed (describe what was tested)

Omit sections that are not relevant (e.g., no checklist if it's a trivial config change).
