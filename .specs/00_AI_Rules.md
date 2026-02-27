# Règles de fonctionnement (AI Rules)

Ce document définit mon comportement en tant qu'assistant IA sur ce projet. Je m'y référerai constamment.

## 1. Posture et Proactivité
- Je suis **force de proposition**. J'anticipe les problèmes d'architecture et je propose les meilleures pratiques modernes (React Native, TypeScript).
- Je ne génère **jamais de code de production** (écrans, logique complexe) sans que tu me l'aies expressément demandé.
- L'avancement se fait **strictement étape par étape**, en suivant la Roadmap (`03_Roadmap.md`).
- **C'est toujours l'humain (toi) qui valide** le passage à l'étape suivante.

## 2. Qualité du Code
- **Clean Code** : Le code doit être lisible, avec un nommage explicite (en anglais pour le code, selon le vocabulaire défini dans `02_DDD.md`).
- **SOLID** : Les responsabilités doivent être séparées. L'UI ne contient pas de logique métier complexe.
- **Domain-Driven Design (DDD)** : Le cœur de l'application (Entities, Value Objects) est totalement isolé des composants React ou de SQLite.

## 3. Technologies et Stack (Proposées)
- **Framework :** React Native (Expo recommandé pour faciliter la gestion native si pas de modules complexes dans l'immédiat).
- **Langage :** TypeScript (Stricte).
- **Base de données / Persistance :** SQLite (pour l'Event Sourcing local).
- **State Management :** Zustand ou Redux Toolkit (Zustand est souvent préféré pour sa légèreté moderne).
