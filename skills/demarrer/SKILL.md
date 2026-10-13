---
name: demarrer
description: Start or resume the Messaging Me setup (WhatsApp number, AI agent, chat bubble) for this project.
disable-model-invocation: true
---

# Start Messaging Me

The user wants to set up Messaging Me (WhatsApp) for this project now, or to resume a setup they began earlier.

1. Use the `mise-en-service` skill of this plugin and follow it from its first section: it starts with `get_setup_state`,
   so a setup that was already started resumes where it stopped.
2. If the `messagingme` tools are not available, the server is not authorized yet: ask the user to type `/mcp`, select
   `messagingme`, then Authenticate. A browser page opens, where they sign in (or create their workspace with Google)
   and click Authorize. Then call `get_setup_state`.

Speak the user's language.
