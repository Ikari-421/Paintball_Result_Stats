# Feuille de Route (Roadmap)

Cette feuille de route définit les étapes de développement de l'application mobile en React Native, en priorisant les fondations avant de monter vers l'interface utilisateur et le moteur en temps réel.

## Phase 1 : Fondations (Architecture DDD & Base de données)
**Objectif :** Mettre en place le socle technique, la base de données locale et la structure de l'application.
- [ ] Initialisation du projet React Native.
- [ ] Création et configuration de la base de données **SQLite**.
- [ ] Choix et mise en place de la navigation (React Navigation ou Expo Router).
- [ ] Configuration du gestionnaire d'état global (Zustand) et de l'environnement de tests (Jest).
- [ ] Implémentation des entités, Value Objects et Bounded Contexts détaillés dans `02_DDD.md` (Field, Team, GameMode, Game).
- [ ] Implémentation de l'Event Sourcing et de la couche Repository pour interagir avec SQLite.

## Phase 2 : Configuration (Gestion et UI)
**Objectif :** Développer les écrans permettant de paramétrer tout ce qui précède un match.
- [ ] **Gestion des Terrains (Field Management)** : Écrans pour créer, lister et supprimer des terrains.
- [ ] **Gestion des Équipes (Team Management)** : Écrans pour créer les équipes régulières ou inviter des équipes (Guest).
- [ ] **Gestion des Modes de Jeu (Game Mode)** : Configuration des durées, des pauses et des limites de score.
- [ ] **Gestion des Confrontations (MatchUp)** : Assigner les équipes sur les terrains et définir l'ordre de passage.

## Phase 3 : Moteur de Match (Core Game Session)
**Objectif :** Implémenter le cœur de l'application : la session de jeu en temps réel.
- [ ] **Interface d'Arbitrage** : Affichage du chrono, du score et des contrôles.
- [ ] **Machine d'état du Match** : Gérer les états `NOT_STARTED`, `RUNNING`, `BREAK`, `OVERTIME`, `FINISHED`.
- [ ] **Gestionnaire de Chrono (Timer)** : Moteur de décompte précis et performant, gestion des pauses manuelles.
- [ ] **Gestionnaire de Score** : Fonctions +1 et annulation (Undo/Correction).

## Phase 4 : Rendu Final et Finitions
**Objectif :** Clôturer le cycle de vie d'un match.
- [ ] Écran de fin de match et validation des résultats manuelle par l'arbitre.
- [ ] Gestions spécifiques du temps (Overtime/Tie-break).
- [ ] Améliorations visuelles (UI/UX), animations et micro-interactions.
- [ ] Validation et tests de non-régression du Timer et Event Sourcing.