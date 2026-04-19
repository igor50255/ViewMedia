@echo off
setlocal

REM ====== НАСТРОЙКИ ======
set "ANTHROPIC_AUTH_TOKEN=sk-b23a2e2c786df59d-de27ff-1c236767"
set "ANTHROPIC_BASE_URL=http://localhost:20128/v1"
set "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1"
set "ANTHROPIC_MODEL=kr/claude-sonnet-4.5"

echo Starting Claude Code via OmniRoute...
claude

endlocal