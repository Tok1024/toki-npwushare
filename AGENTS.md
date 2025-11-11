# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives in `app/`, with route groups such as `app/galgame`, `app/resource`, and API handlers in `app/api`. Reusable UI resides in `components/*`, shared logic and state in `lib/`, `hooks/`, and `store/` (Zustand stores like `store/userStore.ts`). Data access is centralized through Prisma in `prisma/` (schema split across `prisma/schema/*.prisma`) and Redis helpers in `lib/redis.ts`. Assets and styles are placed under `public/` and `styles/`, while automation lives in `scripts/` and background jobs in `server/`.

## Build, Test, and Development Commands
Run `pnpm dev` for the local Next.js server with Turbo mode. `pnpm build` compiles the production bundle (used by PM2 via `ecosystem.config.cjs`). `pnpm start` boots the built app. Schema updates flow through `pnpm prisma:generate` and `pnpm prisma:push`. Use `docker-compose up -d postgres redis` for local infrastructure, or point `KUN_DATABASE_URL`/`REDIS_HOST` to external services.

## Coding Style & Naming Conventions
TypeScript + ESLint (`pnpm lint`) and Prettier (`pnpm format`) enforce syntax, 2-space indentation, and import ordering. React components use PascalCase (`KunTopBar`), hooks start with `use*`, utility modules stay camelCase (`utils/kunFetch.ts`). Follow Tailwind utility classes inside JSX; shared CSS belongs in `styles/*.css`. Keep server-only code in `.ts` files under `app/**/actions.ts` or `server/` to avoid bundling into the client.

## Testing Guidelines
Automated tests are minimal today, so rely on `pnpm lint`, `pnpm typecheck`, and manual verification in feature branches. When adding tests, colocate them near the feature (e.g., `components/foo/foo.test.tsx`) and prefer React Testing Library or Playwright for UI flows. For Prisma changes, create seed scripts in `prisma/` and verify with `pnpm prisma:push` against a disposable database.

## Commit & Pull Request Guidelines
Commits follow a shorttag style from history (`feat:`, `fix:`, `mod:`, `pref:`). Keep messages in lowercase imperative form and group logically related edits. PRs must describe intent, include setup/testing notes, and link issues or discussion threads. Add screenshots or GIFs for UI tweaks and paste relevant console output for backend changes. Always confirm `pnpm build && pnpm lint && pnpm typecheck` before requesting review.
