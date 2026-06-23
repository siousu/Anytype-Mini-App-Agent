# Anytype Mini-App Skill

A [Claude Code](https://claude.com/claude-code) **skill** for building
[Anytype](https://anytype.io) **mini-apps** — plus a gallery of working example
apps that the skill was distilled from.

An *Anytype mini-app* is a single, self-contained HTML file that renders inside
an Anytype page's embed block. It can persist and live-sync state across every
member of a space. No build step, no bundler, no dependencies you ship yourself:
the whole app (markup, CSS, JS, fonts, audio) lives in one file.

This repo is the skill folder itself:

```
.claude/skills/anytype-mini-app-builder/
├── SKILL.md            # the knowledge: runtime contract, pitfalls, patterns, workflow
├── examples/           # 7 finished, runnable mini-apps to learn from
└── scripts/verify.mjs  # syntax-checks every inline <script> block of an app
```

---

## Using the skill

The skill lives at `.claude/skills/anytype-mini-app-builder/`, the standard
location Claude Code reads skills from. Two ways to use it:

1. **Open this repo as your project** in Claude Code. The skill is discovered
   automatically.
2. **Copy** the `.claude/skills/anytype-mini-app-builder/` folder into another
   project's `.claude/skills/` (or your personal `~/.claude/skills/`).

Then just ask, e.g. *"build an Anytype mini-app that …"*, *"make this a synced
Anytype widget"*, or *"port this game into an Anytype embed"*. The skill loads
on anything involving `useAnytypeState`, the persistent `state` block, clickable
Anytype object links, or porting a tool/game into an embed.

---

## What the skill knows

`SKILL.md` is the source of truth; this is its table of contents:

1. **The runtime contract** — the iframe wrapper injects three host scripts
   (`react.js`, `react-dom.js`, `useAnytypeState.js`) and mounts into `#app`.
   React 18, **no JSX** (`var h = React.createElement`).
2. **CSS pitfalls of the wrapper** — the wrapper sets `#root{font-size:0}` and
   `*{user-select:none}`; the infamous `-webkit-text-fill-color: transparent`
   inheritance trap that makes text invisible while emoji stay visible. Fixes
   for each.
3. **Persistent, synced state** — `useAnytypeState`, the append-only op-log
   pattern for clean multi-writer merges, fresh-handler refs, and a pending
   mirror for instant local updates despite sync round-trips.
4. **Sandbox capabilities and limits** — external `fetch` works; external
   `<iframe>`s and CDN `<script>`s are blocked; Web Audio works; and **native
   modal dialogs (`confirm()`/`alert()`/`prompt()`) are silently suppressed** —
   use an in-app confirm step instead.
5. **Layout & UX conventions** that survive the wrapper.
6. **Clickable links to Anytype objects** from inside the embed (the
   `postMessage` recipe).
7. **Bundling third-party code/assets** into one file.
8. **Build & verify workflow.**
9. **Collaboration norms.**

---

## The mini-app gallery

All apps live in `.claude/skills/anytype-mini-app-builder/examples/`. Each is a
single HTML file — drop it into an Anytype mini-app block to run it. The three
injected runtime scripts (`react.js`, `react-dom.js`, `useAnytypeState.js`) are
provided by Anytype and are intentionally **not** included here.

| App | What it demonstrates |
|-----|----------------------|
| `team-poll-mini-app.html` | Live synced voting. Append-only op-log + reducer, fresh-handler refs, pending-mirror for instant updates, a name-gate overlay, in-app confirm (native `confirm()` is blocked), Web-Audio feedback + confetti. |
| `pixel-place-mini-app.html` | A shared pixel canvas that syncs live. Op-log state, DPR-correct canvas rendering, `requestAnimationFrame` animation loop, PNG export, in-app confirm. |
| `pacman-mini-app.html` | The deepest example: synced leaderboard via `useAnytypeState`, name + Start UI, tamper-evidence signatures, `goRef` fresh handlers + pending-mirror, hardened text colors, focus guard, embedded data-URI font + audio. |
| `snake-mini-app.html` | Same leaderboard/state pattern, all original code, signatures, DPR canvas + rAF. |
| `markt-dashboard.html` | `useAnytypeState` + external `fetch` (CoinGecko + MarketData) with loading/error states and auto-load-once. |
| `synth-sequenzer.html` | A Web-Audio drum sequencer. Vanilla (no synced state), lookahead scheduler, explicit `font-size`. |
| `timetracker-mini-app-en.html` | Weekly-calendar time tracker. `postMessage` deep-links, `localStorage` for per-user prefs. |

---

## Verifying an app

A mini-app can't be truly run outside Anytype, but you can catch syntax errors in
every inline `<script>` block before pasting it in:

```bash
cd .claude/skills/anytype-mini-app-builder
node scripts/verify.mjs examples/team-poll-mini-app.html
```

It compiles each block without executing it, so missing `React` /
`useAnytypeState` globals are fine — only real parse errors fail.

---

## How a mini-app runs (in short)

```html
<!-- injected by Anytype's wrapper – do not ship these yourself -->
<script src="./react.js"></script>
<script src="./react-dom.js"></script>
<script src="./useAnytypeState.js"></script>

<div id="app"></div>
<script>
(function () {
  "use strict";
  var h = React.createElement;          // no JSX
  function App() {
    var s = useAnytypeState({ ops: [] }); // persistent, synced shared store
    var data = s[0], setData = s[1];
    // ...
  }
  ReactDOM.createRoot(document.getElementById("app")).render(h(App));
})();
</script>
```

See `SKILL.md` for the full contract, the patterns, and the gotchas.

---

## License

[MIT](LICENSE). Some example apps bundle small third-party assets under their own
permissive licenses, noted inline in the relevant file.
