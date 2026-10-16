#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  printf 'Usage: %s <case-id>\n' "$0" >&2
  exit 1
fi

case_id="$1"
supabase_url="${SUPABASE_URL:-https://puntmnbcyuuuvqkyxiej.supabase.co}"

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  printf 'SUPABASE_SERVICE_ROLE_KEY is empty or not set\n' >&2
  exit 1
fi

printf 'Using service role key with length %d\n' "${#SUPABASE_SERVICE_ROLE_KEY}"

curl --silent --show-error --write-out "\nHTTP %{http_code}\n" \
  "${supabase_url%/}/functions/v1/intake" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  --data "{\"case_id\":\"${case_id}\"}"
