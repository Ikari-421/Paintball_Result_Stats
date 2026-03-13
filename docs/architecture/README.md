# Documentation Architecture - Paintball Result Stats

## 📋 Vue d'ensemble

Cette documentation décrit l'architecture complète de l'application **Paintball Result Stats**, une application mobile React Native d'arbitrage de paintball construite avec Domain-Driven Design (DDD) et Event Sourcing.

**Version:** 1.0  
**Dernière mise à jour:** Mars 2026  
**Basée sur:** Code source réel (src/, app/, hooks/, contexts/)

---

## 🎯 Objectif de cette Documentation

Cette documentation a été générée en analysant **l'implémentation réelle** du code source, pas les spécifications initiales (qui sont obsolètes). Elle reflète fidèlement l'architecture telle qu'elle est actuellement implémentée.

**Utilisation:**
- Onboarding de nouveaux développeurs
- Référence architecturale
- Validation de cohérence
- Base pour évolutions futures

---

## 📚 Structure de la Documentation

### DDD (Domain-Driven Design)

**Chemin:** `ddd/`

1. **[Context Map](ddd/context-map.md)** - Vue d'ensemble des 5 Bounded Contexts
2. **[Tournament Context](ddd/tournament-context.md)** - Gestion des tournois
3. **[Field Context](ddd/field-context.md)** - Gestion des terrains et matchups
4. **[Team Context](ddd/team-context.md)** - Gestion des équipes
5. **[GameMode Context](ddd/gamemode-context.md)** - Configuration des règles
6. **[Game Session Context](ddd/gamesession-context.md)** - ❤️ Core Domain - Arbitrage temps réel
7. **[Event Analysis](ddd/event-analysis.md)** - Analyse Events vs Use Cases (gaps identifiés)
8. **[Event Storming](ddd/event-storming.md)** - Timeline complète d'un match

---

### C4 Model (Architecture Technique)

**Chemin:** `c4/`

1. **[C1 - System Context](c4/c1-context.md)** - Vue système global
2. **[C2 - Container](c4/c2-container.md)** - Containers applicatifs
3. **[C3 - Component](c4/c3-component.md)** - Composants détaillés
4. **[C4 - Code](c4/c4-code.md)** - Classes et patterns

---

## 🚀 Guide de Lecture Recommandé

### Pour les Non-Techniques

1. [C1 - System Context](c4/c1-context.md) - Comprendre le système
2. [Context Map](ddd/context-map.md) - Vue d'ensemble métier
3. [Event Storming](ddd/event-storming.md) - Flux d'un match

**Durée:** ~30 minutes

---

### Pour les Product Owners / Business Analysts

1. [Context Map](ddd/context-map.md) - Les 5 domaines métier
2. [Game Session Context](ddd/gamesession-context.md) - Le cœur métier
3. [Event Storming](ddd/event-storming.md) - Scénarios complets
4. [Event Analysis](ddd/event-analysis.md) - Gaps et recommandations

**Durée:** ~1h30

---

### Pour les Développeurs (Onboarding)

**Jour 1 - Vue d'ensemble:**
1. [C1 - System Context](c4/c1-context.md)
2. [C2 - Container](c4/c2-container.md)
3. [Context Map](ddd/context-map.md)

**Jour 2 - Domain Layer:**
4. [Game Session Context](ddd/gamesession-context.md) - Core Domain
5. [Field Context](ddd/field-context.md)
6. [Team Context](ddd/team-context.md)
7. [GameMode Context](ddd/gamemode-context.md)
8. [Tournament Context](ddd/tournament-context.md)

**Jour 3 - Architecture Technique:**
9. [C3 - Component](c4/c3-component.md)
10. [C4 - Code](c4/c4-code.md)
11. [Event Analysis](ddd/event-analysis.md)

**Durée:** ~3 jours

---

### Pour les Architectes

