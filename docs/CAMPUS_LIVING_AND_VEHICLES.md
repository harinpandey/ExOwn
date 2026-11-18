# Campus Living and Vehicles update

## Housing & Roommates

The global ExOwn service switcher now has one combined destination:

- `/campus-living` — shared hub
- `/housing` — PG, hostel, flat and room listings
- `/roommates` — roommate profiles and matching

The two existing data flows remain separate. The hub groups them in one place without mixing their underlying records.

## Vehicles category

The seller wizard now uses one `Vehicles` category with these subcategories:

- Cycles
- E-Bikes
- Motorcycles
- Scooters
- Cars
- Helmets
- Locks
- Tyres
- Spare Parts
- Accessories
- Other

Old search links using `bikes-transport`, `cars`, `bicycle`, `helmet` or `car-accessories` are normalized to the new category/subcategories.

## One-time existing database migration

The code and seed definitions are updated, but the live ExOwn database must also be migrated once so existing cycle and car listings are grouped under Vehicles.

After pulling the latest repository code and confirming your normal ExOwn `DATABASE_URL` is configured, run:

```bash
npm install
npm run db:migrate:vehicles
```

The migration is transactional and safe to rerun. It:

1. Reuses the existing transport category as the Vehicles category where possible.
2. Moves products that were under the old Cars category into Vehicles.
3. Reassigns existing subcategory references, merging duplicates where necessary.
4. Creates any missing Vehicles subcategories.
5. Does not delete product listings.

Do not run this against a different database or an empty production environment by mistake. It changes category and subcategory assignments only; it does not alter listing prices, descriptions, images, owners or listing status.
