#!/usr/bin/env python3
"""
Compresse toutes les images d'un dossier vers un AUTRE dossier.

Usage :
    pip install pillow
    python compress-images.py <dossier_source> [dossier_sortie]

Exemples :
    python compress-images.py raw                 # -> raw_compressed/
    python compress-images.py ~/photos ./public/images/gallery

- Conserve les sous-dossiers.
- Redimensionne à MAX px (côté le plus long), compresse en JPEG.
- Refuse de tourner si la sortie est égale ou à l'intérieur de la source
  (c'est ce qui provoquait la boucle infinie).
"""

import sys
from pathlib import Path
from PIL import Image, ImageOps

MAX = 1600      # côté le plus long, en pixels
QUALITY = 82    # 0-95 ; baisse pour plus léger, monte pour plus net

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".gif", ".heic"}


def main():
    if len(sys.argv) < 2:
        print("Usage : python compress-images.py <dossier_source> [dossier_sortie]")
        sys.exit(1)

    src = Path(sys.argv[1]).expanduser().resolve()
    dst = (
        Path(sys.argv[2]).expanduser().resolve()
        if len(sys.argv) > 2
        else src.parent / f"{src.name}_compressed"
    )

    if not src.is_dir():
        print(f"Source introuvable : {src}")
        sys.exit(1)

    # Sécurité : empêche la boucle (sortie == source ou sortie DANS la source).
    if dst == src or src in dst.parents:
        print("✗ Le dossier de sortie ne peut pas être la source ni un sous-dossier.")
        print(f"  source : {src}")
        print(f"  sortie : {dst}")
        print("  Choisis un dossier de sortie séparé.")
        sys.exit(1)

    dst.mkdir(parents=True, exist_ok=True)

    count = skipped = 0
    for p in sorted(src.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in EXTS:
            continue
        out = (dst / p.relative_to(src)).with_suffix(".jpg")
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
            im.thumbnail((MAX, MAX))
            im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            print(f"✓ {out.relative_to(dst)}  ({im.width}x{im.height})")
            count += 1
        except Exception as e:
            print(f"✗ {p.name} — ignoré ({e})")
            skipped += 1

    print(f"\n{count} image(s) compressée(s) dans : {dst}")
    if skipped:
        print(f"{skipped} fichier(s) ignoré(s).")


if __name__ == "__main__":
    main()