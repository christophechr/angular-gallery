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

## Déploiement Docker sur un VPS

Le workflow `.github/workflows/deploy-vps.yml` construit l’image SSR, la publie dans `ghcr.io/<propriétaire>/<dépôt>` avec le SHA du commit, puis déploie son digest exact par SSH. Il démarre à chaque push sur `main`, ou manuellement depuis Actions sur `main`. Les déploiements sont sérialisés. Les actions Docker suivent la [documentation officielle](https://docs.docker.com/guides/gha/).

Préparer un VPS Linux **amd64** avec Docker installé et actif, Bash et un utilisateur SSH pouvant exécuter Docker sans `sudo`. Installer sa clé publique dans `~/.ssh/authorized_keys`. Si le VPS est ARM64, remplacer `linux/amd64` par `linux/arm64` dans le workflow.

Dans GitHub, créer l’environnement `production` (Settings → Environments), puis ajouter ces secrets à cet environnement :

| Secret | Valeur |
| --- | --- |
| `VPS_HOST` | Adresse IP ou nom DNS du VPS |
| `VPS_USER` | Utilisateur SSH |
| `VPS_SSH_KEY` | Clé privée SSH dédiée, sans phrase de passe |
| `VPS_KNOWN_HOSTS` | Ligne(s) OpenSSH `known_hosts` du VPS, avec empreinte vérifiée auprès du fournisseur ou depuis la console du VPS |

Ajouter aussi les variables de l’environnement :

| Variable | Valeur |
| --- | --- |
| `SSR_ALLOWED_HOSTS` | Obligatoire : domaine(s) public(s), séparés par des virgules, sans protocole ni port |
| `VPS_SSH_PORT` | Facultatif : `22` par défaut |
| `APP_PORT` | Facultatif : `4000` par défaut |

Pour obtenir la ligne `known_hosts`, utiliser `ssh-keyscan -p 22 <VPS_HOST>`, puis vérifier son empreinte avant de la copier. Pour un port personnalisé, conserver la forme `[hôte]:port` produite par la commande.

Le `GITHUB_TOKEN` fourni automatiquement au workflow sert à publier et tirer l’image, y compris privée : aucun token GHCR permanent n’est nécessaire sur le VPS. Si le package GHCR existe déjà, accorder au dépôt l’accès au package dans ses paramètres « Manage Actions access ».

Configurer Nginx, Caddy ou un autre reverse proxy sur le VPS pour terminer HTTPS et transmettre les requêtes à `127.0.0.1:4000` (ou `APP_PORT`), en conservant le nom d’hôte public. Le conteneur n’est accessible que depuis le VPS. L’image s’exécute avec l’utilisateur Node non privilégié.

Le script `scripts/deploy-vps.sh` télécharge l’image avant d’arrêter le conteneur courant. Il attend que le contrôle HTTP local réussisse ; en cas d’échec du démarrage ou du contrôle de santé, il redémarre le conteneur précédent et fait échouer le workflow. Une brève interruption a lieu lors du remplacement. Ce contrôle valide le serveur local ; vérifier aussi le domaine HTTPS après le premier déploiement.

Pour tester l’image localement :

```sh
docker build -t angular-gallery .
docker run --rm -p 127.0.0.1:4000:4000 angular-gallery
```

## Nouveau design

La version ordinateur reprend le dernier modèle fourni : accents chauds, carte Trellotech mise en avant, reflets au survol et révélations progressives. Ces effets sont adaptés aux cartes mobiles. Les révélations sont initialisées après hydratation ; le HTML SSR reste visible sans JavaScript. Les préférences de réduction du mouvement désactivent les effets.
