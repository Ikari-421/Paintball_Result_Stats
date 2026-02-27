# Règles Métier (Business Rules)

Ce document centralise les règles absolues qui régissent un match (Game Session). Ces règles doivent être respectées par le moteur de jeu (Game Engine) et par l'interface d'arbitrage.

## 1. Structure d'un Match
- Un **Match** oppose exactement deux entités : `Team A` et `Team B`.
- Un Match est découpé en une succession de **Rounds** (aussi appelés Points).
- Entre chaque Round, un temps de pause (**BreakTime**) est appliqué.

## 2. Système de Score
- À la fin d'un Round, il y a un **vainqueur unique** (soit Team A, soit Team B).
- Le gain d'un Round ajoute **+1** au score global de l'équipe gagnante.
- Le **score global** d'une équipe est et doit toujours être **strictement dérivé** du nombre de Rounds remportés.

## 3. Gestion du Temps (Timer)
- Le **GameTime** (Chronomètre du match) est **global** et **indépendant** des Rounds. Il s'écoule de manière continue pendant que le statut du jeu est `RUNNING`.
- L'arbitre dispose d'un pouvoir absolu sur le temps :
  - Il peut mettre le temps en pause à tout moment.
  - Il peut ajuster manuellement le temps restant (ajouter ou enlever des secondes).
- **Aucun rollback automatique complexe du temps** n'est autorisé en cas d'annulation d'un score. Le temps est géré manuellement par l'arbitre si nécessaire.

## 4. Conditions de Victoire
Un match peut se terminer de deux manières normales :
1. **Atteinte du Score Limite (Race to) :** Une équipe atteint en premier le nombre de points requis (défini dans le `GameMode`). Le match s'arrête instantanément.
2. **Fin du Temps Réglementaire :** Le `GameTime` tombe à 0.
   - Si une équipe a plus de points que l'autre, elle gagne.
   - S'il y a égalité parfaite, le match entre en **Overtime** (Prolongation / Tie-break).

## 5. Overtime (Prolongation)
- L'Overtime est déclenché uniquement s'il y a **égalité** à la fin du temps réglementaire.
- L'Overtime consiste à lancer un **nouveau Round unique**.
- Ce Round d'Overtime possède un **chronomètre spécifique** (différent du GameTime normal).
- Le premier qui gagne ce Round remporte le match.

## 6. Pouvoirs de l'Arbitre (Invariants et Corrections)
La **Game Session** est l'unique source de vérité. L’arbitre est l'autorité absolue sur le terrain et ses commandes priment sur l'automatisation.
- **Règle absolue de modification :** L'arbitre ne peut modifier les données sensibles du match (score, temps, retraits de timeouts, breaks) **que lorsque le jeu n'est pas en cours** (status: `NOT_STARTED`, `BREAK`, ou `FINISHED`). Il est impossible de modifier ces éléments pendant que le chrono tourne (`RUNNING`).
- L'arbitre peut **corriger le vainqueur** d'un Round passé, ou **rejouer/annuler uniquement le dernier Round** disputé.
- **Validation Explicite (Command Pattern) :** À chaque action de l'arbitre (modification de score temporaire, ajustement du temps), un **bouton de validation** lui est proposé. S'il valide, l'état complet du match est persisté en base de données. S'il ne valide pas, l'action est annulée.
- Le match n'est **officiellement terminé** (Statut: `FINISHED`) qu'après une **validation manuelle explicite** de l'arbitre sur l'écran final, pour éviter les fins de matchs accidentelles liées à l'automatisation.
