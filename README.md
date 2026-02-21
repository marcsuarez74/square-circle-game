# La Ronde des Carrés - Square Circle Game

Application de gestion de tournoi de badminton en format "ronde des carrés" (jeu individuel avec rotation des terrains).

## 🎮 Demo

🔗 **Essayez l'application en ligne** : [https://marcsuarez74.github.io/square-circle-game/](https://marcsuarez74.github.io/square-circle-game/)

## Fonctionnalités

### Configuration de la partie (Page 1)

- **Ajout de joueurs** : Via formulaire manuel ou import Excel
- **Import Excel** : Format avec colonnes "nom" et "prénom"
- **Import JSON** : Chargement d'une partie sauvegardée
- **Configuration des terrains** : Choix du nombre de terrains (1-10)
- **Timer** : Durée de match configurable (30s, 3min, 5min, 10min ou personnalisé)
- **Numérotation automatique** : Chaque joueur reçoit un numéro unique
- **Récapitulatif sticky** : Bloc récapitulatif qui suit le scroll (desktop)

### Gestion de la partie (Page 2)

- **Visualisation des terrains** : Schéma visuel avec joueurs positionnés
- **Attribution aléatoire** : Distribution équilibrée des joueurs (4 par terrain)
- **File d'attente** : Gestion des joueurs excédentaires
- **Timer intégré** : Compte à rebours avec états (running/warning/danger)
- **Shuffle** : Mélange des joueurs entre les manches
- **Scores** : Saisie des scores par terrain avec validation
- **Manches multiples** : Passage automatique à la manche suivante
- **Classement en temps réel** : Panneau de classement accessible
- **Persistance** : Sauvegarde automatique dans le localStorage

### Fin de partie (Page 3)

- **Récapitulatif complet** : Nombre de manches, joueurs, terrains
- **Podium** : Affichage du gagnant avec statistiques
- **Classement final** : Liste complète des joueurs
- **Export PDF** : Génération d'un PDF récapitulatif
- **Nouvelle partie** : Recommencer avec les mêmes joueurs (stats reset)

### Scoring

- **Points individuels** : Basé sur les scores des matchs
- **Classement dynamique** : Mise à jour en temps réel
- **Historique** : Conservation des stats entre les manches

## Installation

```bash
# Utiliser Node 20.20.0
nvm use

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start

# Builder pour la production
npm run build
```

## Utilisation

1. **Lancer l'application** : `npm start`
2. **Configurer les joueurs** :
   - Ajouter manuellement ou importer depuis Excel
   - Format Excel : colonnes "nom" et "prénom"
3. **Configurer la partie** :
   - Choisir le nombre de terrains
   - Définir la durée de match
4. **Lancer la partie** : Cliquer sur "Lancer la partie"
5. **Gérer les manches** :
   - Démarrer le timer avec "Déclencher la manche"
   - Saisir les scores à la fin
   - "Manche suivante" pour continuer
   - "Terminer la partie" pour finir et voir le récapitulatif

## Architecture

Le projet suit une architecture **Smart / Dumb Components** :

```
src/
├── app/
│   ├── components/
│   │   ├── game-setup/              # Smart Component - Configuration
│   │   │   ├── components/          # Dumb Components
│   │   │   │   ├── player-form/     # Formulaire ajout joueur
│   │   │   │   ├── player-list/     # Liste des joueurs
│   │   │   │   ├── file-import/     # Import Excel/JSON
│   │   │   │   ├── game-config/     # Configuration timer/terrains
│   │   │   │   └── game-summary/    # Récapitulatif
│   │   │   └── game-setup.ts
│   │   ├── game-arena/              # Smart Component - Jeu
│   │   │   ├── components/          # Dumb Components
│   │   │   │   ├── court-card/      # Carte terrain
│   │   │   │   ├── timer/           # Timer
│   │   │   │   ├── arena-controls/  # Boutons contrôle
│   │   │   │   └── waiting-queue/   # File d'attente
│   │   │   └── game-arena.ts
│   │   ├── game-terminate/          # Smart Component - Fin
│   │   │   ├── components/          # Dumb Components
│   │   │   │   ├── game-stats/      # Stats partie
│   │   │   │   ├── winner-card/     # Carte gagnant
│   │   │   │   ├── rankings-list/   # Classement
│   │   │   │   ├── action-buttons/  # Boutons actions
│   │   │   │   └── thank-you/       # Remerciements
│   │   │   └── game-terminate.ts
│   │   └── ranking-panel/           # Panneau classement
│   ├── store/
│   │   └── game.store.ts            # Signal Store (NgRx Signals)
│   ├── services/
│   │   ├── player.ts                # Gestion joueurs
│   │   ├── game.ts                  # Logique jeu
│   │   └── game-storage.ts          # Persistance localStorage
│   └── models/                      # Interfaces TypeScript
└── styles/
    └── design-system/               # Variables SCSS partagées
```

## Technologies

- **Angular 21** - Framework frontend
- **TypeScript 5** - Typage statique
- **Angular Material** - Composants UI
- **NgRx Signals** - State management réactif
- **SCSS** - Styling avec design system
- **Playwright** - Tests end-to-end
- **xlsx** - Import Excel
- **jspdf** - Export PDF

## Développement

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run e2e

# Relancer uniquement les tests échoués
npm run e2e:failed

# Linter
npm run lint
```

## Fonctionnalités techniques

### Persistance
- Sauvegarde automatique toutes les 10 secondes
- Restauration au refresh de page
- Durée de vie : 24h

### Routing
- Hash location pour GitHub Pages
- Redirection automatique si pas de partie active

### Responsive
- **Desktop** : Layout 2 colonnes avec sidebar sticky
- **Mobile** : Layout 1 colonne, recap en bas
- **Tablette** : Adaptation automatique

### Performance
- Signals Angular pour change detection optimisé
- Lazy loading des composants
- Mémoization des calculs coûteux

## Contribution

Les pull requests sont les bienvenues !

## License

MIT
