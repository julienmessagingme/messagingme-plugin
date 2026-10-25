---
name: shopify
description: Connects the user's Shopify store to Messaging Me so that customers receive WhatsApp messages when an order is paid or shipped, and a reminder when they abandon a checkout, and imports the store's customers who subscribed to marketing - creates the store app with the Shopify CLI in the merchant's own organization, installs it with one click, keeps its secret and sets the messages. Use when the user wants to connect Shopify, send order confirmations, shipping updates or abandoned checkout reminders on WhatsApp, import their Shopify customers, or check or cut the Shopify connection.
allowed-tools: mcp__plugin_messagingme_messagingme__get_shopify_state, mcp__plugin_messagingme_messagingme__preview_shopify_customers, mcp__plugin_messagingme_messagingme__list_templates, mcp__plugin_messagingme_messagingme__get_template_status, mcp__plugin_messagingme_messagingme__get_setup_state
---

# Connect a Shopify store

Speak the user's language. The merchant types no command: you run them, and explain each step in one plain sentence
before doing it. The user only signs in to Shopify (once, in the browser the CLI opens) and clicks Install on a link
you give. A link exists for the user only once you write it, in full, as plain text on its own line.

## Before anything

- Call `get_shopify_state`. If a store is already connected, say which one and go straight to the messages.
- The workspace needs its WhatsApp number connected (`get_setup_state`); without it, nothing can be sent: connect it
  first, with the questions of the setup (`connecter_numero` in the `mise-en-service` skill), which explain to the
  merchant why the official API sends the store's messages and the QR code does not. Read its track
  (`numero.filiere`): `api` is the official API, with templates approved by Meta, and everything below applies. On
  `application`, a number linked by QR code, Shopify messages cannot go out: WhatsApp does not let a linked device write
  first to a customer (it cuts or blocks the number), and an order confirmation, a shipping update or a checkout
  reminder writes first. Say it plainly before going on, with the way forward: the merchant keeps the WhatsApp
  Business app and connects the SAME number through Meta (say "keep your WhatsApp Business app", never the word
  coexistence, even when a tool result uses it): `start_whatsapp_connection` with mode `coexistence`, then
  `watch_whatsapp_connection` in the same mode; Meta's window creates the Meta Business account, the conversations
  stay, and what they type in the app does not show in Messaging Me yet. Or another number through Meta.
  `set_shopify_message` refuses them on such a number.
- Node.js must be installed (`node --version`). On Windows, call the CLI with `npx.cmd`, not `npx`: PowerShell blocks
  `npx` by its execution policy.

## Create the app in the merchant's organization

The app is created in the organization that owns the store, never in ours: that is what lets the store open it without
any Shopify review.

1. Find the organization: `npx @shopify/cli@latest organization list --json`. The CLI opens the browser to sign in the
   first time. Take the organization that has a store; if several do, ask the user which one by its name.
2. Find the store: `npx @shopify/cli@latest store list --organization-id <id> --json`. Its `store` field is the
   `<name>.myshopify.com` domain. If several stores are listed, ask which one.
