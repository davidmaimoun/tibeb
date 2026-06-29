// The stops of the 14-day Grand Circuit, in journey order. Each `key` maps to
// translations under `places.items.<key>.{name,description,region}` and to a
// local image at /public/images/places/<key>.jpg. `days` ties the stop to the
// itinerary (see src/features/content/trip.ts).

export type Place = {
  key: string;
  image: string;
  days: string; // day range within the circuit
};

const entries: { key: string; days: string }[] = [
  { key: "addis", days: "1 & 14" },
  { key: "lalibela", days: "2" },
  { key: "gondar", days: "3" },
  { key: "simien", days: "4–5" },
  { key: "omo", days: "6–10" },
  { key: "danakil", days: "11–13" },
];

export const places: Place[] = entries.map((e) => ({
  key: e.key,
  days: e.days,
  image: `/images/places/${e.key}.jpg`,
}));