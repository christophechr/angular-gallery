# HTTPS sur le VPS

Configuration prévue pour **Nginx installé sur le VPS**, avec l’application Docker sur `127.0.0.1:4000`. Le même processus Nginx peut servir plusieurs domaines sur les ports 80 et 443. Ajouter ce site à sa configuration existante, sans démarrer un second Nginx ni utiliser le port 8080.

Le certificat fourni couvre `christophe-chhor.fr` et `*.christophe-chhor.fr`, du 8 octobre 2026 au 6 avril 2027. Le fichier local `certs/fullchain.pem` assemble le certificat du site, `intermediate1.cer`, puis `intermediate2.cer`, dans cet ordre conformément à la [documentation Nginx](https://nginx.org/en/docs/http/configuring_https_servers.html). Les fichiers du dossier `certs` sont exclus de Git.

## Prérequis

- Les enregistrements DNS de `christophe-chhor.fr` et `www.christophe-chhor.fr` doivent pointer vers le VPS.
- Les ports publics 80 et 443 doivent atteindre Nginx.
- Retrouver sur le VPS la **clé privée correspondant à la CSR de ce certificat**. Elle ne figure pas dans les fichiers fournis. Une nouvelle clé ne correspondrait pas au certificat. Ne pas la mettre dans Git ni dans le chat.
- Définir dans l’environnement GitHub `production` : `APP_PORT=4000` et `SSR_ALLOWED_HOSTS=christophe-chhor.fr,www.christophe-chhor.fr`.
- Si un autre port a été choisi, modifier aussi `proxy_pass` dans `nginx/christophe-chhor.fr.conf`.

## Installation

Depuis la racine du dépôt local, transférer les fichiers (remplacer utilisateur, hôte et port SSH) :

```sh
scp -P 22 deployment/certs/fullchain.pem deployment/nginx/christophe-chhor.fr.conf utilisateur@VPS:~/
```

Sur le VPS, installer le certificat et la clé privée existante (remplacer son chemin réel) :

```sh
sudo install -d -m 700 /etc/nginx/ssl/christophe-chhor.fr
sudo install -m 644 ~/fullchain.pem /etc/nginx/ssl/christophe-chhor.fr/fullchain.pem
sudo install -m 600 /chemin/vers/la/cle-privee-existante.key /etc/nginx/ssl/christophe-chhor.fr/privkey.pem
```

Vérifier que les deux empreintes de clé publique ci-dessous sont identiques :

```sh
openssl x509 -in /etc/nginx/ssl/christophe-chhor.fr/fullchain.pem -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256
sudo openssl pkey -in /etc/nginx/ssl/christophe-chhor.fr/privkey.pem -pubout -outform DER | openssl dgst -sha256
```

Pour une installation Debian/Ubuntu utilisant `sites-available` et `sites-enabled`, vérifier auparavant qu’aucun site existant ne déclare déjà ces domaines, puis installer :

```sh
sudo nginx -T 2>&1 | rg 'server_name.*christophe-chhor'
sudo install -m 644 ~/christophe-chhor.fr.conf /etc/nginx/sites-available/christophe-chhor.fr.conf
sudo ln -s /etc/nginx/sites-available/christophe-chhor.fr.conf /etc/nginx/sites-enabled/christophe-chhor.fr.conf
sudo nginx -t && sudo systemctl reload nginx
```

Si `rg` n’est pas installé, utiliser `grep` pour la recherche. Si Nginx charge uniquement `/etc/nginx/conf.d/*.conf`, installer le fichier dans ce dossier à la place, sans créer le lien symbolique.

## Vérification

Une fois l’application déployée :

```sh
curl -I http://127.0.0.1:4000
curl -I http://christophe-chhor.fr
curl -I https://christophe-chhor.fr
openssl s_client -connect christophe-chhor.fr:443 -servername christophe-chhor.fr -verify_return_error </dev/null
```

Attendre une redirection HTTP vers HTTPS, une réponse HTTPS réussie et une chaîne de confiance valide. Renouveler et réinstaller le certificat avant le **6 avril 2027**, puis tester et recharger Nginx.

Si Nginx est lui-même dans Docker, `127.0.0.1` désigne son propre conteneur : cette configuration devra être adaptée au réseau Docker et aux volumes des certificats avant installation.
