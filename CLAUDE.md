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

## FMP — le 401 est résolu (v29.07, worker v163)

Le secret `FMP_API_KEY` porte **un caractère blanc parasite** : 33 caractères
bruts pour 32 utiles. Sans `trim()`, FMP répond « Invalid API KEY » à *tous*
les appels. Mesuré côté worker : la clé brute donne 401, la même clé passée à
`trim()` donne 200 avec les données. Ce n'était donc ni un blocage d'IP de
datacenter, ni le quota — les deux pistes notées jusqu'ici étaient fausses.

`fmpGet()` applique désormais `trim()`. Le secret lui-même reste sale : le
reposer proprement (`wrangler secret put FMP_API_KEY`) est facultatif.

- Les endpoints **`/api/v3/` sont morts** : 403 « Legacy Endpoint » depuis le
  31 août 2025, sauf abonnement antérieur. Le repli v3 de `fmpGet` a été
  supprimé — il ne pouvait que coûter une sous-requête et masquer l'erreur.
  **N'écrire que des chemins `/stable/`.**
- **Ce que le plan sert, mesuré** (sonde `/fmp-debug`, supprimée depuis) :
  `quote` → 200. En revanche `ratios`, `key-metrics`, `income-statement` et
  `cash-flow-statement` refusent `limit > 5` (402), et `sp500-constituent` est
  un **endpoint restreint** (402). Quota 250 appels/jour.
- **Il n'y a donc pas d'historique long à aller chercher chez FMP.** Yahoo sert
  déjà 4 exercices ; le plafond de 5 ne vaut pas la dépendance. L'Analyse de
  Warren tourne entièrement sur Yahoo — ne pas retenter l'enrichissement sans
  un plan payant. La liste des composants du S&P 500 vient de `scrUniverse()`
  (CSV datahub, gratuit), pas de FMP.
- FMP ne sert plus que `/stable/quote`, pour `/market/movers`.
- Attention : `_fmpDebug.hasKey` est un `false` écrit en dur avec le
  commentaire « FMP désactivé » — un vestige, pas un diagnostic.
- Les **logos ne dépendent pas de FMP** : depuis la v28.91 `tickerLogoUrl()`
  construit l'URL à partir du seul ticker sur le CDN public
  `images.financialmodelingprep.com/symbol/<SYM>.png`, qui n'exige pas de clé.
  L'appel `/stable/profile` a quitté `/yahoo-chart` en v29.05.

## Conventions

- Toutes les dates de snapshot sont en **UTC+11** (Nouvelle-Calédonie).
- Le changelog s'écrit en français, à chaque livraison.
- La série v22.xx (réécriture du Storage Engine) a été abandonnée pour
  instabilité et le projet est revenu à la v21.96. Lire le bilan dans le
  changelog avant de retenter une refonte de l'architecture de stockage.
