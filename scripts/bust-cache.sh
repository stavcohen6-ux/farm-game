#!/usr/bin/env bash
# Fingerprint src/**/*.js + style.css and rewrite index.html so Safari
# loads every module through a versioned import map (not just main.js).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f style.css || ! -d src || ! -f index.html ]]; then
  echo "bust-cache: run from farm-game repo root (missing style.css, src/, or index.html)" >&2
  exit 1
fi

TOKEN="$(
  {
    find src -type f -name '*.js' | LC_ALL=C sort | while IFS= read -r f; do
      cat "$f"
    done
    cat style.css
  } | shasum -a 256 | cut -c1-12
)"

IMPORTS="$(
  find src -type f -name '*.js' | LC_ALL=C sort | while IFS= read -r f; do
    printf '    "./%s": "./%s?v=%s",\n' "$f" "$f" "$TOKEN"
  done | sed '$ s/,$//'
)"

export BUST_TOKEN="$TOKEN"
export BUST_IMPORTS="$IMPORTS"

python3 <<'PY'
import os
import pathlib
import re
import sys

token = os.environ["BUST_TOKEN"]
imports = os.environ["BUST_IMPORTS"]
root = pathlib.Path.cwd()
index_path = root / "index.html"
html = index_path.read_text(encoding="utf-8")

assets = f"""  <link rel="stylesheet" href="style.css?v={token}" />
  <script type="importmap">
  {{
    "imports": {{
{imports}
    }}
  }}
  </script>"""

asset_block = (
    "  <!-- cache-bust:start -->\n"
    + assets
    + "\n  <!-- cache-bust:end -->"
)

if "<!-- cache-bust:start -->" in html and "<!-- cache-bust:end -->" in html:
    html = re.sub(
        r"  <!-- cache-bust:start -->.*?  <!-- cache-bust:end -->",
        asset_block,
        html,
        count=1,
        flags=re.DOTALL,
    )
else:
    html, n = re.subn(
        r'  <link rel="stylesheet" href="style\.css(?:\?v=[^"]*)?" />\n',
        asset_block + "\n",
        html,
        count=1,
    )
    if n != 1:
        print("bust-cache: could not find style.css link to replace", file=sys.stderr)
        sys.exit(1)

html, n = re.subn(
    r'<script type="module" src="src/main\.js(?:\?v=[^"]*)?"></script>',
    f'<script type="module" src="src/main.js?v={token}"></script>',
    html,
    count=1,
)
if n != 1:
    print("bust-cache: could not find main.js script tag", file=sys.stderr)
    sys.exit(1)

index_path.write_text(html, encoding="utf-8")
print(f"bust-cache: wrote index.html with token {token}")
PY
