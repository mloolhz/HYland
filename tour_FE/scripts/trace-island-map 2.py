"""Trace island polygons from island-explorer-map.png (image-derived, not hand-guessed)."""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "public" / "island-explorer-map.png"
OUT = ROOT / "src" / "components" / "island" / "island-map-traced.json"

ISLAND_SEEDS: dict[str, tuple[int, int]] = {
    "yeonp": (128, 58),
    "baek": (98, 148),
    "daech": (172, 198),
    "gangh": (538, 118),
    "gyo": (478, 108),
    "seok": (578, 118),
    "jang": (448, 278),
    "sinsi": (518, 302),
    "yeongj": (808, 268),
    "muui": (728, 338),
    "yheung": (818, 512),
    "jawol": (442, 492),
    "seungb": (548, 518),
    "ijak": (622, 498),
    "deokj": (248, 388),
    "soya": (328, 458),
    "mungap": (252, 478),
    "gureop": (202, 458),
}


def is_land(r: int, g: int, b: int) -> bool:
    return g > 95 and g > r + 18 and g > b + 8 and r < 210


def label_components(mask: list[list[bool]]) -> list[set[tuple[int, int]]]:
    h = len(mask)
    w = len(mask[0])
    seen = [[False] * w for _ in range(h)]
    components: list[set[tuple[int, int]]] = []

    for y in range(h):
        for x in range(w):
            if not mask[y][x] or seen[y][x]:
                continue
            comp: set[tuple[int, int]] = set()
            q: deque[tuple[int, int]] = deque([(x, y)])
            seen[y][x] = True
            comp.add((x, y))
            while q:
                cx, cy = q.popleft()
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        comp.add((nx, ny))
                        q.append((nx, ny))
            if len(comp) >= 60:
                components.append(comp)
    return components


def boundary_ring(comp: set[tuple[int, int]]) -> list[tuple[int, int]]:
    if not comp:
        return []
    min_x = min(x for x, _ in comp)
    start = min((x, y) for x, y in comp if x == min_x)
    ring = [start]
    x, y = start
    dirs = [(1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, -1)]
    prev_dir = 0
    for _ in range(20000):
        for i in range(8):
            d = (prev_dir + i) % 8
            dx, dy = dirs[d]
            nx, ny = x + dx, y + dy
            if (nx, ny) in comp:
                x, y = nx, ny
                prev_dir = (d + 6) % 8
                if (x, y) == start and len(ring) > 2:
                    return ring
                ring.append((x, y))
                break
        else:
            break
    return ring


def simplify_ring(ring: list[tuple[int, int]], step: int = 4) -> list[tuple[int, int]]:
    if len(ring) <= 8:
        return ring
    out = [ring[0]]
    for pt in ring[1:]:
        lx, ly = out[-1]
        if abs(pt[0] - lx) + abs(pt[1] - ly) >= step:
            out.append(pt)
    return out


def to_path(ring: list[tuple[int, int]]) -> str:
    if len(ring) < 3:
        return ""
    pts = ring[:-1] if ring[0] == ring[-1] else ring
    x0, y0 = pts[0]
    return " ".join([f"M{x0} {y0}"] + [f"L{x} {y}" for x, y in pts[1:]] + ["Z"])


def centroid(comp: set[tuple[int, int]]) -> tuple[float, float]:
    n = len(comp)
    return sum(x for x, _ in comp) / n, sum(y for _, y in comp) / n


def main() -> None:
    img = Image.open(IMAGE).convert("RGB")
    w, h = img.size
    px = img.load()
    mask = [[is_land(*px[x, y]) for x in range(w)] for y in range(h)]
    components = label_components(mask)

    meta = []
    for idx, comp in enumerate(components):
        cx, cy = centroid(comp)
        meta.append((idx, cx, cy, len(comp)))

    assigned: dict[str, int] = {}
    used: set[int] = set()

    for island_id, (sx, sy) in ISLAND_SEEDS.items():
        containing = [idx for idx, comp in enumerate(components) if (sx, sy) in comp]
        if containing:
            best = containing[0]
            best_dist = 0
        else:
            best = None
            best_dist = 10**9
            for idx, cx, cy, size in meta:
                if idx in used:
                    continue
                dist = (cx - sx) ** 2 + (cy - sy) ** 2
                if dist < best_dist:
                    best_dist = dist
                    best = idx
        if best is not None and (containing or best_dist < 120**2):
            assigned[island_id] = best
            used.add(best)

    # Merge nearby small blobs into sinsi
    if "sinsi" in assigned:
        base = components[assigned["sinsi"]]
        for idx, cx, cy, size in meta:
            if idx in used or size > 800:
                continue
            if 480 < cx < 560 and 285 < cy < 325:
                base = base | components[idx]
                used.add(idx)
        components[assigned["sinsi"]] = base

    paths: dict[str, str] = {}
    boats: dict[str, dict[str, int]] = {}
    for island_id, idx in assigned.items():
        ring = simplify_ring(boundary_ring(components[idx]), 4)
        path = to_path(ring)
        if path:
            paths[island_id] = path
            cx, cy = centroid(components[idx])
            boats[island_id] = {"x": round(cx), "y": round(cy)}
            print(island_id, "OK", len(ring))
        else:
            print(island_id, "EMPTY")

    for island_id in ISLAND_SEEDS:
        if island_id not in paths:
            print(island_id, "MISSING")

    OUT.write_text(json.dumps({"paths": paths, "boats": boats}, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