**Lecture complète dans l'ordre:**
1. Context Map → 5 Bounded Contexts → Event Analysis → Event Storming
2. C1 → C2 → C3 → C4

**Durée:** ~4-6 heures

---

## 🏗️ Architecture en Bref

### Stack Technique

- **Frontend:** React Native (Expo) + TypeScript
- **State Management:** Zustand
- **Database:** SQLite (local)
- **Architecture:** Clean Architecture (Hexagonal)
- **Patterns:** DDD, Event Sourcing, CQRS (léger)

---

### Les 5 Bounded Contexts

```
┌─────────────────────────────────────────────────────┐
│                  CORE DOMAIN                        │
│  ┌───────────────────────────────────────────────┐  │
│  │   Game Session (Arbitrage Temps Réel)        │  │
│  │   - 6 états (NOT_STARTED → FINISHED)         │  │
│  │   - ArbitratorCommand pattern                │  │
│  │   - Event Sourcing complet (9 events)        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              SUPPORTING DOMAINS                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Tournament   │  │ Field        │                 │
│  │ Management   │  │ Management   │                 │
│  └──────────────┘  └──────────────┘                 │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Team         │  │ GameMode     │                 │
│  │ Management   │  │ Management   │                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

### Statistiques Clés

| Métrique | Valeur |
|----------|--------|
| **Bounded Contexts** | 5 |
| **Aggregates** | 5 (Tournament, Field, Team, GameMode, Game) |
| **Use Cases** | 27 |
| **Domain Events** | 20 (+ 7 manquants identifiés) |
| **Repositories** | 5 |
| **Screens** | 20+ |
| **Hooks** | 9 |
| **Lignes de Code** | ~11,500 |

---

## 🎨 Diagrammes Mermaid

Tous les diagrammes de cette documentation utilisent **Mermaid**, un langage de diagrammes compatible avec GitHub et la plupart des éditeurs Markdown.

**Visualisation:**
- GitHub: Rendu automatique
- VS Code: Extension "Markdown Preview Mermaid Support"
- En ligne: https://mermaid.live/

**Types de diagrammes utilisés:**
- `graph TB` - Diagrammes de flux
- `classDiagram` - Modèles de classes
- `sequenceDiagram` - Diagrammes de séquence
- `stateDiagram-v2` - Machines à états

---

## 🔑 Concepts Clés

### Ubiquitous Language (Vocabulaire Métier)

| Terme | Définition | Contexte |
|-------|-----------|----------|
| **Tournament** | Événement sportif avec dates et lieu | Tournament |
| **Field** | Terrain de jeu | Field, Game Session |
| **Matchup** | Duel entre 2 équipes | Field, Game Session |
| **Team** | Équipe (régulière ou invitée) | Team, Field, Game Session |
| **GameMode** | Configuration des règles de jeu | GameMode, Field, Game Session |
| **Game** | Instance d'un match | Game Session |
| **Round / Point** | Manche d'un match (synonymes) | Game Session |
| **Score** | Nombre de rounds gagnés | Game Session |
| **GameTimer** | Chronomètre du match | Game Session |
| **ArbitratorCommand** | Commande de correction | Game Session |
| **RaceTo** | Score limite pour gagner | GameMode, Game Session |

---

### GameStatus (6 États)

```
NOT_STARTED → RUNNING ⇄ TIME_STOPPED
                ↓
              BREAK
                ↓
            OVERTIME
                ↓
            FINISHED
