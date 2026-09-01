# LePlug Autocare Website — Project Overview

This is a plain-English guide to how the website is being built. It's broken into 11 phases, built one at a time so progress is easy to check in on. Each phase has its own short document in this folder going into more detail.

No technical knowledge needed to read any of this — that's the point.

## Where things stand

| # | Phase | What it covers | Status |
|---|-------|-----------------|--------|
| 0 | Foundation | Colors, fonts, and the basic toolkit everything else is built on | ✅ Done |
| 1 | Product Catalog | Sample products, categories, and pricing logic | ✅ Done |
| 2 | Header, Footer & Navigation | The menu, search bar, cart icon, and footer that appear on every page | ✅ Done |
| 3 | Homepage | The main landing page — hero banner, categories, bestsellers | ⏳ Planned |
| 4 | Shop, Categories & Search | Browsing all products, filtering, and searching | ⏳ Planned |
| 5 | Product Pages | Individual product detail pages with photos and reviews | ⏳ Planned |
| 6 | Cart & Wishlist | The pages where customers review what they're buying | ⏳ Planned |
| 7 | Checkout | The step-by-step purchase flow | ⏳ Planned |
| 8 | Customer Accounts | Login, order history, saved addresses | ⏳ Planned |
| 9 | Info Pages & Search Visibility | About, Contact, FAQ, legal pages, and Google/WhatsApp preview setup | ⏳ Planned |
| 10 | Final Polish & Testing | Making sure everything works well on every device | ⏳ Planned |

## A few things worth knowing up front

**This is being built with sample data, not your real content yet.** The 42 products currently in the system are realistic placeholders — realistic names, prices, and descriptions — standing in for your actual catalog. Before this goes live, we'll need your real product photos, pricing, and details.

**Nothing processes real money yet.** The checkout (Phase 7) will look and feel complete — customers can select M-Pesa, card, or cash on delivery and get a confirmation — but no actual payment gets charged this phase. Hooking up real payment processing is a separate, later step.

**There's a legal question flagged for later.** The homepage is planned to show real car manufacturer logos (Toyota, Subaru, etc.) so customers can quickly find parts for their car. Since the site isn't an authorized dealer for these brands, this needs a legal sign-off before the site goes fully public. It won't block building the site — it's just a checklist item before launch.

**Some information only you can provide.** Real phone/WhatsApp numbers, business address, delivery zones and fees, and your registered business name for the legal pages — these are placeholders until you supply them.

## How to use these documents

Each phase document answers three questions in plain language:
- What did this phase actually build?
- Why does it matter to you or your customers?
- What's still missing or placeholder, if anything?

Technical implementation details (the actual code, testing, and build plans) live in a separate, more technical folder (`docs/superpowers/plans/`) — those are for the development side and aren't necessary reading for following along with progress.
