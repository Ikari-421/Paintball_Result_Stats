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
- [ ] L'Équipe A ne peut pas être la même que l'Équipe B (validation).
- [ ] L'utilisateur peut réorganiser l'ordre des matchs sur un même terrain (ex: via bouton ou interface de liste).
