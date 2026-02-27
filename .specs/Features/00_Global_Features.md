# Spécifications Produit - Application de Gestion de Matchs

## 1. Gestion des Équipes (Team Management)
**Objectif :** Administration des entités participantes.
- **Actions :** Créer, Modifier, Supprimer, Lister.
- **Attributs :** Nom, Statut "Invité" (booléen).

---

## 2. Modes de Jeu (Game Mode)
**Objectif :** Configuration des règles de match.
- **Actions :** CRUD complet.
- **Paramètres :**
  - Durée de jeu / Break / Timeout.
  - Limite de score (Score limit).
- **Logique :** Snapshot du mode obligatoire au démarrage d'un match.

---

## 3. Gestion des Terrains (Field Management)
**Objectif :** Organisation spatiale des rencontres.
- **Actions :** CRUD complet.
- **Logique :** Association et ordonnancement des MatchUps par terrain.

---

## 4. Confrontations (MatchUp Management)
**Objectif :** Programmation des matchs.
- **Actions :** Créer (Team A vs Team B), Assigner un terrain, Ordonner, Supprimer.

---

## 5. Session de Match (Game Session - Core)
**Objectif :** Pilotage du match en temps réel et persistence.

### Cycle de vie (Lifecycle)
- Contrôles : Démarrer, Pause, Reprendre, Finir.
- Temps morts : Gestion des Breaks et Timeouts.

### Score & Timer
- **Score :** Incrémentation (A/B) et Annulation (Undo).
- **Timer :** Affichage dynamique et arrêt automatique (temps écoulé ou score atteint).

### Persistance
- **Event Sourcing :** Chaque action génère et enregistre un nouvel événement SQLite.