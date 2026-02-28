# Spécifications : Session de Match (Core Domain)

## 1. Description Globale

C'est le moteur central de l'application et l'interface principale de l'arbitre. Implémente le chronomètre, le score, les **Commandes d'Arbitrage (Command Pattern)**, une machine d'état (**State Pattern**) et l'Event Sourcing.

## 2. Interface Utilisateur (UI/UX - Écran d'arbitrage)

- **En-tête :** Nom des équipes, statut du match (`NOT_STARTED`, `RUNNING`, `BREAK`, `OVERTIME`, `FINISHED`).
- **Zone Centrale (Chrono) :** Affichage grand format du GameTime restant. Bouton Play/Pause massif.
- **Zones Latérales (Score) :** Score actuel de Team A à gauche, Team B à droite. Gros boutons "+1" de chaque côté.
- **Commandes additionnelles :** Boutons pour révoquer le dernier point (Undo), ajuster le chrono, valider la fin du match.
- **Interface Dynamique (State x Command Pattern) :** L'interface réagit à la machine d'état (State Pattern). Les boutons accessibles dépendent du `GameStatus`. Les actions de l'arbitre génèrent des Commandes (Command Pattern). La modification manuelle du score ou du temps affiche un encart "Valider / Annuler" avant d'enregistrer la commande.

## 3. Actions / Logique (Event Sourcing & Patterns)

L'état du match est régi par un **State Pattern**, qui définit quelles commandes sont exécutables à un instant T.
Chaque action UI crée une requête traitée via le **Command Pattern** pour validation :

- `MatchStarted` : Fige le mode de jeu et passe le statut à `RUNNING`.
- `TimerPaused / TimerResumed` : Pour la gestion manuelle ou automatique du temps.
- `PointScored(team_id)` : Augmente le score de l'équipe et déclenche possiblement l'événement de Break.
- `ArbitratorCommandProposed(command)` : L'arbitre propose une modification (Scores, Temps, Timeouts).
- `ArbitratorCommandValidated(command)` : L'arbitre confirme sa commande, l'état global du match est mis à jour.
- `ArbitratorCommandCancelled()` : L'arbitre annule sa modification temporaire.
- `MatchFinished` : Marque officiellement la clôture après validation manuelle.

## 4. Critères d'Acceptation

- [x] Si le GameTime atteint 0, le chrono s'arrête de lui-même.
- [ ] Si au moins une équipe atteint le `Race to` (Score Limite), le `GameTime` est pausé de force.
- [ ] L'arbitre ne peut modifier les scores ou le temps que si l'état n'est PAS `RUNNING`.
- [ ] Toute modification manuelle par l'arbitre doit d'abord être acceptée via un bouton de validation avant persistance.

## 5. État d'Implémentation

- [x] **GameState (State Pattern)** : Implémenté avec tous les états et transitions
  - États : NOT_STARTED, RUNNING, BREAK, OVERTIME, FINISHED, PAUSED
  - Méthodes : start(), pause(), resume(), startBreak(), endBreak(), startOvertime(), finish()
  - Validations : canStart(), canPause(), canResume(), etc.
- [x] **Use Cases** : CreateGame, StartGame, ScorePoint implémentés avec Event Sourcing
- [ ] **Use Cases manquants** : PauseGame, ResumeGame, FinishGame, AdjustTime, AdjustScore
- [x] **Hook Timer** : useGameTimer avec start, pause, resume, reset, addTime, formatTime
- [x] **Repository** : GameRepository avec SQLite
- [x] **Store Zustand** : Actions createGame, loadGames, scorePoint
- [x] **Écrans** :
  - start-match.tsx (sélection field, matchup, gameMode avec snapshot)
  - match/[gameId].tsx (interface arbitrage dark mode avec GameState, timer, scores)
- [x] **Composants** : TeamScoreCard, TimerDisplay, ScoreButton
- [x] **Interface Arbitrage** : Dark mode (#1a1a1a), indicateur LIVE, boutons +1/-1 pour chaque équipe
- [ ] **Command Pattern** : Pas encore implémenté pour les modifications arbitre (Valider/Annuler)
- [ ] **Persistance état match** : GameState non persisté (perte si fermeture app)
- [ ] **Transitions automatiques** : Break → Round suivant, déclenchement Overtime, arrêt si RaceTo atteint
