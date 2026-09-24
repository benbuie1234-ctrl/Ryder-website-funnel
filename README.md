# Ryder Cragun — funnel preview

Open `index.html` to view the redesigned website. All three program buttons open `checkout.html` with the corresponding offer selected.

This is a static demonstration. The checkout displays fixed sample details and simulates a purchase. It does not collect payment information, process payments, submit orders, or deliver programs. No Stripe account is connected.

## Preserved offers

| Program | One-time price | Includes |
| --- | --- | --- |
| R1 Basic | $25 | Full bench press program |
| R2 Plus | $40 | Program, wrap tutorial and form tutorial |
| R3 Apex | $100 | Plus contents, two coaching calls per week and Snapchat DM access |

R3 access duration must be confirmed before selling. Affiliate links, discount codes and social profiles come from the supplied original HTML; current merchant offers have not been independently verified.

## Before a real launch

Connect Stripe Checkout and trusted server-side price mappings; define fulfillment after verified payment; confirm coaching duration, contact details and purchase terms. The original contact email used `gmaill.com`, so the preview uses the existing Snapchat contact rather than guessing a correction.

This redesign is a conversion hypothesis, not a measured uplift. Track program selection and completed checkout, then compare against the original flow.

## Files

- `index.html`, `styles.css`, `app.js`: landing page
- `checkout.html`, `checkout.css`, `checkout.js`: demo checkout
- `assets/`: images extracted from the original site

The supplied original HTML has not been modified.
