# Crow-mate

Plateforme de gestion de rosters Overwatch pour managers.

## Stack

Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Better Auth · Tailwind CSS · Zod

## Démarrer

```bash
cp .env.example .env
# renseigner BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d
npx prisma db push
npm run dev
```

Compte : inscription manager sur `/register`. Seuls les rôles Manager et Admin accèdent à `/manage` et au CRUD de **leurs** équipes.
