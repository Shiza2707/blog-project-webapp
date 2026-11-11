INSERT INTO public.categories (name, slug, description) VALUES
  ('Engineering', 'engineering', 'Practical notes on building reliable software.'),
  ('Design', 'design', 'Interfaces, typography and the craft of making things clear.'),
  ('Product', 'product', 'How great products get planned, shipped and improved.'),
  ('Writing', 'writing', 'Clear communication for people who build things.'),
  ('Culture', 'culture', 'Teams, habits and the way we work together.');

INSERT INTO public.posts (title, slug, excerpt, content, featured_image, category_id, tags, status, is_featured, meta_title, meta_description, published_at) VALUES
(
  'The Quiet Craft of Writing Clear Technical Docs',
  'clear-technical-docs',
  'Good documentation is invisible. Readers find what they need, do the thing, and move on. Here is how to write docs that disappear in the best way.',
  $md$Most documentation fails for one simple reason: it is written for the author, not the reader.

## Start with the reader's question

Before writing a single line, write down the question your reader arrives with. "How do I install this?" is a different document from "Why does this exist?" Mixing them produces a page that answers neither.

## Put the answer first

Readers scan. Lead with the command, the setting, or the conclusion. Context can follow for those who want it.

> If a reader has to scroll to find the answer, the document is not finished.

## Prefer examples over descriptions

A single working example teaches more than three paragraphs of explanation:

```bash
npm install @acme/widgets
```

Then show the smallest useful usage, and stop.

## Edit ruthlessly

- Cut every sentence that starts with "It is important to note".
- Replace vague words like *simply* and *just* — nothing is simple to someone who is stuck.
- Read the page out loud. If you stumble, your reader will too.

## Keep it alive

Docs rot when no one owns them. Put a name and a review date at the bottom of every page, and treat outdated docs as bugs.

Clear writing is not a talent. It is a habit of caring about the person on the other side of the page.$md$,
  '/images/posts/clear-technical-docs.jpg',
  (SELECT id FROM public.categories WHERE slug = 'writing'),
  ARRAY['documentation', 'writing', 'developer experience'],
  'published', true,
  'Writing Clear Technical Docs',
  'Practical habits for writing technical documentation that readers can scan, trust and act on.',
  now() - interval '2 days'
),
(
  'Designing Interfaces That Respect Attention',
  'interfaces-that-respect-attention',
  'Attention is the scarcest resource your users have. Calm interfaces earn trust by asking for less of it.',
  $md$Every notification, badge and modal is a small withdrawal from your user's attention. Spend wisely.

## Default to quiet

The best interfaces are calm by default and loud only when it matters. Ask of every element: *what happens if we remove this?* Often the answer is "nothing".

## Hierarchy is a promise

When something looks important, users expect it to be important. Use size, weight and color sparingly so that emphasis keeps its meaning.

## Interruptions need a reason

A modal should only appear when the user cannot continue without making a decision. Everything else belongs inline.

- Inline validation beats error pop-ups.
- Toasts should confirm, not instruct.
- Badges should count things a person actually needs to act on.

## Measure the right thing

Time-on-page is not always good. Sometimes the best outcome is a user who finished their task in ten seconds and left happy.

Respecting attention is not minimalism for its own sake. It is designing for the human who has a life outside your product.$md$,
  '/images/posts/interfaces-that-respect-attention.jpg',
  (SELECT id FROM public.categories WHERE slug = 'design'),
  ARRAY['ux', 'interface design', 'focus'],
  'published', true,
  'Designing Interfaces That Respect Attention',
  'Why calm, quiet interfaces earn more trust — and practical rules for designing them.',
  now() - interval '5 days'
),
(
  'Shipping Small: Why Tiny Releases Beat Big Launches',
  'shipping-small',
  'Big launches feel exciting, but small, frequent releases are how great products actually get built.',
  $md$The big-bang launch is a seductive idea: months of work revealed in one glorious moment. In practice, it is where risk goes to hide.

## Small releases are cheaper to be wrong about

When a release contains one change, a problem has one cause. When it contains fifty, you are debugging a haystack.

## Feedback beats prediction

No roadmap survives contact with real users. Shipping a thin slice early tells you more than another week of planning.

## How to slice work thinner

1. Ship the read-only version before the editable one.
2. Ship to internal users before everyone.
3. Hide unfinished work behind a flag instead of a long-lived branch.

## Momentum is a feature

Teams that ship weekly build confidence. Each release is proof that the system works, and that confidence compounds.

Start small. Ship often. Let the product tell you where to go next.$md$,
  '/images/posts/shipping-small.jpg',
  (SELECT id FROM public.categories WHERE slug = 'product'),
  ARRAY['shipping', 'product management', 'iteration'],
  'published', true,
  'Shipping Small: Tiny Releases Beat Big Launches',
  'Why frequent, small releases reduce risk and speed up learning — and how to slice work thinner.',
  now() - interval '8 days'
),
(
  'A Practical Guide to Database Indexes',
  'database-indexes-guide',
  'Indexes are the single biggest lever for database performance. Here is how they work and when to reach for one.',
  $md$An index is a sorted copy of some of your data that lets the database find rows without reading the whole table — much like a library card catalog.

## When you need one

If a query filters, joins or sorts on a column and the table is large, that column is a candidate:

```sql
CREATE INDEX posts_published_idx ON posts (status, published_at DESC);
```

## Column order matters

A composite index on `(status, published_at)` helps queries that filter on `status`, or on `status` and `published_at`. It does little for a query that filters only on `published_at`.

## Indexes are not free

- Every insert and update must also update each index.
- Indexes use disk and memory.
- Unused indexes are pure cost — review them regularly.

## Trust the query plan

Run `EXPLAIN ANALYZE` before and after adding an index. If the plan does not change, the index is not helping.

Index for the queries you actually run, measure the result, and remove what you do not use.$md$,
  '/images/posts/database-indexes-guide.jpg',
  (SELECT id FROM public.categories WHERE slug = 'engineering'),
  ARRAY['databases', 'performance', 'sql'],
  'published', false,
  'A Practical Guide to Database Indexes',
  'How database indexes work, when to add one, and how to confirm it actually helps.',
  now() - interval '12 days'
),
(
  'Building a Remote Team Culture That Lasts',
  'remote-team-culture',
  'Culture does not live in an office. It lives in the small, repeated habits a team chooses every day.',
  $md$Remote teams do not lack culture. They simply cannot rely on proximity to create it by accident.

## Write things down

In a distributed team, the written word is the hallway. Decisions, context and debates should live somewhere anyone can find them later.

## Default to asynchronous

Meetings are expensive across time zones. Use them for things that genuinely need real-time conversation: conflict, brainstorming, celebration.

## Make the invisible visible

- Share weekly notes on what you shipped and what you learned.
- Thank people publicly and specifically.
- Celebrate small wins, not just launches.

## Protect focus

Agree on quiet hours. Normalize slow replies. A team that is always online is a team that never gets deep work done.

Culture is what people do when no one is watching. On a remote team, that is most of the time — so design for it.$md$,
  '/images/posts/remote-team-culture.jpg',
  (SELECT id FROM public.categories WHERE slug = 'culture'),
  ARRAY['remote work', 'teams', 'culture'],
  'published', false,
  'Building a Remote Team Culture That Lasts',
  'Practical habits that help distributed teams build a strong, lasting culture.',
  now() - interval '15 days'
),
(
  'Typography Rules Every Developer Should Know',
  'typography-rules-for-developers',
  'You do not need to be a designer to set text well. A handful of rules will make every interface you build easier to read.',
  $md$Most of what users do in your product is read. Good typography makes that effortless.

## Limit line length

Aim for 60 to 75 characters per line for body text. Longer lines tire the eye; shorter ones break reading rhythm.

## Give text room to breathe

A line height of around 1.5 for body copy and 1.1 to 1.25 for headings is a reliable starting point.

## Build a scale

Pick a ratio and stick to it. A consistent type scale creates hierarchy without guesswork.

## Two typefaces are plenty

- One for headings, one for body — or one family for both.
- Use weight and size for emphasis before reaching for a new font.

## Contrast is not optional

Light grey text on white looks elegant in a mockup and fails real people in real sunlight. Check contrast ratios.

Good typography is quiet. When it is done well, nobody notices — they just keep reading.$md$,
  '/images/posts/typography-rules-for-developers.jpg',
  (SELECT id FROM public.categories WHERE slug = 'design'),
  ARRAY['typography', 'design', 'frontend'],
  'published', false,
  'Typography Rules Every Developer Should Know',
  'A short list of typography rules that make any interface easier to read.',
  now() - interval '20 days'
);
