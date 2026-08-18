# AGENTS.md

Expo SDK 54 React Native app (`my_2nd_app`), matching Expo Go 54. Screens: Splash → Login → Map. Backend: `https://ezwork.vn/ez_work`.

## Commands

```bash
pnpm start         # expo start
pnpm android       # expo start --android
pnpm ios           # expo start --ios
```

No test suite. Do not add Jest/Detox unless asked.

## Layout

```
App.js                 # root class `Betty`; splash then Login after 1s
view/Splash/Splash.js
view/Login/Login.js    # POST /user/login → Map with sessionid
view/Map/Map.js        # MapView + markers from area/property APIs
view/CONST/CONST.js    # USE_BACKEND flag, API URL, demo markers
Image/                 # assets (login logo: Image/anh.png)
app.json               # Expo config (SDK 54, iOS + Android)
```

Entry is `node_modules/expo/AppEntry.js` → `App.js`.

## Stack (do not upgrade unless asked)

- Expo `~54.0.37`, React `19.1.0`, React Native `0.81.5` (Expo Go 54)
- Class components + `this.state` (no hooks)
- `StyleSheet.create` colocated in the same file
- `react-native-maps` (`MapView` / `Marker`)
- JavaScript only; no TypeScript
- pnpm with `node-linker=hoisted` in `.npmrc`

Match existing quote style and file conventions. Prefer small, local edits over refactors.

## Screen flow

1. `Betty` mounts `<Splash />`, then after 1s swaps to `<Login />`.
2. Login: if `CONST.USE_BACKEND` is false, LOGIN skips the API and opens the map. If true, POSTs `{ usr_name, usr_pwd, device_type: "web", app: "sdes" }` to `/user/login`.
3. `response.code == 200` → render `<Map sessionid={...} />`. Other codes show as login error text.
4. Map: demo mode uses `CONST.DEMO_MARKERS`. Backend mode POSTs `/area/getareabranchbyparent` then `/property/getpropertybyobjid` for Latitude/Longitude.
5. Default map region: `15.082304, 108.095521` (central Vietnam). GPS code in `Map.js` is commented out — leave it commented unless asked.

## API

- Base URL: `https://ezwork.vn/ez_work` (in `view/CONST/CONST.js`)
- `Content-Type: application/json`
- Success: `code == 200` (loose equality, as in existing code)
- Login payload fields: `usr_name`, `usr_pwd` (not `username`/`password` or `user_name`)
- Keep API contracts and field names unchanged unless the backend changes

Do not commit secrets. Session IDs come from login responses, not source.

## UI conventions

- Primary background `#3498db`; login button `rgba(41, 128, 185, 1.0)`
- Login inputs: translucent white, white text
- Full-screen map: `position: "absolute"` on all four edges
- Local images via `require(...)` (e.g. `require("../../Image/anh.png")`)

## Boundaries

**Do**

- Keep class components and current Expo 54 APIs
- Put new screens under `view/<Name>/<Name>.js`
- Reuse the existing `fetch` + `response.code` pattern
- Clear timeouts/watchers in `componentWillUnmount` when you add them

**Ask first**

- Expo / React Native upgrades
- Replacing class components with hooks or adding a navigator
- Changing login payload, API URLs, or `are_parent`
- Adding new dependencies

**Never**

- Commit `node_modules/`, `.expo/`, or credentials
- Uncomment GPS tracking without an explicit request
- Introduce a new navigation library for a one-screen swap (this app swaps via `setState`)
- Rewrite `CONST.js` consumers until it actually holds shared values

## Known pitfalls

- `Map.js` mutates `this.state.markers` then `setState`. Prefer copying the array if you touch marker updates.
- Import `Marker` from `react-native-maps` (`MapView.Marker` was removed).
- Login uses `loggedIn` for navigation and `error` for failed-login text. Do not store the API error string in a `login` flag.
