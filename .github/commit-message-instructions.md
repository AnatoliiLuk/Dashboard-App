Generate a Git commit message that follows Conventional Commits 1.0.0 (https://www.conventionalcommits.org/en/v1.0.0/).

Output exactly one line, the subject line. No body, no footer, no file list, no bullet points.

If the diff contains several unrelated changes, do not write one line per change. Pick the most important change and write a single line for it. Never output more than one line.

Format: type(scope): description

- type is required: feat, fix, docs, style, refactor, perf, test, build, ci, or chore
- scope is optional
- description is imperative and lowercase, and says why
- the whole line is 72 characters or fewer; aim for 50, because longer lines are rejected
- keep the description to 3-7 words: no "and", no commas, no lists of files or docs
- prefer a short scope (e.g. docs, calendar, habits) over repeating it in the description
- add ! before the colon only for a breaking change

Good:
feat: show Habits+ in the browser tab
chore: stop tracking local docs
fix(calendar): keep the streak on the current day

Bad (too long, joins two changes with "and"):
chore: remove outdated quick start checklist and add plan checklist for mobile app

Better:
docs: replace quick start with plan checklist

Bad:
Update the metadata title and description in the English and Ukrainian locale files, and also change the README heading so the app is called Habits+.
