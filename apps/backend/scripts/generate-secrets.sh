#!/bin/sh
set -eu

if ! command -v openssl >/dev/null 2>&1; then
  printf 'OpenSSL is required to generate secrets.\n' >&2
  exit 1
fi

access_token_secret=$(openssl rand -hex 32)
email_code_secret=$(openssl rand -hex 32)

printf 'ACCESS_TOKEN_SECRET=%s\n' "$access_token_secret"
printf 'EMAIL_CODE_SECRET=%s\n' "$email_code_secret"