3. In a new folder (for example `messagingme-shopify` in the user's home), run
   `npx @shopify/cli@latest app init --no-input --template=none --name=messagingme --organization-id=<id> --package-manager=npm`,
   then delete the sample extensions it adds in its `extensions` folder.
4. Replace the content of its `shopify.app.toml` with the block below, keeping the client id that `app init` wrote.
   Its application URL is the page Shopify opens right after Install: it tells the user to come back here. Keep it in
   French for a French-speaking user, otherwise use https://app.messagingme.fr/en/shopify/installed/ instead.
5. Publish: `npx @shopify/cli@latest app deploy --no-input --allow-updates`.

```toml
client_id = "<kept from app init>"
name = "Messaging Me"
application_url = "https://app.messagingme.fr/shopify/installe/"
embedded = false

[access_scopes]
scopes = "read_customers,read_orders,read_checkouts,read_fulfillments"

[webhooks]
api_version = "2026-10"

  [[webhooks.subscriptions]]
  topics = [ "orders/create", "orders/paid", "fulfillments/create", "checkouts/create", "checkouts/update", "app/uninstalled" ]
  uri = "https://api.messagingme.app/shopify/webhooks"

  [[webhooks.subscriptions]]
  compliance_topics = [ "customers/data_request", "customers/redact", "shop/redact" ]
  uri = "https://api.messagingme.app/shopify/webhooks"

[auth]
redirect_urls = [ "https://shopify.dev/apps/default-app-home/api/auth" ]
```

## Install it and connect it

1. Give the user this link, built from the store and the client id, and ask them to click Install:
   https://admin.shopify.com/store/<name>/oauth/install?client_id=<client id>
   Shopify then opens a Messaging Me page saying it is installed and to come back to Claude Code. The same link
   approves new access later, after an update of the scopes.
2. Once they say it is installed, read the app's keys with `npx @shopify/cli@latest app env show --no-input`. Do not
   repeat the secret to the user.
3. Call `connect_shopify` with `store`, `client_id` (SHOPIFY_API_KEY) and `client_secret` (SHOPIFY_API_SECRET). A refusal
   says what to do: the app is not installed yet (give the link again), it is not in the store's organization, or the
   keys are wrong.

## Set the order messages

On the official API (track `api`), two events can send a message: `order_paid` (the order is paid) and `order_fulfilled` (it is shipped, with tracking).

1. Propose a short text for each, then create it as a utility template with `create_template`. Links go in the body as
   variables (`order_status_url`, `tracking_url`): a URL button takes no variable. The data each event can fill:
   - `order_paid`: `first_name`, `order_number`, `order_total`, `order_status_url`;
   - `order_fulfilled`: `first_name`, `order_number`, `carrier`, `tracking_number`, `tracking_url`.
2. Wait for Meta to approve it (`get_template_status`), then call `set_shopify_message` with `event`, `template`,
   `language` and `variables`, the data of {{1}}, {{2}}... in order, as many as the template has.
3. Ask the user whether their customers agreed to receive WhatsApp messages from them. Only if the user says so, pass
   `customers_consented`: their customers' records then become opted in everywhere, campaigns included, and the merchant
   is responsible for that consent. Every new `connect_shopify` clears this answer, so ask again after a reconnection;
   `customers_consented` set to false withdraws it.

Each message goes through the sending rules of Messaging Me (STOP, consent, monthly templates, contact limit) and shows
up in Campaigns, one line per order.

## Remind abandoned checkouts

A third event, `checkout_abandoned`, sends one reminder when a customer filled the checkout with their phone and did
not order. It is a marketing message, so it needs the consent answer above: `set_shopify_message` refuses it until the
user affirms that their customers agreed (`customers_consented`).

1. Propose a short reminder and create it as a marketing template with `create_template`, the link in the body. Its
   data: `first_name` and `checkout_url` (the link that reopens the checkout).
2. Once Meta approves it, call `set_shopify_message` with `event` set to `checkout_abandoned`, its `variables`, and
   `delay_minutes`: how long after the checkout last changed the reminder leaves (60 by default, from 15 to 4320).
3. Only one reminder per checkout, and none if an order came out of it in the meantime, even unpaid.

## Import the store's customers

Only the customers who subscribed to marketing in Shopify (email or SMS) and have a valid phone are imported. Imported
through Claude, they arrive opted in: the user declares that they agreed, under the user's own responsibility, and their
records say who declared it. Never ask the user about consent. A customer who said STOP stays opted out. Each imported
record counts toward the plan's contact limit, and managing that limit is the user's call.

1. Count first with `preview_shopify_customers`, which writes nothing. Tell the user, in plain words: how many subscribed
   customers have a phone, how many are already in the workspace, how many are new, how many free places the plan
   leaves, and how many an import would write. When `complete` is false, these numbers are a minimum: older customers
   were not read yet, and importing again later takes the next ones.
2. Let the user choose: import up to the free places (the newest customers first), fewer, or move to a higher plan first
   (`get_plan`). Never import before they answer.
3. Call `import_shopify_customers` with `max_contacts`, the number they chose. A number above the free places is refused
   and nothing is written. The records are tagged Shopify; calling again imports the next ones without duplicates.

## Check or cut

- `get_shopify_state`: the store, its messages, the last event received, the last 30 days of outcomes (sent, opted
  out, contact limit reached...) and, for checkout reminders, the last 7 days (a checkout is kept no longer). On the Free plan there is no console: this tool is the way to see the connection.
- `disconnect_shopify` stops every message. The app stays installed on the store: only the user can uninstall it, from
  the store apps page the tool returns.
