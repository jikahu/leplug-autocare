# Phase 7: Checkout

**Status: ⏳ Planned**

## What this phase will build

The step-by-step purchase flow, from cart to confirmation:

1. **Delivery details** — name, phone, address.
2. **Delivery zone and fee** — Nairobi Metro or Outside Nairobi, with the fee calculated automatically.
3. **Payment method** — M-Pesa, card, or cash on delivery.
4. **Order review** — a final summary before confirming.
5. **Confirmation screen** — confirming the order was placed.

## Why it matters

This is the moment a browser becomes a paying customer. It needs to feel simple, trustworthy, and quick — no confusing steps, no surprise fees appearing at the last second.

## Important: no real payments happen yet

This phase builds the complete *experience* of checking out — customers can select M-Pesa, card, or cash on delivery, and the order goes through to a confirmation page. **But no money actually moves.** Connecting to a real payment processor (for M-Pesa, that's Safaricom's Daraja API; for cards, a processor like Pesapal or Stripe) is separate, real-world infrastructure work that comes after this phase, not part of it. This is being called out clearly so it's never mistaken for "ready to take real orders."
