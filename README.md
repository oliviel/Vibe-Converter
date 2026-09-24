# Vibe Converter

A currency and cryptocurrency converter built with Expo Router. It supports multiple themes, a calculator keypad, and saved exchange rates for offline use.

## Run locally

```bash
npm install
npx expo start
```

## Check the project

```bash
npx expo lint
npx tsc --noEmit
```

The app screens are in `src/app/`. Exchange rates are fetched in `src/services/currency-api.ts` and saved on the device with `expo-sqlite/kv-store`.
