I want a progressive web app to be used on any phone with this flow .
```
- A: HomePage:
  - Load Game ( if not finished to continue it-> C, if finished to see the record of the game and the final result -> E)
  - New Game (start a new game)
- B: NewGame:
  - Select the number of rounds (R)
  - Select the number of players (P)
  - Input players name
  - Start at round 1
- C: Round X starting at 1 to R
  - Choose bets for each player
  - Validate -> D
- D: Result of round X
  - Input the result according to the rules
  - keep track of the special cards which gave points
  - possibility to change the bets (+1/-1) with the Harry The Giant card
  - Validate -> C X+1
-E: Final Result
  - Display the record of the game
  - Possiblity to export
```

Here are the rules of the game
[SkullKingRulesFR](https://upoevdcxa3.ufs.sh/f/IN4OjmY4wMHB8lrfHHBLH6T3rdIp5fbBlvJNZjUsQ4A7mR1X)

here are brainstormed specs you can lean on : 

```
# Architecture de l'application

## 1. **Structure des écrans principaux**
- **Accueil** : Liste des parties + boutons Nouvelle partie/Supprimer
- **Configuration** : Joueurs (2-10), manches (1-10), type de scoring
- **Paris** : Interface pour saisir les paris de chaque joueur
- **Résultats** : Saisie des plis (réussi/échoué & nombre de plis) + bonus (+10/-10) + compteur de cartes spéciales
- **Tableau de bord** : Vue globale des scores par manche, et possibilité de les modifiers
- **Classement** : Résumé après chaque manche

## 2. **Modèle de données**
```javascript
// Structure de données suggérée
{
  game: {
    id: string,
    players: [{ name: string, id: string }],
    totalRounds: number,
    currentRound: number,
    status: 'in-progress' | 'completed'
  },
  rounds: [{
    roundNumber: number,
    bids: { playerId: number },
    results: {
      playerId: {
        tricks: number,
        bonus: number,
        specialCards: {
          skullKing: number,
          pirates: number,
          mermaids: number,
          coins: number
        },
        score: number
      }
    }
  }]
}
```

## 3. **Calcul automatique des scores**
```javascript
function calculateScore(bid, tricks, roundNumber, bonus = 0) {
  if (bid === 0) {
    return bid === tricks ? 10 * roundNumber : -10 * roundNumber;
  }
  
  if (bid === tricks) {
    return (20 * bid) + bonus;
  } else {
    return (-10 * Math.abs(bid - tricks)) + bonus;
  }
}
```

## 4. **Fonctionnalités clés à  implémenter**

**Page de configuration :**
- Selecteur +/- pour joueurs (2-10)
- Slider pour manches (1-11), saisie manuelle si >11 
- Noms des joueurs éditables

**Page de paris :**
- Limitation automatique : 0 à  (numéro manche + 1)
- Sauvegarde automatique

**Page de résultats :**
- Compteurs visuels pour plis réalisés
- Section bonus séparée
- **Boutons icônes pour cartes spéciales :**
  - 💀👑 Skull King
  - 🦜 Second
  - 🏴‍☠️ Pirate  
  - 🧜‍♀️ Sirène
  - 🪙 Pièce
- Calcul automatique du score

**Tableau de bord :**
- Grille scrollable horizontalement
- Scores cumulés par joueur
- Indicateur manche actuelle
- Possibilité d'éditer

## 5. **Fonctionnalités avancées**

**Édition des manches :**
- Bouton "Modifier" sur chaque manche terminée
- Recalcul automatique des scores suivants
- Confirmation avant modification

**Export :**
- Format CSV/Excel avec détails complets
- Statistiques détaillées par partie

**Statistiques :**
- Taux de réussite des paris par joueur
- Utilisation des cartes spéciales
- Évolution des scores par manche

## 6. **Interface utilisateur**

TODO

## 7. **Extensibilité**

**Structure modulaire pour :**
- Nouvelles variantes de règles
- Cartes supplémentaires
- Systèmes de scoring alternatifs
- Modes de jeu différents

**Configuration externe :**
@/src/config/scoringConfig.ts 