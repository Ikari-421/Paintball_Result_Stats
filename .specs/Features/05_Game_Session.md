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
- [ ] Si le GameTime atteint 0, le chrono s'arrête de lui-même.
- [ ] Si au moins une équipe atteint le `Race to` (Score Limite), le `GameTime` est pausé de force.
- [ ] L'arbitre ne peut modifier les scores ou le temps que si l'état n'est PAS `RUNNING`.
- [ ] Toute modification manuelle par l'arbitre doit d'abord être acceptée via un bouton de validation avant persistance.
