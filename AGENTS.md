# Local development

- Run Next.js on the host in development mode with automatic updates when source files change. Use `powershell -ExecutionPolicy Bypass -File .\start-dev.ps1` from this directory.
- The website runs at http://localhost:31997. SQL Server and Azurite remain in Docker. The startup script waits for dependencies and stops the Docker web container to free the port.
- Do not rebuild or run the Docker web image for routine website edits unless the user explicitly asks for it.
- Preserve existing database content and media. Do not run database seeds during routine startup.
- After editing, verify the running local page displays the change before reporting success.
- Keep local credentials in the ignored `apps/web/.env` file; do not put them in documentation or commits.
- Also follow `apps/web/AGENTS.md` when working in that directory.
