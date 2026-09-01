# Phase 0 — Project Scaffold & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Next.js App Router + TypeScript + Tailwind project with the CLAUDE.md §3 design tokens (colors, fonts) wired into the Tailwind theme, shadcn/ui initialized, and the §15 folder structure in place — with nothing rendered yet beyond a placeholder home page.

**Architecture:** Standard `create-next-app` scaffold (no `src/` dir, App Router, ESLint) at the repo root. Design tokens go into Tailwind's theme (v4 CSS-based `@theme` block in `app/globals.css`, since that's what current `create-next-app` generates — verified in Task 1). Fonts loaded via `next/font/google`. shadcn/ui components installed on top, themed via CSS variables mapped to the same tokens so `bg-tarmac`, `text-murram`, etc. and shadcn's own color slots stay in sync.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react, git.

---

### Task 1: Scaffold the Next.js app

**Files:**
- Create: entire project root (`app/`, `public/`, config files) via `create-next-app`

- [x] **Step 1: Run create-next-app in the current directory**

Run (from `C:\Users\jikah\OneDrive\Documents\Le Plug`, which currently contains only `CLAUDE.md` and `docs/`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

Expected: scaffold completes, `package.json`, `app/`, `tsconfig.json`, `next.config.ts` (or `.js`/`.mjs`), `app/globals.css` created. It will warn/prompt about the directory not being empty (because of `CLAUDE.md` and `docs/`) — accept continuing since those aren't Next.js files it needs to overwrite.

- [x] **Step 2: Inspect what Tailwind setup was generated**

Run: `cat app/globals.css` and `cat package.json | grep tailwind`

Expected: Tailwind v4 (`"tailwindcss": "^4"` in devDependencies, `@import "tailwindcss"` in `globals.css`, no `tailwind.config.ts`) — current `create-next-app` default. If instead a `tailwind.config.ts` with `content:` array was generated (Tailwind v3), note it — Task 2 below has a variant for both cases.

- [x] **Step 3: Verify the dev server runs**

Run: `npm run dev` (in background), then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`

Expected: `200`. Stop the dev server after confirming.

- [x] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js app with create-next-app"
```

---

### Task 2: Wire the CLAUDE.md design tokens into Tailwind

**Files:**
- Modify: `app/globals.css`

- [x] **Step 1: Add the color tokens as CSS variables + Tailwind v4 `@theme` block**

Replace the top of `app/globals.css` (after the `@import "tailwindcss";` line) with:

```css
@import "tailwindcss";

@theme {
  --color-tarmac: #16130F;
  --color-murram: #A8382A;
  --color-murram-dim: #7A281E;
  --color-savanna: #EDE7D8;
  --color-acacia: #22452F;
  --color-steel: #3D3A34;
  --color-chrome-start: #DCD9D0;
  --color-chrome-end: #A39C8E;

  --font-heading: var(--font-archivo), sans-serif;
  --font-body: var(--font-inter), sans-serif;
  --font-stencil: var(--font-big-shoulders-stencil), sans-serif;
}

:root {
  --radius: 0.5rem;
}
```

If Task 1 Step 2 found Tailwind v3 instead (a `tailwind.config.ts` exists), skip this CSS block and instead extend `theme.colors` and `theme.fontFamily` in `tailwind.config.ts` with the same values, then continue — the class names produced (`bg-tarmac`, `font-heading`, etc.) are identical either way.

- [x] **Step 2: Verify the tokens are usable as Tailwind classes**

Temporarily edit `app/page.tsx` to add `<div className="bg-tarmac text-savanna p-4">token test</div>` near the top of the returned JSX.

Run: `npm run dev` in background, then `curl -s http://localhost:3000 | grep -o "bg-tarmac"`

Expected: `bg-tarmac` found in the HTML output (confirms Tailwind generated the class rather than silently dropping it as unknown). Stop the dev server.

- [x] **Step 3: Remove the temporary test div**

Revert the `app/page.tsx` edit from Step 2 — Task 5 replaces this file's contents anyway, but keep the diff clean per-task.

- [x] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: add LePlug design tokens to Tailwind theme"
```

---

### Task 3: Load the three brand fonts

**Files:**
- Modify: `app/layout.tsx`

- [x] **Step 1: Import and configure the fonts via next/font/google**

In `app/layout.tsx`, replace the default font import/setup with:

```tsx
import { Archivo, Inter, Big_Shoulders_Stencil_Display } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-archivo",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bigShouldersStencil = Big_Shoulders_Stencil_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-big-shoulders-stencil",
});
```

And update the `<body>` tag's `className` to:

```tsx
<body
  className={`${archivo.variable} ${inter.variable} ${bigShouldersStencil.variable} font-body antialiased`}
