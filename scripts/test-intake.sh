#!/usr/bin/env bash
set -euo pipefail

env_file="${ENV_FILE:-.env}"
case_id="${1:-ffaa412c-a397-4368-b267-2b8c04720326}"

if [[ ! -f "$env_file" ]]; then
  printf 'Environment file not found: %s\n' "$env_file" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

: "${SUPABASE_URL:?SUPABASE_URL is not set in ${env_file}}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is not set in ${env_file}}"

curl --fail-with-body --silent --show-error \
  "${SUPABASE_URL%/}/functions/v1/intake" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  --data "{\"case_id\":\"${case_id}\"}"
printf '\n'
