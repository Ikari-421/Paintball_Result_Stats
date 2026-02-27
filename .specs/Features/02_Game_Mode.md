# Spécifications : Modes de Jeu (Game Mode)

## 1. Description Globale
Configuration des règles spécifiques qui seront appliquées lors d'un match. Un mode de jeu agit comme un "template" que l'on sélectionne en lançant un match.

## 2. Interface Utilisateur (UI/UX)
- **Liste des modes :** Affichage du nom et des paramètres principaux (Durée, Limite de score).
- **Formulaire de création/édition :**
  - Nom du mode (ex: "Tournoi Rapide")
  - Durée du GameTime (en minutes)
  - Durée du BreakTime (en secondes)
  - Nombre de Timeouts autorisés par équipe
  - Limite de score (Race to - ex: Premier arrivé à 10)

## 3. Actions / Logique (API & SQLite)
- `CreateGameMode(...)` : Sauvegarde un nouveau mode de jeu.
- `UpdateGameMode(...)` : Modifie un mode existant.
- `DeleteGameMode(...)` : Supprime un mode s'il n'est pas actif.
- *Règle critique :* Lorsqu'un match démarre, il prend un "snapshot" (une copie figée) du GameMode. Si le GameMode est modifié plus tard, le match en cours n'est pas affecté.

## 4. Critères d'Acceptation
- [ ] Un utilisateur peut enregistrer une configuration complète de mode de jeu.
- [ ] Tous les timers (GameTime, BreakTime, Timeout) doivent accepter des valeurs numériques positives.
- [ ] Le score limite (Race to) doit être un entier positif (si utilisé).
