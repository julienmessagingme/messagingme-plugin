# Messaging Me for Claude Code

WhatsApp for your app, from Claude Code: an official WhatsApp number, an AI agent that answers your customers and a
chat bubble for your site, set up in one session with [Messaging Me](https://app.messagingme.fr/en/developers/).

**No account to create, no key to copy. No WhatsApp number? We provide one. All you need is a Meta Business account.**

## Install

In Claude Code:

```
/plugin marketplace add julienmessagingme/messagingme-plugin
/plugin install messagingme@messagingme
```

Then type `/mcp`, select `plugin:messagingme:messagingme` and Authenticate: a browser page opens. Continue with Google
(no account yet? your workspace is created right then, with no form) and click Authorize. Nothing to create first. Then:

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

If you had added the same server by hand before (same address, any name), Claude Code keeps yours and sets the
plugin's aside: no duplicate tools, your authorization stays valid. To switch to the plugin's, remove the old one with
`claude mcp remove` followed by its name.

## Data and privacy

The plugin runs no code on your machine: it contains instructions for Claude (skills and a command) and declares one
remote server, the Messaging Me MCP server at `https://api.messagingme.app/mcp`. It talks to nothing else.

- **Authorization.** You sign in to Messaging Me in your browser (OAuth), as an administrator of your workspace. No key
  or secret is stored in your files, and you can revoke the access from the console at any time.
- **What is sent.** When Claude calls a tool at your request, the server receives that call and its arguments (for
  example the text of a message to send, the settings of an AI agent, or the address of a website to import as
  knowledge). It does not receive your conversations with Claude.
- **What comes back.** The data of your workspace that the tool returns: conversations and messages, contacts,
  templates, AI agents, statistics. Actions that change your workspace (sending a message, activating an agent,
  opening a payment page) are marked as such, and payments always happen on Stripe's page, by you.
- **Before you start.** A Messaging Me account (created during the setup), and for WhatsApp a Facebook account and a
  Meta business portfolio. Messages that Meta bills are charged by Meta to your WhatsApp Business account.

Messaging Me is published by Messaging Me SAS (SmartLink), Paris. Privacy policy:
https://www.messagingme.fr/en/politique-de-confidentialite-messaging-me/. Terms of use: https://www.messagingme.fr/en/conditions-d-utilisation/. Support:
https://app.messagingme.fr/contact/.

## Documentation

- API and MCP: https://console.messagingme.app/developers/api
- For language models: https://console.messagingme.app/llms.txt

Published from the `plugin/` folder of the Messaging Me repository: do not edit this repository by hand.
