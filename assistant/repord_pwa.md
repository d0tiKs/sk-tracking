# PWA Readiness Assessment – skull‑king‑scorekeeper
---

## 1️⃣ Current Asset Overview

| File                          | Location  | Notes        |
| ----------------------------- | --------- | ------------ |
| `public/manifest.webmanifest` | `/public` | Exists, but: |

- Uses absolute paths (`/icons/...`) that will resolve to `<repo‑name>/icons/...`, which are missing.
- `start_url` and `scope` set to `/`, not accounting for the GitHub Pages sub‑path. |
  | `index.html` (root) | `/index.html` | Exists, but references:
  `<link rel="manifest" href="/manifest.webmanifest">`
  —again absolute path.
  `<script type="module" src="/src/main.tsx"></script>`. The module is not a pre‑bundled JS file; GitHub Pages cannot serve raw TSX modules. |
  | `dev-dist/sw.js` | `/dev-dist` | Service worker uses Workbox and precaches `registerSW.js` & `index.html`, but the paths are relative to the repo root (`/`). No reference from the page to register it. |
  | `public` folder contains **only** the manifest; no `index.html`, icons, or bundled JS. |

---

## 2️⃣ Missing / Incorrect PWA Assets

1. **HTML Entry Point**
   - GitHub Pages expects an `index.html` in the root of the branch (or `/docs`).
   - The current `index.html` lives outside `/public`; it references TSX modules which are not served by GitHub Pages.
2. **Icons**
   - Manifest points to `/icons/icon-192.png` and `/icons/icon-512.png`.
   - No such files exist in the repo; icons must be added under a path that is reachable (`/icons/...` or `public/icons/...`).
3. **Service Worker Registration**
   - The page does not load/register any service worker script.
   - There is no `<script>` block for `dev-dist/sw.js`, and the current `registerSW.js` only registers `/dev-sw.js?dev‑sw`.
4. **Path Prefixing for GitHub Pages**
   - All static asset URLs (`/manifest.webmanifest`, `/src/main.tsx`, service worker, icons) are absolute; when hosted at `https://<user>.github.io/<repo>/`, they resolve to `<repo>/...` but the repo’s root is already that path.
   - For a repository named **sk-tracking2**, URLs should be prefixed with `/sk-tracking2/`. e.g., `<link rel="manifest" href="/sk-tracking2/manifest.webmanifest">`.
5. **Build Output**
   - Vite (or similar) is used – there’s no `dist` folder or bundled JS in the repo. GitHub Pages can only serve static files, not a dev server.
6. **HTTPS & Service Worker**
   - GitHub Pages serves over HTTPS; service workers must be registered on an HTTPS origin. This condition is satisfied.

---

## 3️⃣ Checklist for Publishing

| #   | Requirement                     | Current Status                            | Action Needed                                                                                                                                                                  |
| --- | ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Root `index.html`**           | Exists but not in `/public`.              | Move/duplicate to repo root (or create a new one) that includes the bundled JS and service worker registration.                                                                |
| 2   | **Bundled JS**                  | Missing – only TSX source present.        | Build with Vite (`vite build`) producing `dist/index.html`, `main.js`, etc., then copy to `/public` or repo root.                                                              |
| 3   | **Service Worker Registration** | Not in page; register script missing.     | Add `<script src="/sk-tracking2/sw.js"></script>` (or equivalent) after loading the bundled JS, and ensure paths are correct.                                                  |
| 4   | **Manifest Paths**              | Absolute `/icons/...` with missing icons. | Provide icon files under `/sk-tracking2/icons/` or adjust paths to existing location.                                                                                          |
| 5   | **PWA Manifest Location**       | In `/public`.                             | Keep in repo root or `/docs`, and reference it from `index.html`.                                                                                                              |
| 6   | **URL Prefixing**               | Unprefixed absolute URLs.                 | Update all asset references to include the repo name: `<link rel="manifest" href="/sk-tracking2/manifest.webmanifest">`, `<script src="/sk-tracking2/main.js"></script>`, etc. |
| 7   | **GitHub Pages Configuration**  | Not yet set.                              | In Settings → Pages, choose `main` branch / root or `/docs`.                                                                                                                   |
| 8   | **HTTPS & Service Worker**      | OK (GitHub Pages uses HTTPS).             | Ensure service worker is registered on the same origin and the scope matches the site path.                                                                                    |

---

## 4️⃣ Suggested File Structure After Fixes

```
sk-tracking2/
├─ public/          # Static assets for GitHub Pages
│   ├─ index.html   # Root HTML with bundled JS & SW registration
│   ├─ main.js      # Bundled JavaScript from Vite
│   ├─ sw.js        # Service worker (or reference to dev-dist/sw.js)
│   ├─ icons/
│       ├─ icon-192.png
│       └─ icon-512.png
├─ src/             # Source code for local development
│   ├─ main.tsx     # React entry point
│   └─ ...          # Other TSX modules
├─ dev-dist/        # Build artifacts (optional)
└─ manifest.webmanifest
```

---

## 5️⃣ Next Steps

1. **Build the project** locally (`npm run build` or `vite build`) to generate a static `dist` folder.
2. **Copy `index.html`, bundled JS, and service worker** into `/public` (or root) with proper relative paths.
3. **Add icon files** to `public/icons/`.
4. **Update the manifest** to use relative URLs or prefixed absolute URLs matching GitHub Pages path.
5. **Commit changes** and push to the `main` branch.
6. **Configure GitHub Pages** in repository settings: Branch → `main`, Folder → `/` (root) or `/docs`.
7. **Verify the site** by visiting `https://<username>.github.io/sk-tracking2/`; run Lighthouse PWA audit and test “Add to Home Screen”.

---

## 6️⃣ Summary

- The repository currently lacks a proper static build output, missing icons, incorrect URLs, and no service worker registration.
- Once the above items are addressed, the PWA will be fully functional on GitHub Pages.