>
```

If `next/font/google` does not export `Big_Shoulders_Stencil_Display` under that exact name (Google Fonts naming can differ — the family is listed as "Big Shoulders Stencil Display"), run `grep -r "Big_Shoulders" node_modules/next/dist/compiled/@next/font/dist/google/*.js` or check `node_modules/next/font/google/index.d.ts` for the exact exported identifier and use that instead.

- [x] **Step 2: Set body/heading defaults in globals.css**

Add to `app/globals.css` (after the `@theme` block from Task 2):

```css
body {
  background-color: var(--color-savanna);
  color: var(--color-tarmac);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
}
```

- [x] **Step 3: Verify fonts load**

Run: `npm run dev` in background, then `curl -s http://localhost:3000 | grep -o "font-archivo"`

Expected: the generated CSS variable class shows up in the page's computed styles (check via `curl -s http://localhost:3000/_next/static/css/*.css 2>/dev/null | grep -o "\-\-font-archivo" | head -1` if the first grep doesn't match, since font variables land in the stylesheet, not inline HTML). Stop the dev server.

- [x] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: load Archivo, Inter, and Big Shoulders Stencil fonts"
```

---

### Task 4: Initialize shadcn/ui

**Files:**
- Create: `components.json`, `components/ui/` (populated by shadcn CLI)
- Modify: `app/globals.css` (shadcn adds its own CSS variables)

- [x] **Step 1: Run the shadcn init command**

```bash
npx shadcn@latest init -d
```

Expected: `components.json` created, `lib/utils.ts` created (the `cn()` helper), `app/globals.css` gets shadcn's base-color CSS variables appended.

- [x] **Step 2: Remap shadcn's neutral color variables to LePlug tokens**

Open `app/globals.css`, find the `:root` block shadcn added (variables like `--background`, `--foreground`, `--primary`, `--border`, etc.) and update these specific values to reference the LePlug tokens instead of shadcn's defaults:

```css
:root {
  --background: var(--color-savanna);
  --foreground: var(--color-tarmac);
  --primary: var(--color-murram);
  --primary-foreground: var(--color-savanna);
  --border: var(--color-steel);
  --ring: var(--color-murram);
}

.dark {
  --background: var(--color-tarmac);
  --foreground: var(--color-savanna);
  --primary: var(--color-murram);
  --primary-foreground: var(--color-savanna);
  --border: var(--color-steel);
  --ring: var(--color-murram);
}
```

Leave any other shadcn variables (`--secondary`, `--muted`, `--accent`, `--destructive`, `--card`, `--popover`, etc.) at their generated defaults for now — they'll be tuned per-component as each one is actually used, not speculatively here.

- [x] **Step 3: Install one component to verify the pipeline works end-to-end**

```bash
npx shadcn@latest add button
```

Expected: `components/ui/button.tsx` created without errors.

- [x] **Step 4: Verify the themed button renders**

Temporarily add `<Button>Test</Button>` to `app/page.tsx` (with the import), run `npm run dev` in background, `curl -s http://localhost:3000 | grep -o "Test"`, expect a match, then revert the temporary edit (Task 5 replaces this file anyway) and stop the dev server.

- [x] **Step 5: Commit**

```bash
git add components.json components/ui lib/utils.ts app/globals.css
git commit -m "feat: initialize shadcn/ui themed to LePlug design tokens"
```

---

### Task 5: Create the §15 folder structure and placeholder home page

**Files:**
- Create: `lib/types/index.ts`, `lib/data/.gitkeep`, `lib/store/.gitkeep`, `lib/utils/.gitkeep`, `components/layout/.gitkeep`, `components/product/.gitkeep`, `components/cart/.gitkeep`, `components/account/.gitkeep`
- Modify: `app/page.tsx`

- [x] **Step 1: Create the lib and component subdirectories**

```bash
mkdir -p lib/types lib/data lib/store lib/utils
mkdir -p components/layout components/product components/cart components/account
touch lib/data/.gitkeep lib/store/.gitkeep lib/utils/.gitkeep
touch components/layout/.gitkeep components/product/.gitkeep components/cart/.gitkeep components/account/.gitkeep
```

- [x] **Step 2: Add an empty types barrel so `lib/types` isn't empty before Phase 1 fills it in**

Create `lib/types/index.ts`:

```ts
export {};
```

- [x] **Step 3: Replace the default home page with a minimal on-brand placeholder**

Replace `app/page.tsx` entirely with:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-tarmac text-savanna flex items-center justify-center">
      <h1 className="font-heading text-4xl font-black">LE PLUG AUTOCARE</h1>
    </main>
  );
}
```

- [x] **Step 4: Verify the placeholder renders**

Run: `npm run dev` in background, `curl -s http://localhost:3000 | grep -o "LE PLUG AUTOCARE"`, expect a match. Stop the dev server.

- [x] **Step 5: Commit**

```bash
git add lib components app/page.tsx
git commit -m "chore: add lib/components folder structure per CLAUDE.md §15"
```

---

### Task 6: Lint and typecheck gate

**Files:** none (verification only)

- [x] **Step 1: Run lint**

Run: `npm run lint`

Expected: no errors. If shadcn or font setup introduced any lint warnings, fix them before proceeding.

- [x] **Step 2: Run the TypeScript compiler in check mode**

Run: `npx tsc --noEmit`

Expected: no errors.

- [x] **Step 3: Commit only if fixes were needed**

```bash
git add -A
git commit -m "fix: resolve lint/typecheck issues from scaffold"
```

(Skip this step if Steps 1-2 were already clean.)

---

## Definition of done for Phase 0

- [x] `npm run dev` serves the placeholder home page at `http://localhost:3000`
- [x] `bg-tarmac`, `text-murram`, `font-heading` (etc.) all resolve to real CSS, not unknown-class no-ops
- [x] Archivo, Inter, and Big Shoulders Stencil fonts are loaded via `next/font`
- [x] shadcn/ui is initialized and its theme variables are mapped to LePlug tokens
- [x] `lib/{types,data,store,utils}` and `components/{ui,layout,product,cart,account}` all exist
- [x] `npm run lint` and `npx tsc --noEmit` both pass clean
- [x] Git repo initialized with one commit per task above

## Deviations from plan (discovered during execution)

- Scaffolded into a temp `leplug-autocare/` subfolder and moved files up, since `create-next-app` rejects the actual folder name "Le Plug" (spaces/capitals invalid in npm package names). `node_modules` couldn't be `mv`'d on Windows (OneDrive file lock) — reinstalled via `npm install` at the root instead.
- The correct next/font export is `Big_Shoulders_Stencil`, not `Big_Shoulders_Stencil_Display` as guessed in Task 3.
- shadcn's current default primitive backend is **Base UI**, not Radix (CLAUDE.md §2 names Radix specifically) — functionally equivalent for accessibility (focus trapping, keyboard nav, ARIA), just a different underlying library. Flagging in case that distinction matters later.
- `npx shadcn@latest init -d` overwrote our font wiring: it injected an unwanted Geist font into `layout.tsx` and rewrote `--font-heading` to a circular/wrong reference in `globals.css`'s `@theme inline` block. Fixed by removing the injected Geist font entirely and pointing `@theme inline`'s `--font-sans` at `var(--font-inter)`. Verified via the actual compiled CSS (not just class-name presence) that the var() chain resolves correctly at runtime.
- `lib/utils.ts` (shadcn's `cn()` helper) and `lib/utils/` (our future domain utilities, e.g. `formatCurrency`) coexist as sibling file+directory without conflict, since TypeScript resolves the bare `@/lib/utils` specifier to the file, while subpath imports like `@/lib/utils/format-currency` reach the directory unambiguously.
