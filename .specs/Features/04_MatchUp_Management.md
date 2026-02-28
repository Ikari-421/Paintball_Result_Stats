# Spécifications : Confrontations (MatchUp Management)

## 1. Description Globale

La programmation d'un match. C'est l'étape où l'on décide que l'Équipe A affronte l'Équipe B sur un Terrain donné.

## 2. Interface Utilisateur (UI/UX)

- **Tableau de bord de programmation :** Par terrain, on voit la liste des affrontements prévus.
- **Formulaire d'ajout :**
  - Sélecteur de l'Équipe A.
  - Sélecteur de l'Équipe B.
  - Sélecteur du Terrain (Field).
  - Définition de l'ordre de passage (Order / Index).

## 3. Actions / Logique (API & SQLite)

- `CreateMatchUp(teamA_id, teamB_id, field_id, order)` : Planifie un match.
- `ReorderMatchUp(id, new_order)` : Change l'ordre de passage d'un match sur le terrain.
- `DeleteMatchUp(id)` : Annule le match (s'il n'a pas démarré).

## 4. Critères d'Acceptation

- [x] L'Équipe A ne peut pas être la même que l'Équipe B (validation).
- [x] L'utilisateur peut réorganiser l'ordre des matchs sur un même terrain (boutons up/down).

## 5. État d'Implémentation

- [x] **Value Object** : Matchup (teamA, teamB, order)
- [x] **Domaine** : Field aggregate contient les matchups
- [x] **Store Zustand** : Actions addMatchupToField, removeMatchupFromField
- [x] **Context** : MatchupCreationContext pour gestion état temporaire (tempMatchups, addTempMatchup, removeTempMatchup, clearTempMatchups)
- [x] **Écrans** :
  - field/[id].tsx (affichage et gestion des matchups)
  - field/create-field.tsx (liste des matchups avec Context)
  - field/edit-field.tsx (édition avec matchups)
  - field/matchup/create-matchup.tsx (écran dédié pour créer un matchup)
  - team/select-team.tsx (écran dédié pour sélectionner une équipe)
- [x] **Composants** :
  - MatchupCard (affichage Team A vs Team B)
  - MatchupList (liste des matchups avec delete et boutons up/down)
- [x] **Navigation** :
  - create-field → create-matchup
  - create-matchup → select-team (pour Team A et Team B)
  - create-matchup → select-game-mode (pour GameMode)
  - create-matchup → router.back() (ajout au Context)
- [x] **Validation** : Team A ≠ Team B, sélection obligatoire des équipes et GameMode
- [x] **Suppression** : Bouton delete sur chaque matchup
- [x] **GameMode par MatchUp** : Chaque matchup a son propre GameMode
- [x] **Réorganisation** : Boutons up/down pour changer l'ordre (handleMoveUp, handleMoveDown)
