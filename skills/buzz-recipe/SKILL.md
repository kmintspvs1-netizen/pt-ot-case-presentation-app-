---
name: buzz-recipe
description: Search and organize recipe ideas in the style of Ryuji's "Buzz Recipes" from a provided ingredient list. Use when Codex receives ingredients, pantry items, or "what can I cook?" requests and needs to (1) search the Ryuji YouTube channel and closely related recipe pages, (2) list candidate dishes, (3) extract likely ingredients and seasonings, and (4) suggest practical adjustments for missing, extra, or substitute ingredients.
---

# Buzz Recipe

## Overview

Turn a rough ingredient list into a practical "バズレシピっぽい候補整理" workflow.
Prioritize concrete dish candidates, likely seasonings, and adjustment advice over perfect reconstruction.

## Workflow

### 1. Understand the cooking constraints

- Identify:
  - main ingredients the user already has
  - ingredients they are missing but might buy
  - ingredients they want to add or use up
  - diet, spice, budget, time, or equipment constraints
- If the user gives only ingredients, infer a normal home-cooking context first.
- Treat pantry staples such as salt, pepper, oil, soy sauce, sake, mirin, sugar, garlic, and MSG-style umami seasonings as uncertain unless the user confirms them.

### 2. Search in the right order

- Search the Ryuji YouTube channel first:
  - channel: `https://www.youtube.com/@ryuji825`
  - combine the ingredient name with `リュウジ`, `バズレシピ`, and likely dish names
- If needed, search closely related pages that summarize the same recipe, but clearly label them as secondary sources.
- Prefer sources that include:
  - video title
  - recipe page title
  - ingredient list
  - seasoning quantities or obvious flavor direction
- If browsing is available and the user asked for current or exact information, verify it from live sources.
- If exact quantities are unavailable, say that the ingredient set is inferred from the source title, summary, or typical version of the dish.

### 3. Build candidate dishes

- Produce 3-7 plausible dishes unless the user asks for fewer.
- Rank higher when the candidate:
  - uses the user's main ingredients efficiently
  - appears directly on the target channel or an official/closely tied page
  - needs minimal extra shopping
  - matches the user's likely effort level
- Exclude weak matches that only share one minor ingredient.

### 4. Extract ingredients and seasonings

- For each candidate, list:
  - dish name
  - why it matches the user's ingredients
  - main ingredients
  - likely seasonings
  - optional add-ins
- Separate clearly:
  - confirmed from source
  - inferred from common recipe structure
- If amounts are visible, include them.
- If amounts are not visible, give only cautious qualitative notes such as `しょうゆ主体`, `にんにく強め`, or `砂糖は少なめ寄り`.

### 5. Suggest adjustments for missing or extra ingredients

- When ingredients are missing, explain the smallest workable change first.
- Focus on preserving the recipe's core balance:
  - saltiness
  - sweetness
  - acidity
  - fat or richness
  - aroma
  - texture
- Good adjustment patterns:
  - remove one aromatic and slightly reduce total seasoning
  - replace sweetness with mirin or sugar in a smaller amount
  - replace richness with butter, mayo, cheese, egg, or sesame depending on style
  - add vegetables with high water content only if seasoning is increased or moisture is cooked off
  - add protein only if salt and heat are rebalanced
- When suggesting substitutions, explain the tradeoff in plain Japanese:
  - flavor becomes lighter or heavier
  - sweetness stands out more
  - garlic impact drops
  - sauce gets thinner
  - browning becomes harder

### 6. Make the answer easy to use

- Write in Japanese unless the user asks otherwise.
- Keep the tone practical and kitchen-oriented.
- Do not pretend you have confirmed an exact recipe when you only inferred it.
- If you cannot verify a source directly, say that it is a candidate inspired by the channel rather than a confirmed identical recipe.

## Default Output Structure

- `1. 使えそうな料理候補`
- `2. 各候補の具材・調味料`
- `3. 今ある材料で寄せるなら`
- `4. 足りない材料を買うなら優先度`
- `5. 味の微調整メモ`

For each candidate, prefer a compact format like:

`料理名`
- `出典`: source title or `推定`
- `合う理由`
- `主な具材`
- `主な調味料`
- `不足時の代替`
- `足したいときの微調整`

## Output Rules

- State concrete uncertainties instead of vague hedging.
- Distinguish `確認できた情報` and `推定`.
- If several dishes are similar, group them and explain the difference briefly.
- When the user wants only quick ideas, shorten the answer to top 3 candidates.
- When the user wants shopping advice, end with:
  - `これを買えばまとまりやすい`
  - `なくても成立しやすい`

## Expected User Requests

- "鶏もも、長ねぎ、卵がある。バズレシピで何作れそう？"
- "豚こまとキャベツでリュウジっぽい料理を探して、調味料も出して。"
- "この具材で作れそうなバズレシピ候補を3つ。足りないものも教えて。"
- "にんにくがないけど、似た方向に寄せる微調整も考えて。"
- "もやしを足したい。味が薄まらないようにどう調整する？"

## Safety

- Do not present medical, allergy, or food safety claims beyond basic common-sense cautions.
- Warn briefly when substitutions may affect undercooking risk, salt concentration, or excessive moisture.
- If the user has severe dietary restrictions or allergies, prioritize safety over recipe similarity.
