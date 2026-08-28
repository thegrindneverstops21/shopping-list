# Shopping List App

A full-stack-feeling shopping list app built with React, TypeScript, Redux Toolkit, and json-server — Task 4 for Mobile Applications.

Create an account, build shopping lists, tick items off right from the home page, search and sort inside a list, pick a photo for an item straight from Unsplash, share a list with someone else, and manage your account (including dark mode) from a settings sidebar.

## Live demo

- **App:** `<your-frontend-url>`
- **API:** `<your-render-json-server-url>` (Render free tier — see [Known limitations](#known-limitations))

## Tech stack

| Layer | Tech |
|---|---|
| UI | React 19, TypeScript, Vite |
| Routing | React Router v6 |
| State | Redux Toolkit |
| Data fetching | RTK Query |
| Backend | json-server (mock REST API over `db.json`) |
| Auth | AES encryption via `crypto-js` (client-side) |
| Images | Unsplash API |
| Icons | lucide-react |
| Styling | Plain CSS, custom-property design tokens |

## Features

- **Auth** — register, login, session persisted in `localStorage`. Unknown email is shown plainly with a link to register; wrong password gets a generic error, on purpose (see [Architecture notes](#architecture-notes)).
- **Shopping lists** — create, rename, delete (cascades to items), share by email, categorize.
- **Items** — add, edit, delete, quantity, notes, category, and a photo picked live from Unsplash.
- **Check-off from the home page** — tick items directly on the list card, no need to open the list.
- **Search & sort** — both reflected in the URL, inside a list.
- **Profile / settings** — personal info, update account, dark mode toggle, cascading account deletion.
- **Toasts** — feedback on every create/update/delete/share action.

## Getting started

```bash
git clone https://github.com/thegrindneverstops21/shopping-list.git
cd shopping-list
npm install
```

Create a `.env` file in the project root:

```
VITE_AES_SECRET=a-long-random-string
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
VITE_API_BASE_URL=http://localhost:3001
```

Get an Unsplash key free at [unsplash.com/developers](https://unsplash.com/developers) (Demo tier — 50 requests/hour, plenty for this project).

Run the mock backend and the app in two terminals:

```bash
npm run server   # json-server on :3001
npm run dev      # Vite dev server
```

## Project structure

```
src/
  api/            RTK Query slices — authApi, listsApi, itemsApi, unsplashApi
  app/            store.ts, hooks.ts
  auth/           authSlice
  ui/             uiSlice (toasts)
  components/     shared primitives — Button, Modal, ConfirmDialog, FormField,
                   Navbar, Layout, ProtectedRoute, PublicOnlyRoute, ToastContainer
  features/       LoginPage, RegisterPage, ListCard, ListForm, ItemCard,
                   ItemForm, ImagePicker, ShareModal
  pages/          HomePage, ListDetailPage, ProfilePage
  utils/          encryption, validation, categories, useTheme
  types/          users, list, item
  styles/         tokens.css, global.css, auth.css, layout.css, home.css,
                   items.css, profile.css
db.json           seed data for json-server
```

## Architecture notes

json-server has no logic of its own — it's a REST mock that reads and writes `db.json`. Every real decision happens on the client, before or after the request:

- Password encryption/decryption (AES via `crypto-js`)
- Duplicate-email checking on registration
- Cascading deletes (deleting a list removes its items; deleting an account removes its lists and their items) — implemented as custom RTK Query `queryFn` mutations, since json-server can't do relational deletes on its own
- Search and sort are pushed onto json-server's own query params (`name_like`, `_sort`, `_order`) rather than filtered client-side

`ProtectedRoute` only guards the React UI — it doesn't secure the underlying data, since json-server has no auth layer of its own. That's a known, accepted limitation of building on a mock backend rather than a real one.

## Known limitations

- **Render free tier has ephemeral disk.** The hosted json-server resets to its committed `db.json` after a period of inactivity — fine for a live demo in one sitting, not for long-term data persistence.
- **Cold starts.** The first request after inactivity can take 30–60 seconds while the free instance spins back up.
- **No real backend security.** Auth is enforced client-side only; the raw json-server endpoints are unprotected if hit directly.

## Author

Built by [thegrindneverstops21](https://github.com/thegrindneverstops21) for the Mobile Applications course.
