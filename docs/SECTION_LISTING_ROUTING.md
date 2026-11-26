# ExOwn hero section listing boundaries

Each top-level hero destination opens its own listing/discovery experience. Inner filters and categories stay within that section and never expose unrelated Marketplace filters.

| Hero destination | Dedicated page | Scope-specific categories |
| --- | --- | --- |
| LPU News | `/lpu-news` | Campus, academics, examinations, placements, events, sports, notices |
| PG / Housing | `/housing` | PG, hostel, flat/shared housing, housing-only rent and amenity filters |
| Roommate | `/roommates` | Room type, budget, roommate preferences and campus visibility |
| Rent | `/rent` | Rentable items: vehicles, furniture/hostel, electronics, computers, books/sports, gaming and mobiles |
| Tickets / Travel | `/travel` | Train, taxi, movie, sports, concert, campus-event and other ticket categories |

## Data separation

- LPU News has its own Prisma schema and database URL.
- Tickets has its own Prisma schema and database URL. Ticket submissions must never create records in the general `Product` table.
- Rent uses the main marketplace database but always filters by `listingType = RENT` and a rent-specific category allowlist.
- Housing and Roommate remain separate experiences backed by the existing housing and roommate models.

New hero sections should add a route and category allowlist here, with search, filters and cards scoped to that domain.
