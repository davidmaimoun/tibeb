// Headline destinations. Each `key` maps to translations under
// `places.items.<key>.{name,description,region}` AND to a local image at
// /public/images/places/<key>.jpg. To add one: add an entry here, the matching
// i18n keys, and drop a photo in public/images/places/.

export type Place = {
  key: string;
  image: string;
  featured?: boolean;
};

const keys = ["lalibela", "simien", "danakil", "omo", "gondar", "addis"];

export const places: Place[] = keys.map((key, i) => ({
  key,
  image: `/images/places/${key}.jpg`,
  featured: i < 2,
}));
