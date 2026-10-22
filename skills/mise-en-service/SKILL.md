---
name: mise-en-service
description: Sets up a Messaging Me workspace for WhatsApp, in order and without skipping anything - connect the number, build an AI agent from the user's website, make it answer customers, put the WhatsApp chat bubble on the site, test from a phone. Use when the user wants to set up, connect or finish configuring WhatsApp or Messaging Me, or to resume an interrupted setup.
allowed-tools: mcp__plugin_messagingme_messagingme__get_setup_state, mcp__plugin_messagingme_messagingme__watch_whatsapp_connection, mcp__plugin_messagingme_messagingme__get_plan, mcp__plugin_messagingme_messagingme__get_credit, mcp__plugin_messagingme_messagingme__list_agents, mcp__plugin_messagingme_messagingme__get_agent, mcp__plugin_messagingme_messagingme__list_knowledge, mcp__plugin_messagingme_messagingme__list_widgets, mcp__plugin_messagingme_messagingme__get_number_subscription
---

# Messaging Me setup

Speak the user's language. The tools below belong to the `messagingme` MCP server of this plugin (in Claude Code their
full names start with `mcp__plugin_messagingme_messagingme__`). Explain each step in one or two plain sentences before
doing it; never paste raw tool output at the user. The user does not see tool results: a link or a verification
code exists for them only once you write it, in full, as plain text on its own line (never in a code block, which a
terminal cuts at the edge of the screen).

## Before anything

- If the `messagingme` tools are not available, the server is not authorized: ask the user to type `/mcp`, select
  `plugin:messagingme:messagingme`, then Authenticate (a browser page opens: they sign in, or create their workspace
  with Google, then click Authorize).
- If the user had added the same server by hand before (same address, any name), Claude Code keeps theirs and sets the
  plugin's aside: its tools carry that server's name. If that server uses an API key, the setup tools
  (`start_whatsapp_connection`, `create_agent` and the others that act for a person) are missing from it: when
  `get_setup_state` answers but the tools of `etape_suivante` are not available, ask the user to remove that server
  (`claude mcp remove` followed by its name), then `/mcp`, `plugin:messagingme:messagingme`, Authenticate. Otherwise
  use it as it is.
- **Always start with `get_setup_state`.** It returns what is already done and `etape_suivante`, with the tools for it
  (`outils_suggeres`). Skip what is done. Call it again after each step, and whenever the session resumes.
