# Spécifications : Gestion des Terrains (Field Management)

## 1. Description Globale
Permet la définition spatiale des lieux de matchs pour organiser un tournoi sur plusieurs zones.

## 2. Interface Utilisateur (UI/UX)
- **Liste des terrains :** Affichage simple sous forme de cartes ou liste.
- **Formulaire de création :** Saisie du nom du terrain (ex: "Terrain A", "Court Central").

## 3. Actions / Logique (API & SQLite)
- `CreateField(name)` : Crée un terrain.
- `UpdateField(id, name)` : Modifie le nom d'un terrain.
- `DeleteField(id)` : Supprime un terrain (uniquement s'il n'a pas de matchs planifiés dessus).

## 4. Critères d'Acceptation
- [ ] La création nécessite juste un nom de terrain unique (de préférence).
- [ ] Impossible de supprimer un terrain si des MatchUps lui sont assignés.
