# Problem statements

All problem statements live in **one file in this folder**:
`problem-statements.json`. It is not here yet on purpose — the repo is
public, so anything in it can be read by anyone.

Once the file is on the site **and** the release time has passed:

- the countdown card on the home page switches to **Now Live**, and
- each card in the **Tracks** section opens a panel with that track's
  problem statements.

Visitors don't need to refresh; the page checks for the file by itself.

## Release day steps

**11:30 AM (main release)**

1. On GitHub, open this folder and click **Add file → Create new file**.
2. Name it exactly `problem-statements.json`.
3. Paste in your filled-in statements (format below).
4. Commit to a new branch, open the pull request, and merge it once the
   checks pass. The checks catch typos in the file before it goes live.
5. The site updates in about 2–3 minutes. Until then the card shows
   "Publishing".

Do this **at** 11:30, not earlier: a branch in a public repo is visible
the moment it's created.

**6:15 PM (additional statements)**

Edit the same file, add the new statements with `"additional": true`, and
merge the same way. They appear with a **NEW** badge in their track, and the
"Additional Problem Statements" slot under the countdown goes live. Visitors
already on the page see them within about 2 minutes.

## Format

```json
{
  "statements": [
    {
      "track": "ai-ml",
      "code": "AI-01",
      "title": "Short title of the problem",
      "problem": "The problem statement.",
      "explanation": "More detail.\n\nA blank line like this starts a new paragraph.",
      "challenges": ["First key challenge", "Second key challenge"]
    },
    {
      "track": "web3",
      "code": "W3-03",
      "title": "An additional statement released at 6:15 PM",
      "description": "Full text.",
      "additional": true
    }
  ]
}
```

| Field | Needed? | What it is |
|---|---|---|
| `track` | yes | One of: `ai-ml`, `web3`, `climate`, `health`, `smart-cities`, `hardware` |
| `title` | yes | The problem statement's title |
| `problem` | no | The problem statement (shown under "Problem statement") |
| `explanation` | no | Extra detail (shown under "Explanation"). Use `\n\n` for a new paragraph |
| `challenges` | no | List of key challenges, shown as bullets in a side box |
| `description` | no | Plain text instead of the sections above |
| `code` | no | A short ID shown on the statement, e.g. `AI-01` (must be unique) |
| `additional` | no | `true` for the 6:15 PM statements (no quotes around `true`) |

A track with no statements in the file stays as a normal card.

To change a release time, edit `PS_RELEASES` near the bottom of
`hypnexis-main.html`.