- Read its `avertissements`: `credit_epuise` (the AI agent cannot answer until the credit is topped up),
  `numero_a_activer` (Meta has not finished activating the number), `carte_meta_a_regler` (Meta blocks the WhatsApp
  account for its payment method, so templates do not go out: give the user the numbered steps of
  `etapes_carte_meta`; it usually clears within 20 minutes of adding the card), `repondeur_gele_par_l_offre` (the responder the
  user chose, such as Meta's agent, is frozen by the current plan: tell them, never replace it), `lecture_manquee:<part>`
  (that part could not be read: say so, do not guess). On the WhatsApp Business app track (`numero.filiere`
  `application`): `numero_coupe` (WhatsApp cut the number, or the device was removed from the phone: nothing goes
  through; offer a new link, or another number if WhatsApp cut it) and `numero_en_sommeil` (no message for 30 days, the
  connection sleeps: a new link wakes it).
- A responder already chosen (`repondeur.mode_choisi` is `mba`, `scenario` or `application`) skips the AI agent steps:
  build an AI agent only if the user asks for one.

## connecter_numero: the WhatsApp number

First the track (`filiere`), unless `numero.filiere` from `get_setup_state` already says `application`. Ask once:
**"Do you have a Meta Business account (a business portfolio at Meta)?"**

- **Yes**: the official WhatsApp API (`filiere` `api`, the default), steps 1 to 4 below.
- **No, or "I don't know"**: the WhatsApp Business app track (`filiere` `application`), for a workspace without a Meta
  Business account: the number is a WhatsApp Business app account linked by a QR code, like a linked device. Say it in
  one sentence before going on: this is not the official API, WhatsApp can cut a number, and Pro needs the API. For a
  trial, recommend a number we provide. Then `start_whatsapp_connection` with `filiere` `application` and mode `fourni`,
  or mode `apporte` with `numero` (the phone number of their WhatsApp Business app account, country code included).
  Relay the `consigne` (the link on its own line, then the steps, one per line), then call `watch_whatsapp_connection`
  with `filiere` `application` in a loop, passing `etat_connu`, until `connecte: true`, following each `suite`: scanning
  the QR code, the verification code to type into the app for a number we provide. No card at Meta on this track.

The `consigne` of `start_whatsapp_connection` for the API starts with what Meta requires (a Meta Business account, that
is a business portfolio, and for their own number one that is not used in the WhatsApp app): relay it once, before the
link.

1. If `numero.fourni` is already set, a number was assigned to the workspace earlier: resume with mode `fourni`,
   without asking again. Otherwise ask which number to use:
   - **a number we provide** (`fourni`): a dedicated number, paid on the page before it is assigned, included in Pro;
   - **their own number** (`apporte`): first ask whether it is used in the WhatsApp app. A number connected to the API
     leaves the WhatsApp app; Meta's window refuses it until it is removed from the app.
2. `start_whatsapp_connection` with that mode returns a link valid for one hour and its `consigne`. Write the full
   `url` on its own line, then the numbered steps of `consigne`, one per line, in the user's language: the page shows
   the same ones. For a number we provide: click the link; pay (or "Get my number" in Pro); click "Open the Meta
   window"; on the number screen, "Enter a new phone number", the country GB (+44), then the digits that follow +44;
   "Text message" if Meta offers the choice; the code shows on the page within seconds, and you write it here too;
   no code after 45 seconds: wait until Meta offers to send it again, then try the other method; go to Meta's last
   screen, "Finish"; only then come back here. Never write "I generated the link" without the link.
3. Call `watch_whatsapp_connection` in a loop, passing the `empreinte` it returned as `etat_connu`, until
   `connecte: true`, or until `a_activer: true` (then see `activer_numero`), and follow the `suite` of each answer.
   When a `code` shows up, write it in full: the user types it into Meta's window. If the user comes back before the
   end ("I paid", "what now?"), tell them again where they are (the page, Meta's window, the number) before waiting
   again. Once `connecte: true`, call `get_setup_state` before announcing anything: the credit offered for the first
   number arrives a few seconds after the connection; if it still reads 0, read it once more a few seconds later.
4. Right after the connection, tell the user to add a card at Meta (Visa or Mastercard), without which templates do
   not go out: the `suite` of `watch_whatsapp_connection` gives the steps, and `get_setup_state` gives them again
   (`etapes_carte_meta`) as long as Meta reports the card missing.

## activer_numero: a number Meta has not activated yet

The number is linked but Meta has not finished its verification: no tool does this step. Ask the user to open the
console's Home and click "Activer le numéro" (it sends a verification code by call or SMS), then call
`get_setup_state` again.

## creer_agent, completer_agent, activer_agent: the AI agent

0. If an agent was deactivated earlier (`agents.desactives`), ask whether to reactivate it or to build a new one:
   reactivating puts it back in the scenarios that use it.
1. Ask, in one short round: what the business does, its website address, the tone (formal or not), when a human
   must take over, whether someone can take over at set hours (which days and hours, and the time zone if not
   France), at any time, or never, and what the agent must never say.
2. `create_agent` with a label (the first agent of a workspace needs a little AI credit: `get_credit`, `buy_credit`).
3. If there is a website: `preview_site`, show the user which pages would be imported, then `import_site`. Without a
   website: `add_knowledge` with what the user tells you, or `import_document_text` for a document they give you. The
   agent cannot be activated without knowledge.
4. `update_agent`: the objective (the field that weighs most on its answers), the tone, the handover rules (when to
   pass to a human) and at least one stop rule (`sorties`). Send the full list of `sorties`: it is replaced as a whole.
   Then the team's hours, which decide what the agent promises when it hands over: at set hours,
   `set_business_hours` (the seven days, closed or one range each) then `set_transfer_mode` with `business_hours`
   (outside those hours the agent says when the team is back); at any time, `set_transfer_mode` with `always`; never,
   `set_transfer_mode` with `never`.
5. `set_agent_tools` with `chercher_connaissance` (the knowledge is only used if this tool is on) and `escalader`,
   unless the user said no human ever takes over: without it, the agent announces a human but nothing hands over.
6. `test_agent` on two or three realistic customer messages (each try is charged to the credit). Show the answers;
   adjust with `update_agent` if the user asks.
7. `activate_agent`. If it refuses, it lists what is missing: complete it, then try again.

## Actions: what the agent does in the user's application

When the user wants the agent to act in their application when a customer asks (cancel a contract, book a callback,
file a complaint), and only then: `set_agent_action` on the agent, with a name, an instruction (when to trigger it,
and what the agent then tells the customer) and the details to collect, each with a code, a label and a type
(`texte`, `nombre`, `date`, `email`, or `liste` with its values), all optional for the agent. The action is sent at
most once a day per contact through the outgoing webhook `agent.action`, unchecked by default. If an address already
serves the app (`list_webhook_endpoints`), add `agent.action` to it (console, Developers > Webhooks sortants, or
`PATCH /v1/webhooks/{id}` with its full list of types) rather than creating a second one, which would have another
secret; otherwise `create_webhook_endpoint` with the type `agent.action`. Then write the handler in the user's app (the
payload is in the API documentation, the details in `fields` by code). Never change a field's code once the app reads
it. To edit an action, `set_agent_action` with its `action_id`: what you leave out stays, `champs` given replaces the
whole list. `get_agent` lists the actions, `get_conversation` shows those triggered in a conversation,
`delete_agent_action` removes one.

## choisir_repondeur: who answers customers

`set_default_responder` with `mode: "agent"` and the active agent's id. Only when `get_setup_state` asks for it: if a
responder is already chosen (Meta's agent, a scenario, the user's application), never change it unless the user asks.

## poser_bulle: the WhatsApp chat bubble

1. `create_widget` with a name and the sentence the visitor will send (it tells which site they come from).
2. Put the returned `balise` (a `<script ... async>` tag) in the project's HTML, just before `</body>`, on every page
   where the bubble should appear: the root layout or the base template. In Next.js, use `next/script` with the same
   `src` and `strategy="afterInteractive"` in the root layout. It never slows the page and never changes.

## pret: the test

Ask the user to write to the number from their phone, through the bubble or its `wa.me` link (`list_widgets`,
`waMeUrl`), and to confirm the agent answered: `list_conversations` and `get_messages` show the exchange, on every
plan. Then summarize what is in place, and what they can do next (templates, contacts, outgoing webhooks
for their app).

## When a tool refuses

- `plan_limit_reached` or `plan_feature_unavailable`: tell the user, with the upgrade link from `get_plan`. If they want
  the Pro plan, `subscribe_pro` returns its payment link. Never work around a plan limit.
- Outside the 24-hour window, only an approved template can be sent: see the `regles-whatsapp` skill.
- Any other refusal: read its message to the user, plainly, and suggest the gesture it names.

## Writing the application's code

When the user's app calls Messaging Me (sending templates, receiving webhooks), read the API documentation first:
https://console.messagingme.app/developers/api (for a language model: https://console.messagingme.app/llms.txt). The
app's API key goes in the `MESSAGINGME_API_KEY` environment variable. `create_api_key` creates it and shows it ONCE: write
it straight into the project's `.env` (a file git does not track), never repeat it in your answers or put it in code. Its scopes
are limited (no MCP, webhook or contact deletion scope: those keys are created in the console). The plan caps active
keys; revoking one in the console frees a place.

## Never

- Never put an API key in code or in a file tracked by git: the application's key goes in the `MESSAGINGME_API_KEY`
  environment variable.
- Never message a contact without their consent, and never launch a campaign without the user's explicit go.
- Never state what Meta charges beyond the `faq` skill: prices change, and the FAQ points to Meta's rate card.
- Never pay for the user: `buy_credit`, `subscribe_pro` and the number's page return a payment link; paying is their gesture.
