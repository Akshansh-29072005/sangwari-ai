# Sangwari AI Mobile App (Expo)

React Native client for Sangwari AI, built with Expo Router and TypeScript.

This app provides citizen-facing workflows for:

- onboarding and authentication (OTP + MPIN)
- scheme discovery and applications
- grievance filing and tracking
- profile and document management
- in-app notification center and toast alerts
- voice-assistant UX layer

---

## 1) Tech Stack

- Expo SDK `54`
- React Native `0.81`
- React `19`
- Expo Router (file-based routing)
- Nativewind + Tailwind config
- AsyncStorage for token/local persistence

---

## 2) App Architecture

```text
app/
├── app/                     # screens and route groups (Expo Router)
├── api/                     # network client + typed route wrappers
├── components/              # shared UI components/primitives
├── constants/               # theme tokens/constants
├── context/                 # theme and i18n state providers
├── hooks/                   # platform/theme hooks
├── services/                # polling/integration services
└── assets/                  # static assets
```

### Core runtime flow

1. Auth token is read from AsyncStorage
2. All network requests go through `api/api.ts` (`apiFetch` wrapper)
3. App screens call route wrappers in `api/routes/*`
4. Notification service polls backend and shows in-app toast HUD

---

## 3) Configuration

Set backend URL in:

- `api/api.ts` -> `API_BASE_URL`

For local device testing, use machine LAN IP (not `localhost`), for example:

- `http://192.168.x.x:8000`

---

## 4) Install & Run

```bash
npm install
npx expo start
```

Optional targets:

```bash
npm run android
npm run ios
npm run web
```

Lint:

```bash
npm run lint
```

---

## 5) Routing and Screens

Main route groups:

- `app/auth/*`
  - language selection
  - OTP verification
  - MPIN setup/login
- `app/(tabs)/index.tsx`
  - main dashboard
  - quick complaint input
  - voice assistant modal interactions
  - summary cards for schemes/applications/complaints
- `app/schemes/*`
  - eligible schemes list
  - debounced backend search
  - scheme detail and application entrypoint
- `app/profile.tsx`
  - profile details and preferences
  - profile image upload
  - document upload flow
- `app/notifications.tsx`
  - notifications list and read-state handling

---

## 6) API Integration

## 6.1 Central client

`api/api.ts` provides:

- timeout management
- token injection in `Authorization: Bearer <token>`
- unified response shape
- error normalization

## 6.2 Route wrappers

- `api/routes/auth.ts`
- `api/routes/schemes.ts`
- `api/routes/complaints.ts`
- `api/routes/voice.ts`
- `api/routes/user.ts`
- `api/routes/notifications.ts`

These wrappers map directly to backend REST endpoints.

---

## 7) State, Theme, and Localization

- Theme context: `context/ThemeContext.tsx`
- i18n context: `context/I18nContext.tsx`
- `global.css` + Nativewind drive styling foundation
- Hooks under `hooks/` provide theme-aware behavior

---

## 8) Notifications

`services/NotificationService.ts` handles:

- periodic polling (default 30 seconds)
- duplicate prevention using stored last notification ID
- notification rendering via `components/ui/NotificationToast.tsx`

Native push configuration is intentionally minimized in current flow; app uses premium in-app toast HUD behavior.

---

## 9) File and Media Uploads

- Profile image: camera/gallery via `expo-image-picker`
- Document upload: `expo-document-picker`
- Upload requests use multipart form-data to backend endpoints

Backend serves uploaded files under `/uploads` static route.

---

## 10) Build and Release

Build profiles are defined in `eas.json`:

- `development` (internal dev client)
- `preview` (internal APK)
- `production` (store distribution)

App metadata and plugin configuration are in `app.json`.

---

## 11) Known Behavior Notes

- Some voice assistant logic in UI is currently simulated in parts of the home flow.
- The app depends on backend auth token presence for most user workflows.
- Ensure `API_BASE_URL` is updated per environment before test/release builds.

---

## 12) Developer Checklist

Before testing end-to-end:

- backend reachable from device/emulator
- AI layer running for AI-driven routes
- valid login token present
- notifications endpoint returns data for poll validation

