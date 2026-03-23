# Step 08 — GitHub Actions Workflow & GitHub Pages Deployment

## Goal
Create the GitHub Actions CI/CD workflow that automatically builds and deploys the app to GitHub Pages on every push to `main`. The workflow also runs the full test suite and blocks deployment if any test fails.

---

## Tests to Write First (TDD)

Create `src/__tests__/workflow.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { parse as parseYaml } from 'yaml'

// npm install --save-dev yaml (add to devDependencies)
describe('GitHub Actions workflow', () => {
  const workflowPath = resolve(__dirname, '../../.github/workflows/deploy.yml')

  it('deploy.yml exists', () => {
    expect(existsSync(workflowPath)).toBe(true)
  })

  it('workflow triggers on push to main', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    const doc = parseYaml(content)
    expect(doc.on?.push?.branches).toContain('main')
  })

  it('workflow has a test job', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    expect(content).toContain('npm test')
  })

  it('workflow has a build step', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    expect(content).toContain('npm run build')
  })

  it('workflow deploys to github-pages', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    expect(content).toContain('github-pages')
  })
})
```

Install the yaml parser used in tests:

```bash
npm install --save-dev yaml
```

**All tests must pass before this step is complete.**

---

## Implementation

### 1. Create the workflow file

Create `.github/workflows/deploy.yml`:

```yaml
name: Build, Test & Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  # Allow manual trigger from Actions tab
  workflow_dispatch:

# Sets permissions so the workflow can write to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment; cancel in-progress runs
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  # ---------------------------------------------------------------
  # Job 1: Run tests
  # ---------------------------------------------------------------
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

  # ---------------------------------------------------------------
  # Job 2: Build (only runs if tests pass)
  # ---------------------------------------------------------------
  build:
    name: Build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Vite outputs to 'dist' by default
          path: dist

  # ---------------------------------------------------------------
  # Job 3: Deploy to GitHub Pages (only runs after successful build)
  # ---------------------------------------------------------------
  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Configure your GitHub repository

Follow these steps in the GitHub UI (one-time setup):

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions** (not a branch)
3. Save.

That's all — the workflow handles everything else.

### 3. Confirm `vite.config.ts` base path

The `base` option in `vite.config.ts` must match your GitHub repo name exactly. If your repo is at `github.com/yourname/pissbook`, the base is `/pissbook/`.

```ts
// vite.config.ts
export default defineConfig({
  base: '/pissbook/',   // ← must match repo name exactly (case-sensitive)
  // ...
})
```

> **Common mistake:** If you name the repo `Pissbook` with a capital P, the base must be `/Pissbook/`. Check the URL of your GitHub repo to confirm the exact casing.

### 4. Verify build output matches Pages expectations

Run locally:

```bash
npm run build
ls dist/
# Should contain: index.html, assets/, pwa-*.png, favicon.ico, sw.js, manifest.webmanifest
```

The `dist/` folder is the artifact uploaded by the workflow. Make sure it contains `index.html` at the root.

### 5. Handle client-side routing on GitHub Pages

GitHub Pages serves a 404 HTML page for any path it doesn't know about. React Router intercepts routes in JavaScript, but the initial request for `/pissbook/data` will hit GitHub Pages' 404 before JS loads.

**Fix:** Create a `public/404.html` that redirects to `index.html` with the path encoded as a query string, and add the corresponding decode script to `index.html`.

Create `public/404.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pissbook</title>
  <script>
    // Redirect to index.html, encoding the path as a search param
    var seg = 1; // number of path segments to preserve (1 = /pissbook)
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + seg).join('/') + '/?p=/' +
      l.pathname.slice(1).split('/').slice(seg).join('/').replace(/&/g, '~and~') +
      (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
</html>
```

Add the decode script to `index.html` inside `<head>` (before the `<title>`):

```html
<script>
  // Decode the path redirect from 404.html
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      });
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded[0] +
        (decoded[1] ? '?' + decoded[1] : '') +
        l.hash
      );
    }
  }(window.location))
</script>
```

---

## Passing Criteria

1. Install the yaml dev dep: `npm install --save-dev yaml`
2. Run `npm test` — all tests in `workflow.test.ts` must pass.
3. Push to `main` on GitHub.
4. Open **Actions** tab — verify the `test` → `build` → `deploy` pipeline runs green.
5. Visit `https://<your-username>.github.io/pissbook/` — the app should load and all three routes should work.

Proceed to Step 09.
