# Tibeb — ጥበብ

Site vitrine + plateforme de réservation pour un guide touristique en Éthiopie.
Multilingue (he / en / am / fr, RTL pour l'hébreu), avec un espace admin
responsive où le guide met à jour ses disponibilités et gère les demandes.

## Stack

- **Next.js 15** (App Router, Server Actions) + **TypeScript**
- **Tailwind CSS v4** (tokens dans `globals.css`)
- **Prisma** + **MongoDB**
- **next-intl v4** (i18n + routing par locale)
- **Auth.js v5** (login admin, provider credentials)
- **react-day-picker v9** (calendriers)

Pas de backend séparé : les Server Actions jouent ce rôle. Build `standalone`
prêt pour PM2 + nginx.

## Démarrage

```bash
# 1. Dépendances
npm install

# 2. Variables d'env
cp .env.example .env
# génère un secret :
openssl rand -base64 32        # → colle dans AUTH_SECRET
# renseigne DATABASE_URL (une base dédiée sur ton Mongo existant)
# renseigne NEXT_PUBLIC_WHATSAPP et NEXT_PUBLIC_CONTACT_EMAIL

# 3. Schéma + données de départ
npm run db:push                # pousse le schéma vers MongoDB
npm run seed                   # crée l'admin + 20 jours dispo

# 4. Dev
npm run dev                    # http://localhost:3000  → redirige vers /he
```

Admin de démo (à changer) : `guide@example.com` / `changeme123`
→ `http://localhost:3000/he/admin/login`

Tu peux personnaliser l'admin du seed via les env `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` avant de lancer `npm run seed`.

## Production

```bash
npm run build                  # prisma generate + next build (standalone)
# .env en production, puis :
node .next/standalone/server.js   # ou via PM2
```

Sous PM2, sers `.next/standalone` et copie `.next/static` + `public` à côté
(comme pour tes autres déploiements Next standalone).

## Architecture (pensée pour grandir)

```
src/
  i18n/         config locales + routing + navigation (ajoute une langue ici)
  messages/     tout le texte traduisible (hero, bio, lieux…) — pas en BDD
  lib/          db (Prisma), auth (Auth.js), utils, auth-guard
  features/     logique métier par domaine :
    content/    données structurées (guide, lieux, galerie) — texte via i18n
    availability/ actions + schéma (lecture publique, écriture admin)
    booking/    actions + schéma (création publique, statuts admin)
  components/
    ui/         primitives (Button, Section, Container, LanguageSwitcher)
    layout/     Header, Footer
    sections/   blocs de la landing
    admin/      AvailabilityManager, BookingsTable
  app/[locale]/ pages (landing, gallery, admin)
```

**Principe** : le contenu de présentation (textes du hero, bio, descriptions
des lieux) vit dans `messages/<locale>.json` — traduisible et modifiable sans
toucher à la base. Seul le **dynamique** (dispos, réservations, admin) est en
MongoDB.

### Ajouter une langue
1. `src/i18n/config.ts` → ajoute le code dans `locales` (+ `rtlLocales` si RTL).
2. Crée `src/messages/<code>.json` (copie `en.json`, traduis).
3. C'est tout : routing, switcher et `<html dir/lang>` se mettent à jour seuls.

### Ajouter un lieu
`src/features/content/places.ts` (clé + image) puis la clé correspondante dans
chaque `messages/<locale>.json` sous `places.items.<clé>`.

### Personnaliser le thème (tu changeras souvent)

Tout vit dans **`src/app/[locale]/theme.css`**, en deux niveaux :

1. **`:root`** — les ~13 couleurs brutes (palette drapeau : vert / jaune / rouge).
   C'est le **seul bloc à éditer**. Une palette alternative est fournie en
   commentaire (décommente pour tester).
2. **`@theme`** — les rôles sémantiques (`primary`, `secondary`, `accent`,
   `ink`, `cream`, `surface`…) mappés sur les couleurs brutes.

Les composants n'utilisent **que** les rôles (`bg-primary`, `text-ink`…), donc
changer un hex dans `:root` retune tout le site sans toucher à un seul composant.
La barre tricolore et le dégradé du hero se mettent à jour automatiquement.

## Vols vers l'Éthiopie (panneau « Voir les vols »)

Dans la section *Plan a trip*, un bouton ouvre un panneau latéral (sans quitter
la page) qui pré-remplit la date choisie et lance une recherche vers Addis-Abeba
(ADD). **Honnêteté technique** : Google Flights **n'est pas intégrable en
iframe** (X-Frame-Options) et n'a pas de widget officiel — le panneau ouvre donc
Google Flights dans un nouvel onglet. Pour garder l'utilisateur **sur le site**
(et toucher une commission), remplace le lien par un **widget d'affiliation**
embarquable (Skyscanner / Travelpayouts) : le slot iframe est déjà préparé en
commentaire dans `components/sections/FlightsPanel.tsx`.

## Flux de réservation
Actuellement **manuel** : le client choisit un jour libre → demande `PENDING`
→ le guide confirme/refuse depuis l'admin. La confirmation marque le jour
`BOOKED`, le refus le relibère.

Le schéma Prisma contient déjà `amount` et `paid` : pour **automatiser le
paiement** plus tard, branche un webhook (Grow/PayPal/Stripe) qui appelle
`setBookingStatus(id, "CONFIRMED")` après paiement. Le reste de l'architecture
ne bouge pas.

## À faire avant la mise en ligne

- [ ] **Faire relire les traductions amharique (`am.json`) et hébreu (`he.json`)
      par un locuteur natif** — produites avec soin mais à valider.
- [ ] Remplacer les images Unsplash (placeholders) par de vraies photos.
      Ajoute tes domaines d'images dans `next.config.ts` (`remotePatterns`) ou
      dépose-les dans `public/images/`.
- [ ] Changer le mot de passe admin par défaut.
- [ ] Brancher une vraie notification (email/WhatsApp) à la création d'une
      demande — voir le `TODO(notify)` dans `features/booking/actions.ts`.

## Notes

Le scaffold n'a pas été installé/buildé dans l'environnement de génération
(les binaires Prisma ne s'y téléchargent pas). Si `npm install` ou `db:push`
remontent un souci d'environnement, c'est côté machine, pas côté code.
