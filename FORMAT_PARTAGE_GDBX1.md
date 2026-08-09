# Format d'échange « GDBX1 » — idées de trade

Format ouvert pour s'envoyer des idées de trade entre deux apps qui n'ont **aucun
serveur commun**. Le transport est un simple texte : messagerie, mail, SMS, QR…

---

## 1. Enveloppe

```
GDBX1:<base64url(JSON UTF-8)>
```

- Préfixe littéral `GDBX1:` (repérage + versionnage).
- `base64url` = base64 standard avec `+`→`-`, `/`→`_`, et le padding `=` retiré.
- Le décodeur doit **retrouver le préfixe n'importe où** dans le texte collé et
  **ignorer les espaces / sauts de ligne** (les messageries en insèrent).

Ordre de grandeur : une idée complète (thèse + risques rédigés) ≈ **800 caractères**.

## 2. Charge utile (JSON)

```json
{
  "v": 1,
  "from": "Florent",
  "ts": "2026-07-31",
  "items": [ /* une ou plusieurs idées */ ]
}
```

| Champ   | Type   | Rôle                                  |
|---------|--------|---------------------------------------|
| `v`     | entier | Version du format (1)                 |
| `from`  | texte  | Expéditeur, sert d'auteur par défaut  |
| `ts`    | date   | `AAAA-MM-JJ` de l'export              |
| `items` | tableau| Les idées                             |

## 3. Une idée

```json
{
  "ticker": "PLTR",
  "name": "Palantir",
  "sym": "PLTR",
  "cat": "Action",
  "domain": "Tech",
  "fav": true,
  "conviction": 4,
  "horizon": "Long terme",
  "buyLow": 120.5,
  "buyHigh": 138,
  "alertBuy": 118,
  "alertSell": 210,
  "targets": [
    { "price": 190, "note": "1/3 de la position" },
    { "price": 240, "note": "solde" }
  ],
  "conditions": [
    { "id": "c_a1", "cat": "technique", "templateId": "mm",
      "params": { "period": 200, "unit": "D", "sens": "above" },
      "text": "MM200 (D) — prix au-dessus de la MM", "validated": true },
    { "id": "c_a2", "cat": "fondamental", "templateId": null, "params": null,
      "text": "Nouveau contrat / partenariat", "validated": false }
  ],
  "thesis": "…",
  "risks": "…",
  "createdAt": "2026-07-31",
  "author": "Florent"
}
```

| Champ                  | Type            | Notes |
|------------------------|-----------------|-------|
| `ticker`               | texte           | **Seul champ obligatoire**, en MAJUSCULES |
| `name`                 | texte           | Nom lisible |
| `sym`                  | texte           | Symbole Yahoo exact (ex. `AIR.PA`, `BTC-USD`). À défaut, déduire du ticker |
| `cat`                  | texte           | `Action` \| `Crypto` \| `ETF` \| `Autre` |
| `domain`               | texte           | Secteur, libre |
| `fav`                  | booléen         | Favori |
| `conviction`           | entier 1–5      | |
| `horizon`              | texte           | `Court terme` \| `Moyen terme` \| `Long terme` |
| `buyLow` / `buyHigh`   | nombre \| null  | Zone d'achat |
| `alertBuy`/`alertSell` | nombre \| null  | Seuils d'alerte |
| `targets`              | tableau         | `{price, note}`, ordonné du plus proche au plus lointain |
| `conditions`           | tableau         | Catalyseurs — voir §3.1 |
| `thesis` / `risks`     | texte           | Multi-lignes autorisé |
| `createdAt`            | date            | |
| `author`               | texte           | À défaut, reprendre `from` |

### 3.1 Catalyseurs (`conditions`)

Chaque catalyseur est une condition qui, une fois validée, fait monter le score
de l'idée (`score = nombre de validées / total`).

| Champ        | Type            | Notes |
|--------------|-----------------|-------|
| `id`         | texte           | Unique dans l'idée ; régénérer si absent |
| `cat`        | texte           | `technique` (validable automatiquement) \| `fondamental` (coché à la main) |
| `templateId` | texte \| null   | Technique uniquement : `mm`, `rsi`, `ath`, `support`, `resistance`, `macd`, `volume` |
| `params`     | objet \| null   | Selon le template — voir ci-dessous |
| `text`       | texte           | Libellé lisible ; pour le fondamental, c'est **le** contenu |
| `validated`  | booléen         | État de la case |

Paramètres par template :

| Template     | `params` |
|--------------|----------|
| `mm`         | `{ period: 9\|20\|50\|200, unit, sens: "above"\|"below" }` |
| `rsi`        | `{ unit, seuil: nombre, sens: "above"\|"below" }` |
| `support` / `resistance` | `{ unit, level: nombre }` |
| `ath` / `macd` / `volume` | `{ unit }` |

`unit` vaut `D` (journalier), `W` (hebdomadaire) ou `M` (mensuel).

Une app qui n'implémente pas les catalyseurs doit **conserver le tableau tel
quel** plutôt que le supprimer, pour ne pas le perdre au prochain échange.

**Prix en USD**, non convertis — chaque app applique son propre affichage €/$.

Il n'y a **pas d'`id`** : chaque app génère le sien à l'import.

## 4. Règles d'import

1. Décoder, vérifier `v === 1` et `items` non vide.
2. Ignorer toute idée sans `ticker`.
3. **Rapprochement par `ticker`** (comparaison en majuscules) :
   déjà présent → remplacer en **conservant l'`id` local** ; sinon → ajouter.
4. Toujours **prévisualiser avant d'écrire** : lister les idées, indiquer
   lesquelles écrasent une existante, laisser décocher.
5. Champs absents → valeurs par défaut, jamais d'erreur bloquante.
6. Un champ inconnu doit être **ignoré silencieusement** (compatibilité ascendante).

## 5. Implémentation de référence (JS)

```js
function wlEncode(obj){
  var bytes = new TextEncoder().encode(JSON.stringify(obj));
  var bin = ""; for(var i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function wlDecode(str){
  var s = String(str||"").trim();
  var i = s.indexOf("GDBX1:"); if(i>=0) s = s.slice(i+6);
  s = s.replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/");
  while(s.length % 4) s += "=";
  var bin = atob(s), bytes = new Uint8Array(bin.length);
  for(var j=0;j<bin.length;j++) bytes[j] = bin.charCodeAt(j);
  return JSON.parse(new TextDecoder().decode(bytes));
}
```

`TextEncoder`/`TextDecoder` sont indispensables : `btoa` seul échoue sur les
accents. Le passage par base64url évite que les `+` et `/` soient mangés par
une URL ou un lien de messagerie.

## 6. Évolutions

Champs additifs → on reste en `v: 1` (les inconnus sont ignorés).
Rupture de compatibilité → nouveau préfixe `GDBX2:`, les deux décodeurs
pouvant cohabiter.
