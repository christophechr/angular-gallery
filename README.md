# Galerie Angular

Prototype Angular 20 basé sur le HTML fourni. Identité et contenus du modèle à personnaliser.

```sh
pnpm install
pnpm start
```

Ouvrir http://localhost:4200. Production : `pnpm build`, sortie dans `dist/gallery/browser`.

Navigation, barre d’onglets mobile et dialogues accessibles avec fermeture par Échap. Trellotech ouvre les dépôts de son organisation GitHub, Aether une note enregistrée dans le navigateur et Vortex une forme animée réglable. Démonstrations interactives côté navigateur ; le serveur Node assure le rendu HTML initial. Photos et polices externes conservées du modèle ; connexion nécessaire. Tailwind compilé localement sans script CDN.

Vérification des interactions (serveur lancé) : `pnpm exec playwright install chromium`, puis `pnpm exec playwright test`.

## Responsive

Le modèle mobile fourni est utilisé sous 1024 px : en-tête compact, navigation inférieure avec zones sûres et cartes à actions pleine largeur. Sur tablette, la galerie passe à deux colonnes ; sur ordinateur, la composition initiale est conservée. Le zoom reste disponible. Vérifications aux largeurs 320, 390, 768, 1024 et 1440 px.

## Rendu côté serveur (SSR)

`pnpm dev` lance le serveur de développement Angular. Pour exécuter la production :

```sh
pnpm build
pnpm serve:ssr
```

Ouvrir http://localhost:4000. Le port peut être défini par la variable `PORT`. Déployer les sorties `dist/gallery/browser` et `dist/gallery/server` sur un hébergement Node.js ; servir uniquement le dossier navigateur ne fournit pas le SSR.

Toutes les routes utilisent `RenderMode.Server` : le HTML est généré à chaque requête, puis hydraté dans le navigateur avec rejeu des événements. Les notes locales sont chargées après le premier rendu navigateur, sans accès à `localStorage` côté serveur.

Le composant est dans `src/app.ts`, la configuration partagée dans `src/app.config.ts`, le démarrage navigateur dans `src/main.ts`, le démarrage Angular serveur dans `src/main.server.ts` et le serveur HTTP dans `src/server.ts`.

Tests sur le serveur de production lancé : `TEST_BASE_URL=http://127.0.0.1:4000 pnpm exec playwright test`. Ils vérifient le HTML sans JavaScript, l’hydratation, les notes locales et les cinq largeurs d’écran.

En production, définir `SSR_ALLOWED_HOSTS` avec les noms de domaines autorisés, séparés par des virgules (sans protocole ni port), par exemple `SSR_ALLOWED_HOSTS=galerie.example.com pnpm serve:ssr`. Les hôtes locaux sont autorisés par défaut.

## Nouveau design

La version ordinateur reprend le dernier modèle fourni : accents chauds, carte Trellotech mise en avant, reflets au survol et révélations progressives. Ces effets sont adaptés aux cartes mobiles. Les révélations sont initialisées après hydratation ; le HTML SSR reste visible sans JavaScript. Les préférences de réduction du mouvement désactivent les effets.
