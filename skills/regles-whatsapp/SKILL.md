---
name: regles-whatsapp
description: WhatsApp rules that decide whether a message can be sent through Messaging Me - the 24-hour window, approved templates and their categories, consent and STOP, number quality and sending limits, received media. Use before sending a template or a message to a contact, when a send is refused, or when writing app code that sends WhatsApp messages.
---

# WhatsApp rules

Speak the user's language. These rules come from Meta; Messaging Me applies them and says so in its refusals.

## The 24-hour window

- Within 24 hours of the person's last message, any reply can be sent: free text, media, buttons
  (`reply_in_open_window`, `send_message`). `get_conversation` tells whether the window is open.
- After that, only a template approved by Meta can start the conversation again (`send_template_to_contact`).
- The window is the person's, not yours: writing to them does not reopen it.

## Templates

- Meta reviews every template, in minutes or up to 24 hours; only an approved template is sent
  (`create_template`, then `get_template_status`).
- Three categories: marketing, utility (transactional) and authentication. Meta may change the category you chose, and
  the price changes with it: `list_templates` shows the category that applies.
- A template can be paused for poor quality, then disabled for good if it happens again. Its parameters must match it,
  in number and in kind.

## Consent and STOP

- Send a template only to people who agreed to receive messages from the business. Through Claude, that agreement is
  the user's responsibility, and three tools record it on their behalf: sending a template to one number
  (`send_template_to_contact`) and importing the Shopify customers (`import_shopify_customers`), whose records say who
  declared it, and the Shopify store's messages (`set_shopify_message`), whose records name the store. For these three
  there is no consent question to ask. Campaigns still only reach contacts who agreed.
- A person who answers STOP is unsubscribed, and Messaging Me refuses to send to them. The person can also refuse
  marketing from the business inside WhatsApp itself.

## Number quality and limits

- A new number can only start a limited number of conversations a day; Meta raises that limit as the number sends
  well and its quality stays good. Many blocks or reports lower its quality, then its limit.
- Too many messages to the same person in a short time are refused for that person only.
- Meta limits how many marketing templates one person receives, across all businesses.
- The Messaging Me plan limits templates (`get_plan`); replies within the 24-hour window are never limited by the plan.
- The API has daily quotas per workspace, set by the plan and raised on request. Templates and free-form
  replies are counted separately, so sending templates never takes the room of replies to customers. Beyond a quota,
  calls are refused with `quota_exceeded` (HTTP 429) until midnight, Paris time: an app that sends notifications must
  spread them or ask for more.

## Received media

Meta keeps a received file only 7 days: download it as soon as it arrives if the app needs it.

## Money

What Meta charges, and when, is in the `faq` skill, with Meta's rate card. Never quote a price from memory.
