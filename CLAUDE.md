# GDB & Sons — tracker de portefeuille mobile

App React 18 en JSX compilée par esbuild, servie par GitHub Pages, adossée à un
worker Cloudflare qui fait proxy d'API et stockage KV.

`CHANGELOG_GDB_Sons.txt` est la source de vérité de l'historique : le lire avant
toute modification de fond. Il est tenu en français, groupé par « Discussion »,
les versions stables sont marquées ⭐.

## Fichiers

| Fichier | Rôle |
|---|---|
| `app.jsx` | **le source** — c'est ici qu'on modifie |
| `app.js` | bundle compilé, **c'est lui que charge `index.html`** |
| `seeds.js` | données de base figées |
| `index.html` | page + splash animé + cache-buster `?v=` |
| `cloudflare_worker_v*.js` | worker Cloudflare — **gitignoré**, contient des clés |
| `wrangler.toml` | config de déploiement du worker — **gitignoré** |

## Livrer une modification

Modifier `app.jsx` seul ne livre rien : `index.html` charge `app.js`.

1. Modifier `app.jsx`
2. Monter la version à **deux** endroits : `APP_VERSION` dans `app.jsx`, et
   `app.js?v=` dans `index.html` (la 3ᵉ occurrence, dans `app.js`, vient du build)
3. Construire :

   ```
   esbuild app.jsx --loader:.jsx=jsx --minify-whitespace --minify-syntax --target=es2017 --outfile=app.js
   ```

   Ne pas ajouter `--minify` : le bundle ne minifie **pas** les identifiants.
4. `node --check app.js`
5. Tester dans un vrai navigateur (voir ci-dessous)
6. Commit + push — autorisation permanente de pousser sans redemander

`node`, `esbuild` et `wrangler` sont installés globalement. Un shell ouvert avant
leur installation ne les a pas dans son `PATH` :
`$env:PATH = "$env:ProgramFiles\nodejs;$env:APPDATA\npm;$env:PATH"`

## Tester

Le panneau navigateur sert les pages `file://` comme des instantanés figés : les
modifications sur disque y sont invisibles. Passer par un serveur HTTP local
(un `System.Net.HttpListener` PowerShell sur `localhost` avec `Cache-Control:
no-store` suffit, aucune installation requise), puis piloter la page en JS.

- Depuis `localhost`, le worker refuse l'origine sur certaines routes : les
  graphes et cotations échouent, les données KV remontent quand même.
- Pour ouvrir un modal : `dispatchEvent(new MouseEvent('click',{bubbles:true}))`
  sur l'élément trouvé par son texte. Les clics simulés sélectionnent le texte
  au lieu de déclencher le tap.
- Pour savoir quel build tourne vraiment, lire la source de la fonction sur les
  props React du nœud DOM (`Object.keys(el).find(k=>k.startsWith('__reactProps$'))`) :
  bien plus fiable que le numéro de version affiché, qui peut venir d'un cache.
- Les gestes se testent avec de vrais `new Touch()` / `new TouchEvent()`.

## Worker Cloudflare

Format **service-worker** (`addEventListener`), pas ES modules : les bindings
sont des **variables globales** (`GDB_KV`, `AUTH_KEY`…), jamais `env.X`. Ne pas
« moderniser » sans réécrire les ~129 références à `GDB_KV`.

Déploiement : `wrangler deploy`. Vérifier ensuite `GET /ping` — il renvoie
`hasKV` et `hasAuth`.

Pièges :
- Un déploiement **remplace** les bindings par ceux déclarés. Les secrets font
  exception (Cloudflare les conserve) et ne doivent donc jamais figurer dans
  `wrangler.toml`. Les variables en clair, elles, doivent y être.
- **`AUTH_KEY` est volontairement absent de `wrangler.toml`.** C'est un secret.
  Le remettre sous `[vars]` le retransformerait en variable en clair et
  écraserait le secret au déploiement suivant.
- Le cron (`0 * * * *`) porte le pré-chauffage, la sauvegarde quotidienne et la
  newsletter. Il doit rester déclaré, sinon un déploiement le supprime.

## Authentification

L'app est un site **public** : tout ce qui est dans le bundle est lisible par
n'importe qui. Aucune clé ne doit donc y figurer — c'était la faille corrigée en
v28.86.

L'app demande une phrase secrète, une fois par appareil, conservée en
localStorage. Côté Cloudflare, `AUTH_KEY` est un secret. Une route inexistante
répond 404 si la phrase est bonne et 401 sinon : c'est la sonde de validation,
elle ne transfère aucune donnée. Tout appel revenant en 401 efface la phrase et
réaffiche la saisie, donc changer le secret ne peut jamais bloquer un appareil.

Personne d'autre que l'utilisateur ne connaît cette phrase — elle n'est pas
récupérable. En cas de perte, en reposer une nouvelle sur Cloudflare.

## Points ouverts

- **FMP répond 401 aux appels du worker** alors que la même clé fonctionne
  depuis un poste local, pour tous les tickers. Antérieur à la v28.85, ce n'est
  pas une régression. Pistes : blocage des IP de datacenter, ou quota de
  250 appels/jour épuisé par le cron horaire. Attention : `_fmpDebug.hasKey`
  est un `false` écrit en dur avec le commentaire « FMP désactivé » — un
  vestige, pas un diagnostic.
  Les **logos ne dépendent plus de cette route** depuis la v28.91 :
  `tickerLogoUrl()` construit l'URL à partir du seul ticker sur le CDN public
  `images.financialmodelingprep.com/symbol/<SYM>.png`, qui n'exige pas de clé.

## Conventions

- Toutes les dates de snapshot sont en **UTC+11** (Nouvelle-Calédonie).
- Le changelog s'écrit en français, à chaque livraison.
- La série v22.xx (réécriture du Storage Engine) a été abandonnée pour
  instabilité et le projet est revenu à la v21.96. Lire le bilan dans le
  changelog avant de retenter une refonte de l'architecture de stockage.
