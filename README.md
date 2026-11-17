# Faker Blue

Faker Blue is a browser based 2D board game project. The repository contains a Spring Boot backend and a React frontend.

## Project layout

- `backend/` — Spring Boot 4.1.2, Java 21, Gradle Groovy, Spring MVC, Spring Security
- `frontend/` — React, Vite, TypeScript, styled-components, TanStack Query, pnpm

The backend has no database dependency and keeps the lobby, guest access password, active players, and leaderboard in memory.

## Authentication

The React app owns all user-facing routes: `/login` for guests, `/admin` for the host, and `/` for the game. The host signs in using `FAKER_BLUE_ADMIN_USERNAME` and `FAKER_BLUE_ADMIN_PASSWORD`, then sets the password guests will use. Set the host's in-game display name with `FAKER_BLUE_ADMIN_NICKNAME` (defaults to `호스트`). Guests sign in with that password and a display nickname. The nickname is not used as a credential.

The backend is API only: authentication uses `/api/auth/*`, game state uses `/api/game`, the leaderboard uses `/api/leaderboard`, and real-time game events use `/ws`. Its `status`, `players`, and `leaderboard` fields use matching Java and TypeScript models.

Set the host credentials in the repository-root `.env` file. Start by copying `.env.example`, then replace the example password:

```powershell
Copy-Item .env.example .env
Set-Location backend
.\gradlew.bat bootRun
```

Both local Spring Boot and Docker Compose read `FAKER_BLUE_ADMIN_USERNAME`, `FAKER_BLUE_ADMIN_PASSWORD`, and `FAKER_BLUE_ADMIN_NICKNAME` from this `.env` file. It is excluded from Git; use `.env.example` as the shareable template.

## Run locally

Start the backend using the host credential setup above.

Install and start the frontend from another terminal:

```powershell
Set-Location frontend
pnpm install
pnpm start
```

The Vite development server proxies `/api` requests to the backend at `http://localhost:8080`.

## Run with Docker

From the repository root:

```powershell
docker compose up --build -d
```

Open `http://localhost:8080`. Stop the services with `docker compose down`.

## Frontend checks

```powershell
Set-Location frontend
pnpm lint
pnpm format:check
pnpm build
```
