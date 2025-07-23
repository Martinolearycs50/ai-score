### AI Search Score — Updated Vision & User-Experience Doc

_(reflecting the new Pro-tier scope and smooth upgrade flow)_

---

#### 1. Why This Matters

Google SEO tells you how pages rank in web search. It says nothing about how
ChatGPT, Claude, Gemini, or Perplexity decide what to cite. AI Search Score
closes that gap and shows site owners exactly how to earn AI visibility.

---

#### 2. Product at a Glance

| Item         | Detail                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Name**     | AI Search Score                                                                                                                     |
| **Form**     | Web SaaS                                                                                                                            |
| **Free Job** | Quick Scan one or two URLs. Get a headline score and a five-pillar bar chart. Upgrade CTA teases deeper insight.                    |
| **Pro Job**  | Deep Analysis tab breaks the page apart and ranks fixes. AI Done-for-You tab rewrites the copy so it performs better in AI answers. |

---

#### 3. Business Model

| Tier     | Price | What You Get                                                                        | Role in Funnel              |
| -------- | ----- | ----------------------------------------------------------------------------------- | --------------------------- |
| **Free** | 0     | Quick Scan for single URL and Compare Scan for two URLs. High-level issues only.    | Top-of-funnel, lead capture |
| **Pro**  | TBA   | Deep Analysis, Done-for-You rewrite, exportable tech tasks, up to 30 scans a month. | Core revenue                |

_Pro is temporarily unlocked with a simple `isPro` flag; payments and auth land
later._

---

#### 4. Core User Journeys

##### 4.1 Free – Quick Scan

1. Enter URL → 30-second scan → badge score plus five-pillar bars.
2. Upgrade bar invites user to unlock full analysis.

##### 4.2 Free – Compare Scan

1. Toggle “Compare” → enter two URLs → twin badge scores, pillar winners, trophy
   icon on overall leader.
2. “How to beat them” list is blurred; upgrade CTA hovers.

##### 4.3 Smooth Upgrade Flow

• Click **Unlock full analysis** → routed to `/pro?url={encoded}`. • Pro
dashboard loads, Deep Analysis begins automatically with that URL.

##### 4.4 Pro Dashboard – Deep Analysis Tab

• Pillar scores to one decimal place, colour coded. • Fix list split into
**Technical** (copy to clipboard) and **Content** tasks, sortable by impact.

##### 4.5 Pro Dashboard – AI Done-for-You Tab

• Left panel: original copy rendered as Markdown. • Right panel: AI rewrite via
OpenAI with better headings, at least three cited data points, and current date.
• Buttons: **Copy All** and **Download .md**.

---

#### 5. Scoring Framework (100-point)

Pillars unchanged: Retrieval, Fact Density, Structure, Trust, Recency. Weights
now load from `/config/weights.json` so product owner can tweak without
redeploy.

---

#### 6. Page-Type Detection Logic

• URL pattern check → schema clues → content heuristics. • Default to Blog if
unsure. • User can override; rescore happens instantly.

---

#### 7. Technical Architecture (high level)

| Layer      | Job                              | Notes                                                |
| ---------- | -------------------------------- | ---------------------------------------------------- |
| **Client** | Quick Scan, first parse          | 70 percent accurate, instant feedback                |
| **API**    | Deep Analysis, OpenAI rewrite    | Uses `OPENAI_API_KEY` plus extra fetch checks        |
| **Config** | `weights.json`                   | Hot reload, no deploy needed                         |
| **State**  | Simple in-memory store (for now) | Counts scans and stores last results; DB lands later |
| **Gate**   | `isPro` flag                     | Toggle while payments are not live                   |

Future proof: small Postgres or Supabase once auth and billing are ready.

---

#### 8. Conversion Design

• Sticky upgrade bar on every Free result. • Blurred content cards tease locked
insight. • Free to Pro hand-off is one click, no extra form.

---

#### 9. Vision of Success

**User outcome**: frictionless path from curiosity to concrete, AI-ready copy.
Owners see what to fix and can hand dev tasks to their freelancer in seconds.
**Business outcome**: high upgrade rate driven by immediate value in Deep
Analysis and the wow factor of instant rewrites. **Next horizon**: auth,
billing, team seats, historical tracking with real database.

---

_Document updated July 23 2025 to include Quick Compare, smooth upgrade flow,
two-tab Pro dashboard, OpenAI integration, and JSON-configurable scoring._
