# Examples

Gold-standard reference output that calibrates Groomie's style, granularity, and tone.
When these examples conflict with the breakdown guide, **the examples win.** They are
drawn from a well-groomed backlog (the "SAP" reference project) and grow as the user
adds more. If a section below is still empty, fall back to the breakdown guide's shape
for that level.

> Note: the SAP reference project is an **animated-books Unity game**, so its client tier
> is `[Game Dev]` (Unity) rather than `[Frontend]`. Infer the disciplines from the actual
> project you are grooming — don't copy `[Game Dev]` onto a non-game feature.

## Epic

A good epic is bounded, closeable in a defined timeframe, and its scope is obvious from
the title alone — and the title **leads with a verb** in **Title Case** (imperative
preferred: `Add` / `Enable` / `Support` / `Change` / `Migrate` / `Remove`) so it reads as the
work to be done, not a label. Body is two required lines — `Description` + `Business Value` — plus an
optional `Design:` line linking the Figma / mockups when research surfaces them. No
acceptance criteria (stories carry those).

```markdown
# Epic: Enable Traditional Authentication

_groomie v<version> · full breakdown_

**Description:** Implement email/password-based authentication system.

**Business Value:** Provide secure basic authentication method for users who prefer
traditional login.
```

```markdown
# Epic: Add SSO Login

_groomie v<version> · full breakdown_

**Description:** Implement Single Sign-On functionality supporting major identity providers.

**Business Value:** Simplify the login process and increase user adoption.
```

Both titles lead with a verb *and* pass the "is it bounded?" test — you can tell what work
gets done and when it's finished just by reading them. Contrast with a bare label like
"Traditional Authentication" (bounded, but not fronted by the work) or an un-scoped umbrella
like "Authentication" (which never closes).

## User stories

