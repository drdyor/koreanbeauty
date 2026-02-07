## Status

* Audited both codebases and confirmed pet components exist but are UI-only; ecommerce platform has robust catalog, quiz and chatbot. Ready to integrate the pet into the main client and add local-first logging + minimal cycle UX.

## Fast Path (refined to your feedback)

* Ambient, always-visible cat on mobile; lightweight, non-intrusive.

* Start with Xiaomi-style minimal interaction: single-tap mood cycle and lock-in.

* Progressive disclosure: after 3 consecutive mood logs, show small food/stress options; biology (period) flows appear only when relevant.

## Data Layer (aligning with your schema)

* `daily_checkins(id, user_id?, date, cycle_day, mood, energy, skin_condition)`

* `food_logs(id, user_id?, date, food_item, trigger_level)`

* `skin_logs(id, user_id?, date, breakouts, sensitivity, notes)`

* Local-first in IndexedDB with background sync to tRPC; anonymous until login.

## Interaction Logic

* Tap cat → cycles through moods (happy, moody, tired, cramping, energetic) and locks.

* After lock: tiny contextual follow-up when needed (stress intensity, quick food tap, sleep quality).

* Cloud UX: 28-day default cycle; show cloud 1–3 days pre-period with confidence shading; user pops cloud on start to confirm → length auto-adjust.

* Ovulation UX: cat knits during fertile window (length-adjusted); optional confirmation tap.

* Immediate value: after log, show micro skincare tip or 1–2 product suggestions.

## Rules Engine (Month 2–3)

* Inputs: mood, food triggers, cycle phase.

* Outputs: recommend/avoid ingredient tags; map to catalog products.

* Examples: pre-menstrual + breakouts → centella/tea tree; ovulation + dryness → hyaluronic acid/snail.

## Implementation Order (Agent Mode)

1. Port pet components into ecommerce client and mount as floating widget on mobile.
2. Add `CheckInsStore` with IndexedDB; wire PetMood and TriggerFood to persist mood/food.
3. Create Drizzle migrations for the three tables; add tRPC routers for create/list/summary.
4. Implement cloud/knitting UI states with naive cycle prediction; hook up pop/confirm.
5. Add micro tips and basic ingredient mapping to show value instantly.
6. Surface personalization on ProductDetail/Shop filters using summaries.
7. Add consent + clear-data UI; polish animations and guard against layout overlap.
8. Tests: rules engine unit tests; router tests with fixtures; mobile interaction sanity checks.

## Integration Details

* Mount cat in `client/src/App.tsx` and render only on small viewports.

* Use existing UI primitives and framer-motion for continuity.

* Keep pet core lean; lazy-load interaction modules (mood, food, cycle).

* Summaries feed optional chatbot context for richer conversations.

## Verification

* Unit tests for rules and migrations; router tests.

* Manual mobile QA across Home/Shop/Product pages; ensure no obstruction.

* Privacy verification: opt-in required; clear-data removes local + remote.

## Deliverables

* Ambient cat widget with mood lock-in, progressive food/stress logging.

* Cloud popping period prediction and ovulation knitting visuals.

* Local-first persistence + server sync and basic recommendations.

* Tests and lightweight docs.

## Assumptions

* React + Vite + tRPC + Drizzle; anonymous logs allowed; medical disclaimers present.

## Next Step

* With your go-ahead, I’ll implement tasks 1–3 immediately, ship a working integrated widget with persistence and server endpoints, then add cloud/knitting UX and rules.

