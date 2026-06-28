import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { locales } from "@/i18n/config";

// Auto-discovered gallery. Drop AS MANY images as you want into
// public/images/gallery/ — they all show up, sorted naturally (1, 2, … 10).
//
// LOCALE-RESTRICTED PHOTOS:
// A file named "<locale>_<anything>.jpg" only appears for that locale.
// e.g. "he_g1.jpg" shows ONLY in the Hebrew gallery (useful to keep photos with
// the Israeli flag out of the other languages). In other locales it's skipped,
// and the remaining photos simply fill its place.
// Files without a known locale prefix (g1.jpg, IMG-1234.jpg…) appear everywhere.

export type GalleryImage = {
  id: string;
  src: string;
};

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const LOCALE_PREFIX = /^([a-z]{2})_/i;
const KNOWN = locales as readonly string[];

export const getGalleryImages = cache((locale?: string): GalleryImage[] => {
  let files: string[];
  try {
    files = fs
      .readdirSync(GALLERY_DIR)
      .filter((f) => IMAGE_EXT.test(f) && !f.startsWith("."));
  } catch {
    return []; // folder missing or empty
  }

  files = files.filter((file) => {
    const m = file.match(LOCALE_PREFIX);
    if (m && KNOWN.includes(m[1].toLowerCase())) {
      // restricted to that locale only
      return locale === m[1].toLowerCase();
    }
    return true; // universal photo
  });

  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return files.map((file) => ({
    id: file.replace(IMAGE_EXT, ""),
    src: `/images/gallery/${file}`,
  }));
});