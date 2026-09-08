# Shopping List App

A shopping list web app for Task 4 in Mobile Applications, built with React, TypeScript, Redux Toolkit, and json-server.

Create an account, build shopping lists, tick items off right from the home page, search and sort inside a list, pick a photo for an item straight from Unsplash, share a list with someone else, and manage your account (including dark mode) from a settings sidebar.

## Screenshots

| Home | List detail |
|---|---|
| ![Home page]<img width="1862" height="952" alt="image" src="https://github.com/user-attachments/assets/7222a065-2f4f-4b60-9fb8-db752db8cf71" />
 | ![List detail page]<img width="1861" height="958" alt="image" src="https://github.com/user-attachments/assets/157ecf00-5994-4656-8ea8-b8a5d5bcfef8" />
 |

| Login | Profile |
|---|---|
| ![Login page]<img width="1867" height="955" alt="image" src="https://github.com/user-attachments/assets/da91bdf8-c3f8-44fc-a149-263699fc89f8" />
 | ![Profile page] |<img width="1864" height="956" alt="image" src="https://github.com/user-attachments/assets/c7504914-41f6-44be-994c-200e230bd9d0" />

  | ![Registration page]<img width="1854" height="951" alt="image" src="https://github.com/user-attachments/assets/6826e9ff-c7d5-4112-8607-8bca55770a01" />
||


## Live demo

- **App:** https://shopping-list-seven-blond.vercel.app/login
- **API:** https://shopping-list-3lsy.onrender.com/

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

Create a `.env` file in the project root:
VITE_AES_SECRET=a-long-random-string
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
VITE_API_BASE_URL=http://localhost:3001


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
ItemForm, ImagePicker, ShareModal
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

## Author

Built by [thegrindneverstops21](https://github.com/thegrindneverstops21)
