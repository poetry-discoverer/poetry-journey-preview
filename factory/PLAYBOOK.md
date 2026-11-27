# Site factory playbook: an Arabic-first lesson site (cards, audio, PDF, quiz)

How the "آداب الإنجليزية: قواعد وجرامر وشعر وأساطير" site is built, so another course site can be made the same way. Static site, GitHub Pages, no backend. Run every script from the site root. Templates are in `factory/templates/`.

## 1. Inputs per lesson
- Lesson text (Arabic, with English terms), already fact-checked. Plain book or author citations are fine. No site names, no URLs, no production wording (no "source", "draft", "agent", "generated").
- A voice script is optional. The audio text is the card text (see 3).
- Quiz questions: multiple choice (3 options) and true/false, each with a per-option explanation. Essay questions are used only with a model answer.
- A level tag (zero-level student: define every term in simple words, give an everyday example).

## 2. Lesson and card format
- One lesson = one HTML file in `lessons/<lesson_id>.html`, built from `templates/lesson_template.html`. `window.STEPS` holds the lesson as a list of steps. The player (`assets/player.js`) turns each step into a card.
- Step types: `section` (a title), `learn` (a text card), `mc`, `tf`, `write` (model answer required), `end` (teaser for the next lesson, optional `extra` footer).
- Learn step fields: `h` (HTML), `a` (clip id `<lesson_id>-NNN`), `x` (md5 of the audio text, first 8 chars, so a changed card is detected), `n` (number of blocks), `en` (English line for the card, shown only when the English-line feature is on).
- Card HTML blocks: `div.lead` (opening line), `div.u` (paragraph), `div.li` (bullet). English words are wrapped in `span.en` so they use the English font.
- A card is a whole paragraph group, usually 350 characters or fewer, never above 1,700 characters of audio text. One card, one audio clip.
- Question step: `{t:'mc',q,opts[3],ans,why,ex[3]}` or `{t:'tf',q,ans,why,ex[2]}`. For `tf`, `ex[0]` is shown if the student chose true, `ex[1]` if false. Questions are placed after the cards they test, one or two at a time. Mark them `nq:1` if added after the lesson went live, so counts per lesson can be reported.
- Write the lesson content as a Python file shaped like `templates/lesson_content.example.py` (`s()` section, `c(arabic, english)` card, `Q` list, `END`). Then: `python3 factory/templates/build_lesson.py <lesson_id> <module> <number> "<title>" <prev_id> <next_id|->`. It writes the HTML and a `<lesson_id>.csv` (id,tts_text).

## 3. Audio (steps csv)
- The csv has two columns: `id,tts_text`. One row per learn card. `id` = `<lesson_id>-NNN`.
- `tts_text` is the card text without bullets, emoji or markup, under 1,700 characters. Keep the card text and the audio text identical, or the student hears something different from what they read.
- Voice: Achird. Output wav, then mp3 mono 24 kHz 48 kbps. File name `<id>.mp3`. One zip per lesson, under 16.5 MB.
- Publish: unzip, then `python3 factory/templates/publish_audio.py <folder>`. It copies the clips, updates `audio/manifest.js` (audio and pdf maps) and sets a new service-worker version.
- A lesson with missing clips stays out of the repo until its audio exists.

## 4. Scoring rules (approved)
- Reading a card: 0 XP. MC / TF: +10 right, +4 wrong. Essay: +10 for 15 words or more, else +3. Review answer: +3. Finish lesson: +20. Exam: +2 per right answer. Spaced review: +5 per right answer.
- A wrong answer shows the per-option explanation, then "got it, continue".
- XP, streak and progress are stored on the device (localStorage). Nothing leaves the device.

## 5. Modules
- **Glossary**: `assets/glossary.js` (and `grammar-glossary.js` for a grammar track). Each term: `t` (English), `a` (Arabic), `c` (category), `d` (simple Arabic definition), `l` (lesson id), `k` (card index), `e` (English definition, A1-B1). `templates/add_glossary.py` shows how to add entries. If steps are inserted into a lesson, the `k` values of its terms must be remapped.
- **Exam bank**: `python3 factory/templates/build_bank.py .` collects every MC/TF question into `assets/bank.js`. `exam.html` and `review.html` use it.
- **Spaced review**: wrong answers return in `review.html` with +5 per right answer.
- **Offline**: `sw.js` precaches the pages and a "downloaded lessons" tab lets the student keep a lesson offline. The precache list must never name a file that does not exist (it breaks the whole offline cache). Change `const V="..."` in `sw.js` on every deploy.
- **PDFs**: `python3 factory/templates/make_pdf.py . pdf <lesson_id>` renders `pdf/<lesson_id>.pdf` from the lesson steps (Thmanyah for Arabic, Nunito for English). Set `manifest.pdf[<lesson_id>]`.
- **Books**: one long PDF per course (for example `pdf/history-book.pdf`), built from the cleaned lesson text. Remove source and production wording before export.
- **SEO**: `python3 factory/templates/seo.py <root> <base_url> [noindex]` writes titles, descriptions, canonical, Open Graph, JSON-LD, `sitemap.xml` and `robots.txt`. Idempotent. Use `noindex` on previews.

