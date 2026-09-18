# Claude Code Integration Notes

Use the installed `webmcp` skill as the authoritative workflow.

Before editing application code:

1. Read the target repository structure.
2. Read the relevant `.webmcp/references/` files.
3. Inspect existing components and dependencies.
4. Determine the actual business process.
5. Adapt the templates rather than copying them unchanged.

Do not create demo data, fallback behavior, or unrelated refactors.

Do not overwrite unrelated Claude configuration.

If required business behavior is unavailable from the repository and user request, report the missing requirement rather than inventing an implementation.
