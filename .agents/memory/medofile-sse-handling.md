---
name: Medofile SSE handling
description: Reliable parsing requirements for streamed AI responses in the web and mobile clients.
---

Streamed AI responses must be parsed with a pending text buffer because a ReadableStream chunk can split a single SSE line. Process complete lines only, then flush the final pending line when the stream ends.

**Why:** Prescription analysis and doctor recommendation metadata were intermittently missing when JSON events were split across transport chunks.

**How to apply:** Preserve the buffer/parser pattern whenever chat or prescription streaming is changed, and keep a visible fallback message for an empty completed stream.