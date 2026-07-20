#!/usr/bin/env bash
# ============================================================================
# Verifikasi header keamanan pada situs yang sudah live.
#
#   ./scripts/cek-headers.sh https://titiklapor.example.id
#
# Keluar dengan kode 1 bila ada header wajib yang hilang, sehingga bisa
# dipakai sebagai langkah smoke test di pipeline deploy.
# ============================================================================
set -uo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Pakai: $0 <url>" >&2
  exit 2
fi

WAJIB=(
  "strict-transport-security"
  "content-security-policy"
  "x-frame-options"
  "x-content-type-options"
  "referrer-policy"
  "permissions-policy"
)

echo "Memeriksa $URL"
echo "──────────────────────────────────────────────────────────────"

RESPON=$(curl -sS -D - -o /dev/null "$URL") || { echo "Gagal menghubungi $URL" >&2; exit 1; }
HEADER=$(echo "$RESPON" | tr '[:upper:]' '[:lower:]')

GAGAL=0
for h in "${WAJIB[@]}"; do
  if NILAI=$(echo "$HEADER" | grep -i "^$h:" | head -1); then
    if [[ -n "$NILAI" ]]; then
      printf '  ✓ %-28s %s\n' "$h" "$(echo "${NILAI#*: }" | cut -c1-60)"
      continue
    fi
  fi
  printf '  ✗ %-28s TIDAK ADA\n' "$h"
  GAGAL=1
done

# Header yang justru sebaiknya tidak ada.
for h in "server" "x-powered-by"; do
  if echo "$HEADER" | grep -qi "^$h:"; then
    printf '  ! %-28s sebaiknya disembunyikan\n' "$h"
  fi
done

echo "──────────────────────────────────────────────────────────────"
if [[ $GAGAL -eq 0 ]]; then
  echo "Semua header wajib terpasang."
else
  echo "Ada header wajib yang belum terpasang." >&2
fi
exit $GAGAL
