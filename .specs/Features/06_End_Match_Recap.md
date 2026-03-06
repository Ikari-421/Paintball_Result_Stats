# Spécifications : Tableau Récapitulatif de Fin de Match

## 1. Description
Le tableau de fin de match fournit une chronologie métier simplifiée du match, permettant aux joueurs et arbitres de visualiser le déroulement de la session sans pollution technique.

## 2. Structure des Données (Colonnes)
Le tableau se compose de exactement deux colonnes, sans icônes :

| Colonne | Contenu |
| :--- | :--- |
| **Temps** | Chronomètre du match (Game Clock) au moment de l'action. |
| **Détails** | Description textuelle de l'action et évolution du score. |

## 3. Logique d'Affichage et Événements

### A. Rounds (Points)
Les points marqués sont regroupés par "Round" utilisant un intervalle de temps.
- **Format Temps** : `[Temps Début] - [Temps Fin]`
- **Format Détails** : `+1 [Nom Équipe] (Score : X - Y)`
- *Exemple* : `10:00 - 08:45 \| +1 Team Alpha (Score : 1 - 0)`

### B. Changements d'État (Switch)
Les transitions majeures de la machine d'état (ex: passage en prolongation).
- **Format Temps** : `[Temps Action]`
- **Format Détails** : `Switch to Overtime`

### C. Modifications Arbitre (Audit Trail)
Toute modification manuelle effectuée par l'arbitre pendant le match.
- **Format Temps** : `[Temps Action]`
- **Format Détails** : 
    - Modification temps : `Modif. Temps : [Ancien] ➔ [Nouveau]`
    - Modification score : `Modif. Score : [Ancien] ➔ [Nouveau]`

## 4. Critères d'Acceptation
- [ ] Les événements sont affichés dans l'ordre chronologique (du plus ancien au plus récent).
- [ ] Aucune icône n'est affichée dans le tableau.
- [ ] Le score affiché est le score *résultant* de l'action.
- [ ] Le texte doit utiliser la typographie du projet focalisée sur la lisibilité (gras pour les scores).
