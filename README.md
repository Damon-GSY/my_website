# Damon Guo-Siyi — website

## Run locally

Install Node.js 20 or newer, then run from the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). The original homepage is at `/`. Three interactive homepage concepts are available at `/concepts/editorial`, `/concepts/kinetic`, and `/concepts/sculpture`. Each has animated entrance, scroll reveals, and a moving 3D hero object that you can drag to rotate. The scenes need a browser with WebGL support. Your system's reduced-motion setting disables automatic animation.

To check the project, run `npm run build` and `npm run lint`.

## Original Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
