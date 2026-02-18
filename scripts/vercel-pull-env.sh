#!/usr/bin/env bash
# Pull Vercel env vars (including DATABASE_URL) into .env.local.
# Run this after you've added a Postgres DB to your Vercel project (Storage or Marketplace).
# Requires: npm i -g vercel (or npx vercel), and be logged in (vercel login).

set -e
cd "$(dirname "$0")/.."

if ! command -v vercel &>/dev/null; then
  echo "Vercel CLI not found. Install: npm i -g vercel"
  echo "Then run: vercel login"
  exit 1
fi

echo "Linking project (if not already)..."
vercel link --yes 2>/dev/null || true

echo "Pulling env vars into .env.local..."
vercel env pull .env.local

if grep -q "DATABASE_URL" .env.local 2>/dev/null; then
  echo "Done. DATABASE_URL is in .env.local. Run: npx prisma migrate deploy && npm run dev"
else
  echo "No DATABASE_URL in .env.local yet."
  echo "Add a Postgres DB: https://vercel.com/ilakkmanoharans-projects → your project → Storage (or Marketplace) → add Postgres/Neon, then run this script again."
fi
