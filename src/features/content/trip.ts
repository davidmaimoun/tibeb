// Trips catalog. Today there is one (the 14-day grand circuit), but everything
// is keyed by `code` so you can add more trips later without touching the UI:
// just append to TRIPS and they appear in the admin email selector.

export type PriceTier = { min: number; max: number; perPerson: number };

export type Trip = {
  code: string;
  title: string;
  blurb: string;
  days: { d: number; t: string; x: string }[];
  includes: string[];
  excludes: string[];
  pricing: PriceTier[];
  depositPct: number;
};

const grand14: Trip = {
  code: "grand-14",
  title: "14-Day Grand Ethiopia Circuit",
  blurb:
    "North (Lalibela, Gondar, Simien), the Danakil Depression (Erta Ale & Dallol), and the South Omo tribes — the full Ethiopia, end to end.",
  days: [
    { d: 1, t: "Arrival in Addis Ababa", x: "Airport pickup, hotel check-in, evening of traditional music & dinner at Yod Abyssinia." },
    { d: 2, t: "Addis → Lalibela", x: "Fly to Lalibela; visit the famous rock-hewn churches (first, second & third groups)." },
    { d: 3, t: "Lalibela → Gondar", x: "Fly to Gondar; Fasilides castle, the royal baths, and Debre Birhan Selassie church." },
    { d: 4, t: "Gondar → Simien Mountains", x: "Drive into the Simien NP; gelada baboons along the escarpment, Jinbar waterfall, night at Simien Lodge." },
    { d: 5, t: "Simien → Gondar → Addis", x: "Morning walk in the park, drive to Gondar, fly back to Addis." },
    { d: 6, t: "Addis → Arba Minch", x: "Fly south; Lake Chamo boat trip (crocodiles & hippos), visit the Dorze weavers' village." },
    { d: 7, t: "Arba Minch → Konso → Turmi", x: "UNESCO Konso terraces & fortified village, then on to Hamer country." },
    { d: 8, t: "Turmi — Kara & Nyangatom", x: "Body-painting Kara tribe by the Omo, Nyangatom, and the colorful Hamer market." },
    { d: 9, t: "Dassanech → Benna → Ari (Jinka)", x: "Cross the Omo to the Dassanech, a Benna market, Ari blacksmiths/potters, Jinka museum." },
    { d: 10, t: "Jinka → Mursi → Addis", x: "The Mursi (lip-plate) in Mago NP, then afternoon flight back to Addis." },
    { d: 11, t: "Addis → Semera → Erta Ale", x: "Fly to Semera, drive into the Danakil; night trek to the Erta Ale lava lake, open-air camping." },
    { d: 12, t: "Erta Ale → Ahmed Ila", x: "Sunrise at the volcano, cross the Danakil to the sulphur springs; desert camping." },
    { d: 13, t: "Dallol → Mekelle → Addis", x: "Salt flats of Lake Asale, camel caravans, the Dallol mineral fields, fly back to Addis from Mekelle." },
    { d: 14, t: "Addis city tour & departure", x: "National Museum, Merkato, Entoto viewpoint, then airport drop-off." },
  ],
  includes: [
    "3- and 4-star hotels (standard)",
    "All domestic flights",
    "Comfortable A/C tourist vehicle, fuel & experienced driver",
    "All entrance & village fees",
    "Guide services (and scouts where required)",
    "Boat trips and tribe photo permissions",
    "3 meals a day & plenty of mineral water",
    "All trekking & camping gear (tents, sleeping bags, mattresses, cook & food, mules where needed)",
  ],
  excludes: ["International flights", "Tips", "Alcohol", "Personal expenses (shopping, laundry)"],
  pricing: [
    { min: 2, max: 6, perPerson: 2800 },
    { min: 7, max: 12, perPerson: 2600 },
    { min: 13, max: 80, perPerson: 2400 },
  ],
  depositPct: 30,
};

export const TRIPS: Trip[] = [grand14];
export const DEFAULT_TRIP_CODE = grand14.code;

export function getTrip(code?: string | null): Trip {
  return TRIPS.find((t) => t.code === code) ?? TRIPS[0];
}

export type Quote = {
  perPerson: number;
  people: number;
  total: number;
  deposit: number;
  balance: number;
  depositPct: number;
};

export function priceFor(trip: Trip, people: number): Quote {
  const n = Math.max(2, Math.min(80, Math.round(people || 2)));
  const tier =
    trip.pricing.find((t) => n >= t.min && n <= t.max) ??
    trip.pricing[trip.pricing.length - 1];
  const total = tier.perPerson * n;
  const deposit = Math.round((total * trip.depositPct) / 100);
  return {
    perPerson: tier.perPerson,
    people: n,
    total,
    deposit,
    balance: total - deposit,
    depositPct: trip.depositPct,
  };
}

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;