# Spécifications : Gestion des Équipes (Team Management)

## 1. Description Globale

Permettre la création et la gestion des équipes qui participeront aux matchs. Il existe deux types d’équipes : les équipes régulières (sauvegardées) et les équipes invitées (créées à la volée pour un match spécifique).

## 2. Interface Utilisateur (UI/UX)

- **Liste des équipes :** Affichage en liste avec nom et indicateur (Régulier / Invité).
- **Formulaire de création :** Un champ texte pour le nom, une case à cocher (ou switch) "Équipe Invitée".
- **Actions sur chaque ligne :** Bouton d'édition et bouton de suppression.

## 3. Actions / Logique (API & SQLite)

- `CreateTeam(name, isGuest)` : Ajoute une nouvelle équipe dans la base locale.
- `UpdateTeam(id, name, isGuest)` : Met à jour les informations de l'équipe.
- `DeleteTeam(id)` : Supprime l'équipe (si elle n'est pas liée à un match en cours ou terminé).
- `ListTeams()` : Récupère la liste de toutes les équipes actives.

## 4. Critères d'Acceptation

- [x] L'utilisateur peut créer une équipe avec un nom valide.
- [x] L'utilisateur peut marquer une équipe comme "Invitée".
- [x] Les équipes s'affichent correctement dans la liste.
- [x] Il est impossible de supprimer une équipe qui est utilisée dans des matchups actifs.

## 5. État d'Implémentation

- [x] **Use Cases** : CreateTeam, UpdateTeam, DeleteTeam implémentés avec Event Sourcing
- [x] **Repository** : TeamRepository avec SQLite
- [x] **Store Zustand** : Actions createTeam, updateTeam, deleteTeam, loadTeams
- [x] **Écrans** :
  - team/teams-list.tsx (liste avec recherche, suppression, validation)
  - team/create-team.tsx (création avec switch Guest)
  - team/edit-team.tsx (édition)
  - team/select-team.tsx (sélection pour matchup)
- [x] **Composants** : TeamCard, GuestTeamForm
- [x] **Hooks** : useTeamSelection, useSearch, useConfirmDialog
- [x] **Validation** : Blocage suppression si équipe utilisée dans matchups
