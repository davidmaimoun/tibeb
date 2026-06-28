// Guide profile. Editable facts live here; translatable copy (name, bio,
// taglines) lives under `guide.*` in the message files.

export const guideProfile = {
  photo: "/images/guide.jpg", // drop a portrait in public/images/
  yearsExperience: 8,
  toursCompleted: 320,
  languagesSpoken: ["am", "en", "fr", "he"] as const,
  // Areas/specialties — labels resolved via t(`guide.specialties.${key}`)
  specialties: ["history", "trekking", "coffee", "photography"] as const,
};

export type GuideProfile = typeof guideProfile;
