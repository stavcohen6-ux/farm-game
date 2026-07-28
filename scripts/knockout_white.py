#!/usr/bin/env python3
"""Edge flood-fill knockout of near-white backgrounds to true alpha."""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image

# Near-white / cream canvas tolerance
THRESH = 238


def is_bg(r: int, g: int, b: int, a: int) -> bool:
  if a < 8:
    return True
  return r >= THRESH and g >= THRESH and b >= THRESH


def knockout(src: Path, dst: Path) -> None:
  im = Image.open(src).convert('RGBA')
  pixels = im.load()
  w, h = im.size
  visited = [[False] * h for _ in range(w)]
  q: deque[tuple[int, int]] = deque()

  def try_enqueue(x: int, y: int) -> None:
    if x < 0 or y < 0 or x >= w or y >= h or visited[x][y]:
      return
    r, g, b, a = pixels[x, y]
    if not is_bg(r, g, b, a):
      return
    visited[x][y] = True
    q.append((x, y))

  for x in range(w):
    try_enqueue(x, 0)
    try_enqueue(x, h - 1)
  for y in range(h):
    try_enqueue(0, y)
    try_enqueue(w - 1, y)

  while q:
    x, y = q.popleft()
    pixels[x, y] = (0, 0, 0, 0)
    try_enqueue(x + 1, y)
    try_enqueue(x - 1, y)
    try_enqueue(x, y + 1)
    try_enqueue(x, y - 1)

  dst.parent.mkdir(parents=True, exist_ok=True)
  im.save(dst, 'PNG')
  print(f'knockout: {src.name} -> {dst}')


def main() -> None:
  if len(sys.argv) < 3:
    print('usage: knockout_white.py <src> <dst> [src dst ...]')
    sys.exit(1)
  args = sys.argv[1:]
  if len(args) % 2 != 0:
    print('pairs of src dst required')
    sys.exit(1)
  for i in range(0, len(args), 2):
    knockout(Path(args[i]), Path(args[i + 1]))


if __name__ == '__main__':
  main()
