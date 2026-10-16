#!/usr/bin/env bash
set -euo pipefail

if ! curl -sI https://esm.sh | head -1; then
  printf 'Network cannot reach esm.sh, fix the network first\n' >&2
  exit 1
fi

supabase functions deploy intake --project-ref puntmnbcyuuuvqkyxiej --use-api --no-verify-jwt
supabase functions list --project-ref puntmnbcyuuuvqkyxiej
secrets_output="$(supabase secrets list --project-ref puntmnbcyuuuvqkyxiej --output json)"
secret_names="$(
  printf '%s\n' "$secrets_output" |
    grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' |
    sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/' || true
)"
printf 'Configured secret names:\n%s\n' "$secret_names"

if ! grep -q '^GEMINI_API_KEY$' <<<"$secret_names"; then
  printf 'Reminder: run supabase secrets set GEMINI_API_KEY=...\n'
fi