```

1. **NOT_STARTED** - Match pas encore démarré
2. **RUNNING** - Match en cours, timer actif
3. **TIME_STOPPED** - Timer en pause (arbitre)
4. **BREAK** - Pause entre rounds
5. **OVERTIME** - Prolongation (égalité)
6. **FINISHED** - Match terminé

---

### Règles Métier Critiques

1. **Score = Rounds gagnés** (strictement dérivé)
2. **Modifications interdites si timer actif** (sauf si TIME_STOPPED)
3. **Arbitre = autorité absolue** (ArbitratorCommand)
4. **GameMode snapshooté** au démarrage (immutabilité)
5. **Event Sourcing** pour toute action
6. **Validation explicite** des corrections (bouton Valider/Annuler)

---

## 📊 Event Sourcing Coverage

| Bounded Context | Use Cases | Events Implémentés | Coverage |
|-----------------|-----------|-------------------|----------|
| Tournament | 3 | 0 | ❌ 0% |
| Field | 7 | 5 | ⚠️ 71% |
| Team | 3 | 3 | ✅ 100% |
| GameMode | 3 | 3 | ✅ 100% |
| Game Session | 11 | 9 | ⚠️ 82% |
| **TOTAL** | **27** | **20** | **74%** |

**Gaps identifiés:** 7 events manquants (voir [Event Analysis](ddd/event-analysis.md))

---

## 🔍 Points d'Attention

### ✅ Points Forts

- Architecture DDD bien structurée (5 Bounded Contexts)
- Event Sourcing à 74% (20/27 Use Cases)
- Clean Architecture stricte (Domain indépendant)
- ArbitratorCommand pattern robuste
- Timer précis (endTimestamp, pas de drift)
- GameStateMachine élégante (6 états UI)
- Immuabilité stricte dans Domain Layer

---

### ⚠️ Gaps Identifiés

**Priorité Haute:**
1. **Tournament Events manquants** (3 events) - 0% coverage
2. **Break Events manquants** (2 events) - BreakStarted, BreakEnded

**Priorité Moyenne:**
3. **MatchupsReordered Event** - Réorganisation non tracée

**Priorité Basse:**
4. **MatchupUpdated Event** - Modification non tracée
5. **gameModeId manquant** dans MatchupAdded payload

**Détails:** Voir [Event Analysis](ddd/event-analysis.md)

---

### 🚀 Recommandations

**Court terme (1-2 sprints):**
1. Implémenter Tournament Events (TournamentCreated, Updated, Deleted)
2. Implémenter Break Events (BreakStarted, BreakEnded)
3. Ajouter validation de dépendances (cascade delete)

**Moyen terme (3-6 mois):**
4. Implémenter UNDO_LAST_POINT (ArbitratorCommand)
5. Ajouter statistiques temps réel
6. Optimiser performances (indexes, queries)

**Long terme (6-12 mois):**
7. Backend cloud (synchronisation multi-devices)
8. Gestion de joueurs individuels
9. Analytics avancées (ML/AI)

---

## 🧪 Tests

### Stratégie de Test

**Unit Tests (Domain Layer):**
- Aggregates: Game, Field, Team, GameMode, Tournament
- Value Objects: Score, GameTimer, GameDuration, etc.
- Business Rules et invariants

**Integration Tests (Application Layer):**
- Use Cases avec mocks de Repository
- Event emission
- Flux complets

**E2E Tests (Presentation Layer):**
- Flows utilisateur (créer tournoi → arbitrer match)
- UI interactions

**Fichiers:** `src/tests/`

---

## 📖 Glossaire

### Termes Techniques

- **Aggregate:** Cluster d'entités avec une racine (Aggregate Root)
- **Value Object:** Objet immuable défini par ses attributs
- **Domain Event:** Événement métier passé (ex: PointScored)
- **Use Case:** Action métier (ex: ScorePoint)
- **Repository:** Abstraction de la persistance
- **Port:** Interface définie par le Domain
- **Adapter:** Implémentation d'un Port
- **Event Sourcing:** Persistance via events
- **CQRS:** Séparation Command/Query

### Termes Métier

- **Arbitre:** Utilisateur principal de l'app
- **Tournoi:** Événement sportif
- **Terrain:** Field de jeu
- **Matchup:** Duel entre 2 équipes
- **Round:** Manche d'un match
- **Break:** Pause entre rounds
- **Overtime:** Prolongation en cas d'égalité
- **Race to X:** Premier à X rounds gagne

---

## 🔗 Liens Utiles

### Documentation Externe

- **React Native:** https://reactnative.dev/
- **Expo:** https://docs.expo.dev/
- **Zustand:** https://github.com/pmndrs/zustand
- **DDD:** https://martinfowler.com/bliki/DomainDrivenDesign.html
- **Event Sourcing:** https://martinfowler.com/eaaDev/EventSourcing.html
- **C4 Model:** https://c4model.com/

### Code Source

- **Domain:** `src/core/domain/`
- **Use Cases:** `src/core/useCases/`
- **Events:** `src/core/domain/events/`
- **Repositories:** `src/infrastructure/database/`
- **Screens:** `app/`
- **Hooks:** `hooks/`
- **State:** `src/presentation/state/`

---

## 📝 Changelog

### Version 1.0 (Mars 2026)

**Ajouts:**
- Documentation complète DDD (8 fichiers)
- Documentation complète C4 (4 fichiers)
- Analyse basée sur le code réel (pas les specs)
- Identification de 5 Bounded Contexts (Tournament ajouté)
- Analyse complète Events vs Use Cases
- Event Storming avec 3 scénarios

**Découvertes:**
- 5ème Bounded Context: Tournament Management
- GameStatus.TIME_STOPPED (6 états au lieu de 5)
- ArbitratorCommand pattern
- GameStateMachine (6 états UI)
- 7 events manquants identifiés

---

## 🤝 Contribution

### Mise à Jour de la Documentation

**Quand mettre à jour:**
- Ajout d'un nouveau Bounded Context
- Modification d'un Aggregate
- Ajout/Modification d'un Domain Event
- Changement architectural majeur

**Comment mettre à jour:**
1. Modifier le fichier Markdown correspondant
2. Vérifier les diagrammes Mermaid
3. Mettre à jour le Changelog
4. Valider la cohérence avec le code

---

## 📞 Support

**Questions sur l'architecture:**
- Consulter cette documentation
- Analyser le code source
- Référence: Spécifications initiales (`.specs/`) - **ATTENTION: Obsolètes**

**Incohérences détectées:**
- Vérifier le code source (source de vérité)
- Mettre à jour la documentation si nécessaire
- Documenter les écarts

---

## 🎓 Ressources d'Apprentissage

### DDD (Domain-Driven Design)

**Livres:**
- "Domain-Driven Design" - Eric Evans
- "Implementing Domain-Driven Design" - Vaughn Vernon

**Articles:**
- Martin Fowler's DDD series
- DDD Community resources

---

### Event Sourcing

**Livres:**
- "Versioning in an Event Sourced System" - Greg Young

**Articles:**
- Event Sourcing pattern (Microsoft)
- CQRS Journey (Microsoft)

---

### Clean Architecture

**Livres:**
- "Clean Architecture" - Robert C. Martin

**Articles:**
- Hexagonal Architecture (Alistair Cockburn)
- Ports and Adapters pattern

---

## 📄 Licence

Cette documentation est propriété du projet Paintball Result Stats.

---

## ✨ Résumé Exécutif

**Paintball Result Stats** est une application mobile React Native d'arbitrage de paintball construite avec:

- ✅ **5 Bounded Contexts** (DDD)
- ✅ **Event Sourcing** à 74% (20/27 Use Cases)
- ✅ **Clean Architecture** stricte
- ✅ **27 Use Cases** bien organisés
- ✅ **20+ Domain Events** persistés
- ✅ **ArbitratorCommand** pattern robuste
- ✅ **6 états de match** bien définis
- ⚠️ **7 events manquants** identifiés (roadmap)

**Core Domain:** Game Session (arbitrage temps réel)  
**Complexité:** Haute (logique métier riche)  
**Qualité:** Excellente (architecture solide, patterns bien appliqués)

---

**Bonne lecture ! 📚**

Pour toute question, consultez les diagrammes détaillés ou le code source.