## 6. Build and verify checklist (per lesson)
1. Fact-check names, dates and numbers. Hedge interpretations ("many readers say", "one reading is").
2. Scan the steps for site names or URLs.
3. Build the HTML and csv. Count cards and questions.
4. Add the glossary terms, the track-page node, the `titles.js` entry, previous and next links, and add the id to every `ALL_IDS` and `data-overall` list.
5. Publish the audio, add the PDF, run `build_bank.py`.
6. Bump the service-worker version.
7. Commit and push, wait about 50 seconds, then check with curl: lesson page, PDF, last clip, manifest, track page (all 200) and the new id appears in the manifest.
8. Open it in a browser once (headless Chrome is enough) and check the first card, a quiz and the finish screen.

## 7. Deploy: preview first, then live
- Anything the owner has not approved (new look, new sounds, new features) goes to the preview site first, with `noindex`.
- Only an approved feature is ported into the live repo. New lessons that follow the approved format go live after the fact-check, with a short report: card count, question counts, glossary terms.
- Never rename the repository or change the URL or domain without the owner. Never submit the site to Search Console or any third party without the owner.
- Edits to the text of a lesson that is already live, and any essay question in an old lesson, need the owner's approval first.

## 8. Content rules
- The student may start at zero: simple words, one idea per card, an everyday example, English terms in brackets with a simple English line.
- Narration for the existing courses is Egyptian colloquial.
- No internal production wording, no source URLs, no source-site names on any page, PDF or audio.
- Plain book or author citations are allowed.
- No tutor or "ask the teacher" section.
- Big fonts, large touch targets, Duolingo-style cards, installable PWA.

## 9. The owner's standing requests (keep this list current; add every new request here)
1. **English line under the Arabic**: every learn card carries an English version in the `en` field. It stays hidden on the live player until the owner approves it.
2. **No source links, no site names, no image phrases**: lessons never show URLs, source-site names, "image suggestions" or production notes. Plain author and work citations are fine.
3. **Essays are comparison essays only** (two eras, schools, styles, poets or works), in every track: poetry, history, myth, grammar, critical approaches. Each one has a model answer. The model answer appears right under the question only AFTER the student submits their own answer. A write card without a model answer is never published.
4. **Microphone on the answer box**: one button dictates into the box (Arabic or English, browser speech recognition; needs internet on Android Chrome), one button records the voice and keeps it on the device with replay. Nothing is sent to the site's own servers.
5. **Wrong answers are reviewable at once**: a wrong answer goes into the review pool immediately, repeats until answered right, and only then follows the spaced intervals (7 days, then done). The "train on questions" button includes the due-now ones first.
6. **Separate reference tabs**: glossary, grammar glossary and abbreviations are separate pages, gated until the owner approves.
7. **Offline card**: the "downloaded lessons" section lets the student keep a lesson offline.
8. **Sounds toggle**: global sound switch for taps, right, wrong and done. Gated until approved.
9. Every change the owner asks for is also written here and in the hosted playbook File.
10. **No lesson publishes without its standard question set**: at least 4 multiple-choice or true/false questions placed INSIDE the lesson body, right after the card they test (not only in a closing exam block), plus recall and write cards at the end. Analysis, grammar, history, myth, poetry and intensive lessons are all checked with a per-lesson count (MC, TF, recall, write, and how many sit before the last learn card) before the push. A lesson with zero in-body questions is not published.
11. **Two separate glossary tabs**: poetry terms (glossary.html) and grammar terms (grammar-glossary.html) are two separate entries on the home page, each opening only its own page. No terms from one appear on the other and the pages do not link to each other.
12. **App name**: the in-app display name and the PWA manifest name are "آداب الإنجليزية: قواعد وجرامر وشعر وأساطير" (short name "آداب الإنجليزية"), the owner's final choice (voice, 10:58). It replaced the earlier option. Indexing and SEO tags stay off on the live site until the owner approves them.
