# Architecture React Native proposée

Pour respecter les concepts du **Clean Architecture** et du **Domain-Driven Design (DDD)**, la structure du projet React Native doit séparer strictement le code "Métier" de l'interface graphique "UI".

Voici l'arborescence proposée pour le dossier `src/` (ou `app/` si Expo Router) :

```text
src/
├── core/                   # 🧠 LE CŒUR MÉTIER (Indépendant de React/React Native)
│   ├── domain/             # Les Entités et Value Objects purs (ex: Game.ts, GameMode.ts)
│   ├── useCases/           # Les règles métier applicatives (ex: StartMatch.ts, ScorePoint.ts)
│   └── ports/              # Les interfaces (contrats) pour les bases de données (ex: IGameRepository.ts)
│
├── infrastructure/         # 🔌 L'IMPLÉMENTATION TECHNIQUE
│   ├── database/           # Implémentation SQLite (ex: SqliteGameRepository.ts)
│   └── eventStore/         # Logique spécifique à l'Event Sourcing
│
├── presentation/           # 📱 L'INTERFACE UTILISATEUR (React Native)
│   ├── components/         # Composants UI réutilisables (Boutons, Cards...)
│   ├── screens/            # Les écrans principaux (ex: MatchScreen.tsx, DashboardScreen.tsx)
│   ├── navigation/         # Configuration des routes (React Navigation ou Expo Router)
│   ├── state/              # Gestion d'état global UI (ex: Zustand store)
│   └── styles/             # Fichiers SCSS globaux (variables, mixins)
│
└── tests/                  # 🧪 TESTS
    ├── unit/               # Tests du dossier `core/` (très rapides, sans React)
    └── integration/        # Tests d'UI et de base de données
```

## Choix Techniques Justifiés

### 1. SCSS dans React Native
React Native n'utilise pas le CSS traditionnel mais un système de `StyleSheet` JavaScript.
Cependant, écrire du **SCSS** est possible et très confortable (organisation par variables, mixins, nesting).
**Proposition :** Utiliser `react-native-sass-transformer`. Ce plugin transforme vos fichiers `.scss` en objets StyleSheet utilisables directement dans vos composants au moment du build.
*Alternative courante :* Restyle (par Shopify) pour le typage fort, ou NativeWind (Tailwind pour RN) si tu préfères l'utilitaire, mais le SCSS reste un excellent choix pour garder la main sur le design système.

### 2. Gestion de l'état (State Management)
Pour lier l'interface React au moteur DDD :
**Proposition :** `Zustand`. C'est le standard moderne. Il est minimaliste, sans boilerplate, et très facile à connecter avec une architecture DDD (le store Zustand appelle simplement les instances du domaine ou les Use Cases).

### 3. Navigation
**Proposition :** `Expo Router` (si utilisation d'Expo) ou `React Navigation` (si RN CLI bare). Expo Router offre un routage basé sur les fichiers, très moderne et similaire à Next.js.