The title carries the full user-story sentence (within Jira's summary length). Note this
example describes **only behavior and needs** — nothing about REST APIs, screens, or
widgets. Body: a short description, then Acceptance Criteria, then concrete Test Cases —
both required.

```markdown
### S1 — As a user, I want to create an account using email and password, so that I can have my own personal access to the platform.

Lets new users create an account with email and password, including email verification
and clear success/error feedback. (Link the PRD / business-analysis pages when they exist.)

**Acceptance Criteria**
- Valid email verification process
- Password strength requirements enforced
- Account verification flow
- Success/error notifications

**Test Cases**
- Valid email + strong password → account created, verification email sent
- Weak password → rejected with a strength hint
- Duplicate email → clear "already registered" error
- Clicking the verification link → account marked as verified

**Is blocked by:**
- T1 — Design and implement user schema and database tables
- T2 — Design registration flow UI mockups
- T3 — Implement registration UI using Unity
```

(Keyed `S1`; note the comma before *so that* and the period at the end, one responsibility
(INVEST), and blocking refs carry `<key> — <title>`. "user" here is a real product persona —
the game's player. Never write a story as the recipient of an outbound artifact.)

**Solution leaks to catch — even when the source ticket contains them.** The ticket's own AC
often carries placement, field names, or flow ordering; grooming translates those into
behavior, it never copies them into a story:

- Menu / navigation placement is design's decision — name the capability, not where it lives:
  - ❌ `As a shopper, I want to manage saved search filters under Account → Preferences → Saved Filters, so that …`
  - ✅ `As a shopper, I want to manage my saved search filters, so that I can reuse them across visits.`
- Technical field / parameter names never enter an AC — state the capability they grant:
  - ❌ "Saving a filter set requires setting `sort_key` (+ asc/desc) and `max_items`"
  - ✅ "The shopper controls the order of saved sets and caps how many are kept"
- Interaction sequence is design's call — state the outcome constraint:
  - ❌ "The shopper selects, in order: a set, a filter, a value"
  - ✅ "The set cannot be applied until a set, a filter, and a value are all chosen"
- The source ticket's internal numbering never appears — the breakdown is self-contained:
  - ❌ "Adds saved filters to the search bar (AC2)."
  - ✅ "Adds saved filters to the search bar."
- The persona stays consistent — switch roles only when the actor genuinely differs:
  - ❌ S1 "As a shopper …", S2 "As a customer …" (same person, drifting synonyms)
  - ✅ S1 "As a store admin, I want to define the filter set …" and S2 "As a shopper, I want
    to apply a filter set …" (two real, different actors: one authors, one uses)

- Existing surfaces are referenced by product concept, never by widget type — the AC must
  survive a redesign:
  - ❌ "'Price range' appears in the filter dropdown list"
  - ✅ "'Price range' is offered among the available filters"

Referencing an *existing* surface being extended ("the search filters", "the campaign settings
page") is fine — that's context. Naming its widget, or introducing / placing something new, is
the line that belongs to design.

## Technical tasks

Tasks carry the HOW. Each is keyed (`T1`, `T2`, …), the title is an **imperative** action
under a required discipline prefix (one responsibility per task), and the body is a
detailed, step-by-step `Implementation` plus `Done when`, then `Blocks:` / `Is blocked by:`
as `<key> — <title>` (Jira's link terms). A single story is usually built by several tasks
**split across disciplines / repos** (the account-creation story above is built by one
`[Backend]`, one `[Graphic Design]`, and one `[Game Dev]` task — a separate task per
discipline, not per step); conversely one foundational task underpins several stories, as the
`[Backend]` schema task below shows. Note two things about that Backend task. First, it
**consolidates** the schema, the migrations, and *its own tests* into one unit — tests appear
in `Done when`, never a separate `[QA]` task. Second, because this schema is **shared** by
S1/S2/S3, it stands alone as a **foundational task** that `Blocks:` all three (a global
blocker), rather than being duplicated per story; where a schema serves just **one** story you
would instead fold it into that story's Backend task (schema + its endpoints + tests together),
as the guide's registration example does. Either way the target is one shippable unit per
discipline — never a micro-task per endpoint or a standalone tests/docs task.

```markdown
### T1 — [Backend] Design and implement user schema and database tables

Model and create the user data structures with secure credential storage and
email-verification fields.

**Implementation**
- Create a users table: id (UUID), email (unique, case-insensitive), password_hash,
  email_verified (bool), status, created_at/updated_at.
- Store only hashed passwords (bcrypt/argon2) — never plaintext.
- Add email-verification storage: token hash, expiry, and used flag.
- Add a unique index on email and write migration scripts.

**Done when**
- Migrations create the tables and email uniqueness is enforced at the DB level.
- Repository CRUD operations are covered by tests.

**Blocks:**
- S1 — As a user, I want to create an account using email and password …
- S2 — As a user, I want to reset my password via email …
- S3 — As a logged-in user, I want to change my password …
```

This backend task is a good illustration of the model: it is **not a subtask** of any one
story — it's a foundational piece that `Blocks:` every account-related story it underpins.
It carries `Done when` (not Test Cases) because tasks are not QA-tested; the stories it
blocks are the ones QA verifies.

## Bugs

Only when the source issue reports **broken existing behavior**. A bug is a structured `### B#`
section — `**Reproduce Steps**` (numbered), `**Expected Behaviour**`, `**Actual Behaviour**`, and an
optional `**Notes**` — the QA equivalent of a story's Test Cases. It is a **standalone node under the
epic**: Groomie writes **no** story link, because whether the bug blocks a story is a QA call made
later in Jira.

```markdown
### B1 — Verification email is never delivered on signup

**Reproduce Steps**
1. Register a new account with a valid email and a strong password.
2. Wait for the verification email.

**Expected Behaviour**
A verification email arrives within a minute and its link marks the account verified.

**Actual Behaviour**
No email arrives; the account stays unverified with no way to proceed.

**Notes**
Only reproduces for addresses on custom domains; Gmail/Outlook are unaffected.
```

(No `affects:` / no story-link block, and no diagram edge — the bug is just a red node inside its
epic subgraph.)

## Anti-patterns (what a groomed doc must never do)

Calibration on a **backfill/migration** issue — one that copies existing data into a new store and
changes **no** user-facing behavior. Every item below is a real failure mode; the fix is the honest
shape. (Synthetic example — a generic "snapshot legacy records into the primary store" migration.)

- **A TL;DR / executive summary / "the work, simplified" / decisions or evidence table.** ❌ Only
  the contracted sections exist (epic → stories? → tasks → bugs? → open questions → diagram).
  Research shapes the *content*; it is never its own narrative, and the doc never critiques,
  "refutes", or re-summarizes the ticket.
- **Technical outcomes dressed as stories.** ❌ `S1 — The snapshot is queryable in the primary
  store`, `S2 — Existing records are backfilled safely in one pass`, `S3 — The backfill is verifiable and
  reversible`. None is an `As a <real user>, I want …, so that ….` behavior — so a pure migration
  has **zero stories**. ✅ Emit just the epic + `## Tasks` + `## Open questions`.
- **A coordination / sign-off / decision task.** ❌ `T0 — Decision & coordination (blocking): get
  DBA sign-off`. Tasks are implementation only and never name a person. ✅ The unresolved decisions
  (which holder table, whose approval, the schema-change process) go under `## Open questions`.
- **A standalone tests task.** ❌ `T4 — Tests`. ✅ Tests live in the producing task's `Done when`
  (e.g. the backfill task's "unit tests cover happy-path, idempotency, and count-verify").

So the bad run's `TL;DR + S1/S2/S3 + T0 + …T4(Tests) + Locked decisions` collapses to the honest
shape: **one epic, a handful of implementation tasks (schema, backfill+verify+tests), and the open
questions** — with the `_groomie v<version> · <mode> breakdown_` stamp under the epic heading.

## Revising a breakdown

When the user edits an existing breakdown (the skill's *Revise* flow), keep existing keys stable and
re-wire only what the change implies. Worked example on the auth breakdown above — the user says
**"split T3 (the Unity registration UI) into the screen build and session management."**

- `T3` **stays** the screen-build task; the new session-management work becomes **`T4`** — the next
  free key, never a renumber of the existing tasks. Both still block `S1`.
- Edges before: `T1→S1`, `T2→S1`, `T3→S1`. After: `T1→S1`, `T2→S1`, `T3→S1`, **`T4→S1`** — the split
  adds one edge; the others are untouched.
- In the MD, `S1`'s `Is blocked by:` gains `- T4 — [Game Dev] …`, and the new `### T4` task states
  `Blocks: - S1 — …`; the JSON gains the `T4` node + the `T4→S1` `blocks` edge. `T1`/`T2`'s wording is
  unchanged.

Contrast a **removal** — "drop S2": delete the `S2` node and every edge touching it (e.g. a
`T3→S2` blocks edge and any `Is blocked by: T3` line that only served `S2`), and **do not** reassign
`S2` to some other story later. A subsequent "add a story" takes `S3`, not the retired `S2`.

## Per-project config

When a `groomie.config.md` sits in the working directory, Groomie applies it (see the breakdown
guide's *Per-project config* section). Example config (all sections optional, all values synthetic):

```markdown
# Groomie config

## Repo → discipline
- api-service → Backend
- web-frontend → Frontend

## Documentation policy
- Public API changes are documented on Confluence as a separate task.
```

Grooming a "publish a new public REST endpoint" feature **with** this config vs. **without** it:

- **Without config:** the API work is one inferred `[Backend]` task; API docs fold into its
  `Done when` (in-repo docs stay in the task).
- **With config:** the same work lands in the `api-service` repo → the task is `[Backend]` **from the
  map**, and because the documentation policy names public-API docs as a separate Confluence task, a
  distinct `[Docs] Document the endpoint on Confluence` task appears alongside it. A task landing in a
  repo the map doesn't list (say `search-indexer`) still gets an inferred discipline — the missing
  mapping never blocks or invents.

The user sets all of this **by conversation**, never by hand. Running `/groomie:config outputs in
Turkish` while chatting in English makes Groomie add an `## Output language` section with a `- Turkish`
bullet (the documented schema, not an inline `Heading: value`) to the global `~/.groomie/config.md`
and reply `Set Output language = Turkish (global).` — it does **not** groom. The next `/groomie <KEY>`
then produces the breakdown **content in Turkish** (epic/story/task prose, node labels) while the
conversation stays in English and the skeleton stays fixed: the keys (`S1`/`T1`), the `[Discipline]`
prefixes, the `Blocks:` / `Is blocked by:` link markers, the `Acceptance Criteria` /
`Test Cases` / `Implementation` / `Done when` / `Reproduce Steps` / `Expected Behaviour` /
`Actual Behaviour` / `Notes` headings, and the version stamp are unchanged — so a
Turkish breakdown still passes `check-graph.mjs` and renders in the visualizer. With no
`## Output language` anywhere, output stays English.

## Pushing to Jira

`/groomie:push` writes the breakdown to Jira only after an approved preview, and stays idempotent via
the JSON `jira` ledger (see the breakdown guide's *Jira write-back* section). Worked run on a **small
slice** of the auth breakdown — epic `E1`, story `S1`, task `T1`, bug `B1` — for brevity; all keys
synthetic.

**First push** — the ledger is empty, so everything is a CREATE. Groomie asks the epic mode (say
"new epic") and prints the plan, then waits:

```
Push plan for PROJ-123 → project PROJ  (epic mode: new epic)
  CREATE    epic E1, S1 (Story), T1 (Task), B1 (Bug)
  LINKS     T1 blocks S1
Approve? (nothing is written until you confirm)
```

On approval it creates the issues in order and records each key, leaving this ledger in the `.json`:

```json
"jira": { "project": "PROJ", "epicMode": "new-epic",
          "pushed": { "E1": "PROJ-450", "S1": "PROJ-457", "T1": "PROJ-460", "B1": "PROJ-461" },
          "tombstoned": [] }
```

**Re-push after `/groomie:revise PROJ-123 remove B1`**: E1/S1/T1 are in the ledger ⇒ UPDATE; B1 is
gone from the breakdown but still in the ledger ⇒ tombstone. No duplicates are created:

```
Push plan for PROJ-123 → project PROJ  (epic mode: new epic)
  UPDATE    E1 → PROJ-450, S1 → PROJ-457, T1 → PROJ-460   (summary + description + links)
  [deleted] B1 → PROJ-461  (removed from the breakdown)   ⚠ destructive
```

After approval, `B1`'s summary becomes `[deleted] Verification email not sent`, and the ledger keeps
its entry while recording the tombstone: `"tombstoned": ["B1"]` — so a further re-push leaves `B1`
alone. `B1`'s status, assignee, and everything else stay untouched.

## Diagram

The document ends with a `## Diagram` mermaid block: one `subgraph` per epic (container),
`S#`/`T#`/`B#` nodes, solid arrows for blocking (bugs are standalone nodes — no edge), coloured by
kind. Each label carries the node's title **verbatim** — the same wording this file uses above:
S1's full `### S1` sentence, T1–T3 from S1's blocked-by refs, and S2/S3 exactly as they appear
(abbreviated with `…`) in T1's blocked-by refs — wrapped at ~34 chars with `<br/>` like the HTML
visualizer (see the breakdown guide's *Diagram (mermaid)* rule). For the account example:

```mermaid
flowchart TD
  subgraph epic1["Epic: Enable Traditional Authentication"]
    S1["S1: As a user, I want to create an<br/>account using email and password,<br/>so that I can have my own personal<br/>access to the platform."]
    S2["S2: As a user, I want to reset my<br/>password via email …"]
    S3["S3: As a logged-in user, I want to<br/>change my password …"]
    T1["T1: [Backend] Design and implement user schema<br/>and database tables"]
    T2["T2: [Graphic Design] Design registration flow UI<br/>mockups"]
    T3["T3: [Game Dev] Implement registration UI using<br/>Unity"]
  end
  T1 --> S1
  T1 --> S2
  T1 --> S3
  T2 --> S1
  T3 --> S1
  classDef story fill:#dcfce7,stroke:#22c55e,color:#14532d;
  classDef task  fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a;
  class S1,S2,S3 story;
  class T1,T2,T3 task;
  style epic1 fill:#f5f3ff,stroke:#8b5cf6,color:#6d28d9;
```
