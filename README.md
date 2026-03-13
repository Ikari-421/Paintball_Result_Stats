# Paintball Result Stats

Application mobile React Native d'arbitrage de paintball avec gestion de tournois, terrains, équipes et arbitrage temps réel. Construite avec Domain-Driven Design (DDD) et Event Sourcing.

## Fonctionnalités

- Gestion de tournois
- Gestion de terrains et matchups
- Gestion d'équipes (régulières et invitées)
- Configuration de modes de jeu personnalisables
- Arbitrage temps réel avec timer précis
- Event Sourcing pour audit trail complet
- Corrections arbitre avec validation explicite

## Technologies

- **React Native** (Expo)
- **TypeScript** (strict mode)
- **SQLite** (base de données locale)
- **Zustand** (state management)
- **Architecture:** Domain-Driven Design + Event Sourcing + Clean Architecture

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI (optionnel)

### Installation des dépendances

```bash
npm install
```

## Lancer l'Application

### Mode développement

```bash
npm start
```

Dans la sortie, vous trouverez des options pour ouvrir l'application sur :

- Android emulator
- iOS simulator
- Expo Go

### Lancer sur Android

```bash
npm run android
```

### Lancer sur iOS

```bash
npm run ios
```

### Lancer sur Web

```bash
npm run web
```

## Tests

### Lancer les tests

```bash
npm test
```

### Lancer les tests en mode watch

```bash
npm run test:watch
```

### Tests disponibles

Les tests unitaires se trouvent dans `src/tests/unit/domain/` :

- `Game.test.ts` - Tests du Core Domain (Game Aggregate)
- `Field.test.ts` - Tests du Field Aggregate
- `Team.test.ts` - Tests du Team Aggregate
- `GameMode.test.ts` - Tests du GameMode Aggregate

## Architecture

Ce projet utilise **Domain-Driven Design (DDD)** avec **Event Sourcing** et suit les principes de **Clean Architecture**.

L'application est organisée en **5 Bounded Contexts** :

- **Tournament Management** - Gestion des tournois
- **Field Management** - Gestion des terrains et matchups
- **Team Management** - Gestion des équipes
- **Game Mode Management** - Configuration des règles de jeu
- **Game Session** (Core Domain) - Arbitrage temps réel

### Documentation complète

- **[Documentation Architecture](docs/architecture/README.md)** - Point d'entrée de la documentation
- **[DDD - Context Map](docs/architecture/ddd/context-map.md)** - Vue d'ensemble des domaines métier
- **[C4 - System Context](docs/architecture/c4/c1-context.md)** - Architecture technique
- **[Event Analysis](docs/architecture/ddd/event-analysis.md)** - Analyse Event Sourcing

## Structure du Projet

```
paintball_result_stats/
├── app/                    # Screens (Expo Router)
├── components/             # Composants UI réutilisables
├── contexts/               # React Contexts
├── hooks/                  # Hooks personnalisés
├── src/
│   ├── core/
│   │   ├── domain/        # Aggregates, Value Objects, Events
│   │   ├── ports/         # Interfaces (Repositories)
│   │   └── useCases/      # Use Cases (27)
│   ├── infrastructure/    # Repositories, EventStore, SQLite
│   ├── presentation/      # State Management (Zustand)
│   └── tests/             # Tests unitaires
├── docs/
│   └── architecture/      # Documentation DDD & C4
└── package.json
```

## Développement

Le projet utilise file-based routing avec Expo Router. Les écrans se trouvent dans le dossier `app/`.

### Commandes utiles

- `npm start` - Démarrer le serveur de développement
- `npm run android` - Lancer sur Android
- `npm run ios` - Lancer sur iOS
- `npm test` - Lancer les tests
- `npm run lint` - Linter le code

## Licence

Projet privé.
