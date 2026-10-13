# Shopping List App

A shopping list web app for Task 4 in Mobile Applications, built with React, TypeScript, Redux Toolkit, and json-server.

Create an account, build shopping lists, tick items off right from the home page, search and sort inside a list, pick a photo for an item straight from Unsplash, share a list with someone else, and manage your account (including dark mode) from a settings sidebar.

## Screenshots

| Home | List detail |
| --- | --- |
| <img width="1862" height="952" alt="Home page" src="https://github.com/user-attachments/assets/7222a065-2f4f-4b60-9fb8-db752db8cf71" /> | <img width="1861" height="958" alt="List detail page" src="https://github.com/user-attachments/assets/157ecf00-5994-4656-8ea8-b8a5d5bcfef8" /> |

| Login | Profile |
| --- | --- |
| <img width="1867" height="955" alt="Login page" src="https://github.com/user-attachments/assets/da91bdf8-c3f8-44fc-a149-263699fc89f8" /> | <img width="1864" height="956" alt="Profile page" src="https://github.com/user-attachments/assets/c7504914-41f6-44be-994c-200e230bd9d0" /> |

| Registration |
| --- |
| <img width="1854" height="951" alt="Registration page" src="https://github.com/user-attachments/assets/6826e9ff-c7d5-4112-8607-8bca55770a01" /> |


## Live demo

- **App:** https://shopping-list-seven-blond.vercel.app/login
- **API:** https://shopping-list-3lsy.onrender.com/

## Tech stack

| Layer | Tech |
|---|---|
| UI | React 19, TypeScript, Vite |
| Routing | React Router v7 |
| State | Redux Toolkit |
| Data fetching | RTK Query |
| Backend | json-server (mock REST API over `db.json`) |
| Auth | AES encryption via `crypto-js` (client-side) |
| Images | Unsplash API |
| Icons | lucide-react |
| Styling | Plain CSS, custom-property design tokens |

## Features

- **Auth.** Register, login, session persisted in `localStorage`. An unknown email is shown plainly with a link to register, while a wrong password gets a generic error on purpose (see Architecture notes below).
- **Shopping lists.** Create, rename, delete (cascades to items), share by email, categorize.
- **Items.** Add, edit, delete, set quantity and notes, assign a category, and pick a photo live from Unsplash.
- **Check off from the home page.** Tick items directly on the list card without opening the list.
- **Search & sort.** Both are reflected in the URL inside a list.
- **Profile & settings.** Personal info, update account, dark mode toggle, cascading account deletion.
- **Toasts.** Feedback on every create, update, delete, and share action.

## Getting started

```bash
git clone https://github.com/thegrindneverstops21/shopping-list.git
cd shopping-list
npm install
```

Copy `.env.example` to `.env` in the project root and edit the values:

```dotenv
VITE_AES_SECRET=a-long-random-string
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
VITE_API_BASE_URL=http://localhost:3001
```

Keep the AES key unchanged: accounts created with one key cannot be decrypted with another. Restart Vite after changing `.env`. The Unsplash key is optional; without it, items can still be saved and images can be uploaded manually.


Get an Unsplash key free at [unsplash.com/developers](https://unsplash.com/developers) (Demo tier, 50 requests per hour, plenty for this project).

Run the mock backend and the app in two terminals:

```bash
npm run server   # json-server on :3001
npm run dev      # Vite dev server
```

## Project structure

src/
api/ RTK Query slices: authApi, listsApi, itemsApi, unsplashApi
app/ store.ts, hooks.ts
auth/ authSlice
ui/ uiSlice (toasts)
components/ shared primitives: Button, Modal, ConfirmDialog, FormField,
Navbar, Layout, ProtectedRoute, PublicOnlyRoute, ToastContainer
features/ LoginPage, RegisterPage, ListCard, ListForm, ItemCard,
ItemForm, ShareModal
pages/ HomePage, ListDetailPage, ProfilePage
utils/ encryption, validation, categories, useTheme
types/ users, list, item
styles/ tokens.css, global.css, auth.css, layout.css, home.css,
items.css, profile.css
db.json seed data for json-server


## Architecture notes

json-server has no logic of its own. It's a REST mock that reads and writes `db.json`, and every real decision happens on the client, before or after the request:

- Password encryption and decryption (AES via `crypto-js`)
- Duplicate email checking on registration
- Cascading deletes (deleting a list removes its items, deleting an account removes its lists and their items), implemented as custom RTK Query `queryFn` mutations, since json-server can't do relational deletes on its own
- Search and sort are pushed onto json-server's own query params (`name_like`, `_sort`, `_order`) rather than filtered client-side

`ProtectedRoute` only guards the React UI. It doesn't secure the underlying data, since json-server has no auth layer of its own. That's a known, accepted limitation of building on a mock backend rather than a real one.

## Known limitations

- **Render free tier has ephemeral disk.** The hosted json-server resets to its committed `db.json` after a period of inactivity, which is fine for a live demo in one sitting but not for long-term data persistence.
- **Cold starts.** The first request after inactivity can take 30 to 60 seconds while the free instance spins back up.
- **No real backend security.** Auth is enforced client-side only, and the raw json-server endpoints are unprotected if hit directly.
- **AES is a learning exercise.** Vite exposes the encryption key in the browser bundle. Production authentication needs server-side password hashing and verified sessions.
- **Deletes are not transactions.** If a cascading delete fails halfway through, some records may already have been removed. The app reports the error rather than claiming success.

## Understanding the code

`main.tsx` starts React and provides the Redux store. `App.tsx` chooses a page from the URL. Pages collect user input and call hooks from `api/`; those hooks send HTTP requests to json-server. Calling `.unwrap()` gives the response data on success and throws on failure, so `try/catch` can show feedback.

Registration validates the form, checks for an existing email, encrypts the password, and posts the account. `toSafeUser()` selects profile fields before saving the session, so the password stays out of `localStorage`. Email comparisons ignore surrounding spaces and letter case. Sharing lets recipients view and edit items; only the owner sees share and delete-list controls. These controls are UI rules, since the mock API does not enforce permissions.

For a registration failure, check that both terminals are running, `.env` contains `VITE_AES_SECRET`, and `VITE_API_BASE_URL` points to the API. The form now shows setup and connection errors directly.

```bash
npm run lint
npm run build
npm test
```

## Author

Built by [thegrindneverstops21](https://github.com/thegrindneverstops21)
