# HYPNEXIS '26 — Website

A static, no-build-step website (`hypnexis-main.html`, `hypnexis-team.html`).
`index.html` just redirects to `hypnexis-main.html` so the site works at the
clean root URL.

Live site: `https://<your-github-username>.github.io/<repo-name>/`
(the exact URL is shown in the Actions tab after the first successful deploy,
and under Settings → Pages)

---

## How this is set up

- **Version control:** Git + GitHub.
- **Branching:** `main` is production — it is always what's live. All work
  happens on a separate branch and merges into `main` via a Pull Request.
- **CI (`.github/workflows/ci.yml`):** runs automatically on every Pull
  Request. Checks:
  1. Required files exist
  2. HTML is valid (`html-validate`)
  3. Every internal link (`href="*.html"`) points to a file that actually
     exists in the repo
  4. Every inline `<script>` block is syntactically valid JavaScript

  A PR **cannot be merged** until all of these pass (once branch protection
  is turned on — see setup step 4 below).
- **CD (`.github/workflows/deploy.yml`):** runs automatically after a merge
  to `main`. It re-runs the same verification suite as a final safety gate,
  then publishes the site to GitHub Pages. Nothing is ever deployed without
  passing verification first — a bad merge cannot reach production even by
  accident.

There is no separate "build" step because this is plain HTML/CSS/JS with no
framework or bundler — the verify-then-publish pipeline above is the
entire pipeline this project needs. If you later introduce a build tool
(React, Vite, a bundler, etc.), a build step would be added to both
workflows at that point — but don't add one before you actually need it.

---

## One-time setup (do this once, right now)

1. **Create the GitHub repo** (if you haven't already) and push this
   folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: HYPNEXIS '26 website with CI/CD"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages via Actions:**
   - Go to your repo on GitHub → **Settings → Pages**
   - Under "Build and deployment" → **Source**, select **GitHub Actions**
     (not "Deploy from a branch")

3. **Watch the first deploy run:**
   - Go to the **Actions** tab — pushing to `main` should have already
     triggered `Deploy to GitHub Pages`
   - Once it's green, your site URL appears in that workflow run's summary
     and under Settings → Pages

4. **Turn on branch protection for `main`** (this is what actually makes
   future updates "safe" — without this, someone could still push straight
   to `main` and skip CI):
   - Settings → Branches → **Add branch ruleset** (or "Add rule" on older
     GitHub UIs)
   - Branch name pattern: `main`
   - Enable: **Require a pull request before merging**
   - Enable: **Require status checks to pass before merging**
     → search for and select the `verify` check (from `ci.yml`)
   - Enable: **Do not allow bypassing the above settings** (applies the
     rule to admins too, including you — recommended even for a solo
     maintainer, since it's the only thing that actually prevents an
     accidental direct push to `main`)
   - Save

That's it — the pipeline is live.

---

## How to update the website in the future

**Never edit files directly on `main`, and never use the GitHub web editor
on `main`.** Always go through a branch + Pull Request, even for a one-line
change. This is what makes changes "safe" — CI checks the change before it
can ever reach the live site.

1. **Get the latest `main` and create a branch for your change:**
   ```bash
   git checkout main
   git pull
   git checkout -b update-prize-pool
   ```
   (name the branch after what you're changing — `fix-nav-link`,
   `add-faculty-photos`, `update-timeline`, etc.)

2. **Make your edits** to `hypnexis-main.html` / `hypnexis-team.html` (or
   add new files/images) as normal, in your editor of choice.

3. **Check your work locally before pushing** (optional but recommended —
   catches problems in seconds instead of waiting for CI):
   ```bash
   npm install     # only needed the first time, or after a dependency update
   npm run verify
   ```
   If this passes locally, CI will pass too.

4. **Commit and push your branch:**
   ```bash
   git add .
   git commit -m "Update prize pool to ₹10 Lakh+"
   git push -u origin update-prize-pool
   ```

5. **Open a Pull Request** on GitHub (`main` ← `update-prize-pool`). GitHub
   will automatically run the CI checks on it — wait for the green check.
   - If CI fails, click into the failed check to see exactly which of the
     4 checks failed and why, fix it on the same branch, and push again —
     the PR updates and re-runs automatically.

6. **Merge the Pull Request** once CI is green (the "Merge" button will be
   disabled/blocked until it is, once branch protection is on).

7. **That's it.** Merging to `main` automatically triggers `deploy.yml`,
   which re-verifies and publishes. Check the **Actions** tab to watch it
   deploy — typically well under a minute for a site this size. No manual
   rebuild, no manual upload, no FTP, nothing to remember.

8. **Delete the branch** after merging (GitHub offers a button to do this
   right on the merged PR) to keep the branch list tidy.

### If something ever needs to go live *immediately* and CI is blocking it
Don't bypass branch protection. Fix whatever CI is flagging — it exists
specifically because it already caught a real broken-link bug in this
project once. If CI itself seems wrong (a false positive), that's a good
reason to loosen a specific rule in `.htmlvalidate.json`, in its own PR,
not to skip the check.

---

## Local development

No build step, no server required for basic editing — just open
`hypnexis-main.html` directly in a browser. If you want to test the site
the way GitHub Pages will actually serve it (relative links, `index.html`
redirect, etc.), run a simple local server from the project root instead:
```bash
npx serve .
```

## Project structure
```
.
├── index.html              → redirects to hypnexis-main.html
├── hypnexis-main.html       → homepage
├── hypnexis-team.html       → team page
├── package.json             → dev dependency (html-validate) + `npm run verify`
├── scripts/
│   ├── verify.sh             → runs all 4 checks, used by both CI and deploy
│   ├── check-internal-links.js
│   └── check-inline-js.js
└── .github/workflows/
    ├── ci.yml                → runs on every PR
    └── deploy.yml            → runs on every merge to main, then deploys
```
