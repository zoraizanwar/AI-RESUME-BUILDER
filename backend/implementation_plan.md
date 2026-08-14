# Groq Integration Plan

**Goal**: Verify that the Groq API key is loaded, the Groq provider is selected, the configured Llama model is detected, and a test Groq API request succeeds.

## User Review Required
- None. The changes are additive and backward‑compatible.

## Open Questions
- No open questions.

## Proposed Changes
---
### backend/ai/config.py
- Extend `get_ai_provider()` to recognise `AI_PROVIDER=groq`.
- Return an instance of the new `GroqProvider` (import lazily).

---
### backend/ai/providers/groq_provider.py
- Already created (GroqProvider implementation).

---
### requirements.txt (or pyproject)
- Ensure `groq` and `python-dotenv` are listed as dependencies.

## Verification Plan
- Install required packages.
- Run a small script that loads `.env`, calls `get_ai_provider()`, and invokes `generate_structured_json` with a trivial schema.
- Confirm the script prints the provider name, model, and that no API key is printed.

### Automated Tests
- No unit tests added (out of scope for now).

### Manual Verification
- Observe console output confirming Groq key presence and successful API call.

**Note**: All changes avoid touching any Job Matcher scoring logic.
