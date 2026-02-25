Je veux modéliser le domaine métier d’une application mobile d’arbitrage sportif en React Native.

Contexte général :

- Un Match oppose deux équipes.
- Un Match est composé d’une succession de Rounds (appelés Points).
- Chaque Round a un vainqueur unique.
- Chaque Round ajoute +1 au score global de l’équipe gagnante.
- Le score global est dérivé du nombre de rounds gagnés.
- Le temps du match est un chrono global indépendant des rounds.
- Il existe un break entre chaque round.
- Le match peut être gagné :
  - soit par score max
  - soit par fin du temps (si pas d’égalité)
- En cas d’égalité à la fin du temps → Overtime.
- L’Overtime lance un nouveau round avec un chrono spécifique.
- L’arbitre est autorité absolue.
- Le match n’est officiellement terminé qu’après validation manuelle (FINISHED).

Contraintes importantes :

- L’arbitre peut :
  - corriger le vainqueur d’un round passé
  - rejouer uniquement le dernier round
  - mettre le temps en pause à tout moment
  - ajuster le temps manuellement
- On ne veut PAS de rollback automatique complexe du temps.
- On veut un modèle simple, robuste, cohérent et testable.
- Pas de multi-device.
- Architecture orientée DDD.

Objectif :

1. Clarifier le modèle exact du temps.
2. Clarifier les états du match.
3. Définir précisément les invariants.
4. Définir les commandes métier autorisées.
5. Préparer ensuite l’écriture des specs.

Ne parle pas d’implémentation technique.
Reste uniquement au niveau du modèle métier.
Sois structuré et clair.