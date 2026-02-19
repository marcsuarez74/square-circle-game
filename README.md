# La Ronde des Carrés - Square Circle Game

Application de gestion de tournoi de badminton en format "ronde des carrés" (jeu individuel avec rotation des terrains).

## 🎮 Demo

🔗 **Essayez l'application en ligne** : [https://marcsuarez74.github.io/square-circle-game/](https://marcsuarez74.github.io/square-circle-game/)

## Fonctionnalités

### Configuration de la partie (Page 1)

- **Ajout de joueurs** : Via formulaire manuel ou import Excel
- **Import Excel** : Format avec colonnes "nom" et "prénom" (optionnel: "niveau")
- **Configuration des terrains** : Choix du nombre de terrains (1-10)
- **Timer** : Durée de match obligatoire (en minutes)
- **Numérotation automatique** : Chaque joueur reçoit un numéro unique

### Gestion de la partie (Page 2)

- **Visualisation des terrains** : Schéma visuel des terrains avec placement des joueurs
- **Attribution automatique** : Distribution aléatoire des joueurs (4 par terrain)
- **File d'attente** : Gestion des joueurs en trop par rapport aux terrains disponibles
- **Timer intégré** : Compte à rebours avec bouton "Déclencher la manche"
- **Shuffle** : Bouton pour mélanger les joueurs entre les manches
- **Scores** : Saisie des scores pour chaque terrain
- **Algorithme anti-répétition** : Évite que les joueurs ne rejouent ensemble

### Scoring

- **Points individuels** : Basé sur les scores des matchs
- **Victoire** : 3 points + bonus (différence de points / 5)
- **Défaite** : Points de consolation (score / 10)

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
   - Ajouter manuellement ou importer un fichier Excel
   - Le fichier doit avoir les colonnes "nom" et "prénom"
3. **Configurer la partie** :
   - Choisir le nombre de terrains
   - Définir la durée de match (obligatoire)
4. **Lancer la partie** : Cliquer sur "Lancer la partie"
5. **Gérer les manches** :
   - Cliquer "Déclencher la manche" pour démarrer le timer
   - Saisir les scores à la fin de chaque match
   - Cliquer "Manche suivante" pour recommencer
   - Utiliser "Mélanger les joueurs" pour re-randomiser

## Structure du projet

```
src/
├── app/
│   ├── components/
│   │   ├── game-setup/     # Page de configuration
│   │   └── game-arena/     # Page de jeu
│   ├── models/
│   │   ├── player.model.ts
│   │   ├── court.model.ts
│   │   └── game-config.model.ts
│   ├── services/
│   │   ├── player.ts       # Gestion des joueurs
│   │   └── game.ts         # Logique de jeu
│   └── app.module.ts
└── styles.scss
```

## Technologies

- Angular 21
- TypeScript
- Angular Material
- SCSS
- Playwright (tests e2e)
- xlsx (import Excel)

## Développement

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run e2e

# Linter
npm run lint
```
