# Gasket Project Guidelines

## Git Standards

- **Conventional commits** are required and enforced via commitlint (husky
  commit-msg hook).
- **Format:** `<type>[optional scope]: <description>` (e.g. `feat(button): add
  disabled state`, `fix(select): correct focus trap`).
- **Common types:** `feat` (user-facing change), `fix` (bug fix), `docs`,
  `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`. Use lowercase;
  description is imperative, no period at the end.
- When suggesting or writing commit messages, use this format so they pass the
  hook.

## Development

- Prefer interfaces over types so they can be easily extended and shared
- Reduce the amount of code comments and use descriptive variable and function
  names. Comments are only necessary if the intent is not obvious.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer,
  if any.
