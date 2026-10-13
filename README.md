# Messaging Me for Claude Code

WhatsApp for your app, from Claude Code: an official WhatsApp number, an AI agent that answers your customers and a
chat bubble for your site, set up in one session with [Messaging Me](https://app.messagingme.fr/en/developers/).

## Install

In Claude Code:

```
/plugin marketplace add julienmessagingme/messagingme-plugin
/plugin install messagingme@messagingme
```

Then type `/mcp`, select `messagingme` and Authenticate: a browser page opens, where you sign in (or create your
workspace with Google) and click Authorize. Then:

```
/messagingme:demarrer
```

Claude checks where your workspace stands and takes you through the number, the AI agent, the bubble and a test from
your phone. An interrupted setup resumes where it stopped.

## What's inside

- the Messaging Me MCP server (`https://api.messagingme.app/mcp`), authorized with OAuth: no key in your files;
- `/messagingme:demarrer`, the setup entry point;
- skills: the setup (`mise-en-service`), the WhatsApp rules (`regles-whatsapp`) and the FAQ (`faq`).

## Update

The plugin does not update on its own. In Claude Code: `/plugin`, Marketplaces tab, `messagingme`, "Update marketplace"
(or "Enable auto-update"). In a terminal: `claude plugin update messagingme@messagingme`. The new version loads in the
next session, or after `/reload-plugins`.

If you had added the server by hand before (`claude mcp add ... messagingme`), remove it: `claude mcp remove
messagingme`. Otherwise Claude sees every tool twice.

## Documentation

- API and MCP: https://console.messagingme.app/developers/api
- For language models: https://console.messagingme.app/llms.txt

Published from the `plugin/` folder of the Messaging Me repository: do not edit this repository by hand.
