# Event Analysis - Events vs Use Cases

## Vue d'ensemble

Cette analyse compare les **Use Cases implémentés** avec les **Domain Events émis** pour identifier les gaps dans l'Event Sourcing et assurer la cohérence de l'architecture.

**Objectif:** Event Sourcing complet = Chaque Use Case doit émettre au moins un Domain Event.

---

## Analyse par Bounded Context

### 1. Tournament Management Context

| Use Case | Event Correspondant | Statut | Priorité |
|----------|---------------------|--------|----------|
| CreateTournament | TournamentCreated | ❌ Manquant | Haute |
| UpdateTournament | TournamentUpdated | ❌ Manquant | Haute |
| DeleteTournament | TournamentDeleted | ❌ Manquant | Haute |

**Résumé:** 0/3 events implémentés (0%)

**Impact:** 
- Pas d'audit trail pour les tournois
- Impossible de reconstruire l'état via Event Sourcing
- Incohérence avec les autres contextes

**Recommandation:**
Créer `src/core/domain/events/TournamentEvents.ts` avec les 3 events manquants.

```typescript
// Fichier à créer: src/core/domain/events/TournamentEvents.ts
export interface TournamentCreatedEvent {
  type: 'TournamentCreated';
  aggregateId: TournamentId;
  timestamp: number;
  payload: {
    name: string;
    location: string;
    startDate: number;
    endDate: number;
  };
}

export interface TournamentUpdatedEvent {
  type: 'TournamentUpdated';
  aggregateId: TournamentId;
  timestamp: number;
  payload: {
    name: string;
    location: string;
    startDate: number;
    endDate: number;
  };
}

export interface TournamentDeletedEvent {
  type: 'TournamentDeleted';
  aggregateId: TournamentId;
  timestamp: number;
  payload: Record<string, never>;
}
```

---

### 2. Field Management Context

| Use Case | Event Correspondant | Statut | Priorité |
|----------|---------------------|--------|----------|
| CreateField | FieldCreated | ✅ Implémenté | - |
| UpdateField | FieldUpdated | ✅ Implémenté | - |
| DeleteField | FieldDeleted | ✅ Implémenté | - |
| ReorderMatchups | MatchupsReordered | ❌ Manquant | Moyenne |
| AddMatchup (implicite) | MatchupAdded | ✅ Implémenté | - |
| RemoveMatchup (implicite) | MatchupRemoved | ✅ Implémenté | - |
| UpdateMatchup (implicite) | MatchupUpdated | ❌ Manquant | Basse |

**Résumé:** 5/7 events implémentés (71%)

**Gaps identifiés:**

1. **MatchupsReordered** (Priorité Moyenne)
   - Use Case: `ReorderMatchupsUseCase.ts`
   - Problème: Réorganisation drag-and-drop non tracée
   - Impact: Perte d'historique de l'ordre des matchups

2. **MatchupUpdated** (Priorité Basse)
   - Use Case: Implicite via `field.updateMatchup()`
   - Problème: Modification d'un matchup non tracée
   - Impact: Pas d'audit trail des changements de teams/gameMode

**Recommandation:**

```typescript
// À ajouter dans: src/core/domain/events/FieldEvents.ts

export interface MatchupsReorderedEvent {
  type: 'MatchupsReordered';
  aggregateId: FieldId;
  timestamp: number;
  payload: {
    newOrder: { matchupId: string; order: number }[];
  };
}

export interface MatchupUpdatedEvent {
  type: 'MatchupUpdated';
  aggregateId: FieldId;
  timestamp: number;
  payload: {
    matchupId: string;
    teamA: string;
    teamB: string;
    gameModeId: string;
    order: number;
  };
}
```

**Note:** MatchupAdded devrait aussi inclure `gameModeId` dans le payload (actuellement manquant).

---

### 3. Team Management Context

| Use Case | Event Correspondant | Statut | Priorité |
|----------|---------------------|--------|----------|
| CreateTeam | TeamCreated | ✅ Implémenté | - |
| UpdateTeam | TeamUpdated | ✅ Implémenté | - |
| DeleteTeam | TeamDeleted | ✅ Implémenté | - |

**Résumé:** 3/3 events implémentés (100%)

**Statut:** ✅ Event Sourcing complet

**Remarque:** Contexte le plus simple, Event Sourcing parfait.

---

### 4. Game Mode Management Context

| Use Case | Event Correspondant | Statut | Priorité |
|----------|---------------------|--------|----------|
| CreateGameMode | GameModeCreated | ✅ Implémenté | - |
| UpdateGameMode | GameModeUpdated | ✅ Implémenté | - |
| DeleteGameMode | GameModeDeleted | ✅ Implémenté | - |

**Résumé:** 3/3 events implémentés (100%)

**Statut:** ✅ Event Sourcing complet

---

### 5. Game Session Context (Core Domain)

| Use Case | Event Correspondant | Statut | Priorité |
|----------|---------------------|--------|----------|
| CreateGame | GameCreated | ✅ Implémenté | - |
| StartGame | GameStarted | ✅ Implémenté | - |
| StopGameTime | GameTimeStopped | ✅ Implémenté | - |
| ResumeGame | GameResumed | ✅ Implémenté | - |
| ScorePoint | PointScored | ✅ Implémenté | - |
| AdjustScore | ScoreCorrected | ✅ Implémenté | - |
| StartBreak | BreakStarted | ❌ Manquant | Haute |
| EndBreak | BreakEnded | ❌ Manquant | Haute |
| StartOvertime | OvertimeStarted | ✅ Implémenté | - |
| AdjustTime | TimerAdjusted | ✅ Implémenté | - |
| FinishGame | GameFinished | ✅ Implémenté | - |

**Résumé:** 9/11 events implémentés (82%)

**Gaps identifiés:**

1. **BreakStarted** (Priorité Haute)
   - Use Case: `StartBreak.ts`
   - Problème: Démarrage de break non tracé
   - Impact: Impossible de reconstruire l'historique des breaks
   - Données perdues: Type de break (court/long), durée

2. **BreakEnded** (Priorité Haute)
   - Use Case: `EndBreak.ts`
   - Problème: Fin de break non tracée
   - Impact: Pas d'audit trail de la durée réelle des breaks
   - Données perdues: Round suivant, durée effective

**Recommandation:**

```typescript
// À ajouter dans: src/core/domain/events/GameEvents.ts

export interface BreakStartedEvent {
  type: 'BreakStarted';
  aggregateId: GameId;
  timestamp: number;
  payload: {
    breakDuration: number; // en secondes
    breakType: 'SHORT' | 'LONG'; // 5s ou gameMode.breakTime
    currentRound: number;
  };
}

export interface BreakEndedEvent {
  type: 'BreakEnded';
  aggregateId: GameId;
  timestamp: number;
  payload: {
    nextRound: number;
    actualDuration: number; // Durée réelle (peut différer si arrêt manuel)
  };
}
```

**Modification des Use Cases:**

```typescript
// Dans StartBreak.ts
await eventStore.append({
  type: 'BreakStarted',
  aggregateId: game.id,
  timestamp: Date.now(),
  payload: {
    breakDuration: duration || game.gameMode.breakTime.seconds,
    breakType: duration === 5 ? 'SHORT' : 'LONG',
    currentRound: game.currentRound
  }
});

// Dans EndBreak.ts
await eventStore.append({
  type: 'BreakEnded',
  aggregateId: game.id,
  timestamp: Date.now(),
  payload: {
    nextRound: game.currentRound + 1,
    actualDuration: calculateActualDuration(breakStartTime, Date.now())
  }
});
```

---

## Tableau Récapitulatif Global

| Bounded Context | Use Cases | Events Implémentés | Events Manquants | Taux Complétion |
|-----------------|-----------|-------------------|------------------|-----------------|
| Tournament | 3 | 0 | 3 | 0% |
| Field | 7 | 5 | 2 | 71% |
| Team | 3 | 3 | 0 | 100% |
| GameMode | 3 | 3 | 0 | 100% |
| GameSession | 11 | 9 | 2 | 82% |
| **TOTAL** | **27** | **20** | **7** | **74%** |

---

## Analyse des Patterns

### Pattern 1: CRUD Complet

**Contextes:** Team, GameMode

**Caractéristiques:**
- 3 Use Cases: Create, Update, Delete
- 3 Events: Created, Updated, Deleted
- Event Sourcing parfait (100%)

**Bénéfice:** Audit trail complet, reconstruction d'état facile.

---

### Pattern 2: CRUD Incomplet

**Contexte:** Tournament

**Problème:**
- 3 Use Cases implémentés
- 0 Events émis
- Event Sourcing absent

**Impact:**
- Pas d'historique
- Impossible de reconstruire l'état
- Incohérence architecturale

**Solution:** Implémenter les 3 events manquants (priorité haute).

---

### Pattern 3: Aggregate Complexe

**Contextes:** Field, GameSession

**Caractéristiques:**
- Nombreux Use Cases (7-11)
- Majorité des events implémentés (71-82%)
- Quelques gaps spécifiques

**Analyse:**
- Les Use Cases principaux ont leurs events
- Les Use Cases secondaires/implicites manquent d'events
- Exemple: ReorderMatchups, StartBreak, EndBreak

**Solution:** Compléter les events manquants pour cohérence.

---

## Impact des Gaps

### Impact Fonctionnel

| Gap | Impact Utilisateur | Impact Technique |
|-----|-------------------|------------------|
| Tournament Events | Aucun (fonctionnel) | Pas d'audit trail |
| MatchupsReordered | Aucun | Perte historique ordre |
| BreakStarted/Ended | Aucun | Perte historique breaks |

**Conclusion:** Les gaps n'affectent pas la fonctionnalité actuelle, mais limitent l'audit trail et la reconstruction d'état.

---

### Impact Event Sourcing

**Avec les gaps actuels:**

❌ Impossible de reconstruire complètement l'état d'un match via events
- Breaks non tracés → Perte de l'historique des pauses
- Tournois non tracés → Perte de l'historique des tournois

**Avec les events manquants implémentés:**

✅ Reconstruction complète possible
- Timeline précise de chaque match
- Audit trail complet
- Replay de match possible

---

## Recommandations Priorisées

### Priorité 1 (Haute) - Event Sourcing Core Domain

**À implémenter immédiatement:**

1. **BreakStarted / BreakEnded** (GameSession)
   - Fichier: `src/core/domain/events/GameEvents.ts`
   - Use Cases: `StartBreak.ts`, `EndBreak.ts`
   - Impact: Cohérence Event Sourcing du Core Domain

2. **Tournament Events** (Tournament)
   - Fichier: `src/core/domain/events/TournamentEvents.ts` (à créer)
   - Use Cases: `CreateTournament.ts`, `UpdateTournament.ts`, `DeleteTournament.ts`
   - Impact: Cohérence architecturale globale

**Estimation:** 2-3 heures de développement

---

### Priorité 2 (Moyenne) - Completeness

**À implémenter ensuite:**

1. **MatchupsReordered** (Field)
   - Fichier: `src/core/domain/events/FieldEvents.ts`
   - Use Case: `ReorderMatchupsUseCase.ts`
   - Impact: Traçabilité de l'ordre des matchups

**Estimation:** 1 heure de développement

---

### Priorité 3 (Basse) - Nice to Have

**À considérer:**

1. **MatchupUpdated** (Field)
   - Fichier: `src/core/domain/events/FieldEvents.ts`
   - Use Case: Implicite via `field.updateMatchup()`
   - Impact: Audit trail des modifications de matchups

2. **Améliorer MatchupAdded**
   - Ajouter `gameModeId` dans le payload
   - Impact: Cohérence des données d'event

**Estimation:** 1-2 heures de développement

---

## Checklist d'Implémentation

### Pour chaque Event manquant:

- [ ] Définir l'interface de l'event dans le fichier events approprié
- [ ] Ajouter l'event au type union (DomainXxxEvent)
- [ ] Modifier le Use Case pour émettre l'event
- [ ] Appeler `eventStore.append(event)` dans le Use Case
- [ ] Tester la persistance de l'event
- [ ] Vérifier la reconstruction d'état via events

### Exemple de workflow:

```typescript
// 1. Définir l'event
export interface BreakStartedEvent {
  type: 'BreakStarted';
  aggregateId: GameId;
  timestamp: number;
  payload: { breakDuration: number; breakType: 'SHORT' | 'LONG' };
}

// 2. Ajouter au type union
export type DomainGameEvent =
  | GameCreatedEvent
  | GameStartedEvent
  | BreakStartedEvent // ← Ajouter
  | ...;

// 3. Modifier le Use Case
export class StartBreak {
  async execute(input: StartBreakInput): Promise<void> {
    const game = await this.gameRepository.findById(input.gameId);
    const updatedGame = game.startBreak();
    await this.gameRepository.save(updatedGame);
    
    // ← Ajouter
    await this.eventStore.append({
      type: 'BreakStarted',
      aggregateId: game.id,
      timestamp: Date.now(),
      payload: {
        breakDuration: input.duration || game.gameMode.breakTime.seconds,
        breakType: input.duration === 5 ? 'SHORT' : 'LONG'
      }
    });
  }
}
```

---

## Métriques de Qualité

### Event Sourcing Coverage

**Actuel:** 74% (20/27 Use Cases avec events)

**Cible:** 100% (27/27 Use Cases avec events)

**Gap:** 7 events manquants

---

### Cohérence par Contexte

| Contexte | Cohérence Actuelle | Cohérence Cible |
|----------|-------------------|-----------------|
| Tournament | ❌ 0% | ✅ 100% |
| Field | ⚠️ 71% | ✅ 100% |
| Team | ✅ 100% | ✅ 100% |
| GameMode | ✅ 100% | ✅ 100% |
| GameSession | ⚠️ 82% | ✅ 100% |

---

## Bénéfices de l'Event Sourcing Complet

### 1. Audit Trail Complet

**Actuellement:**
- ❌ Pas d'historique des tournois
- ❌ Pas d'historique des breaks
- ⚠️ Historique partiel des matchups

**Avec Event Sourcing complet:**
- ✅ Historique complet de toutes les actions
- ✅ Qui a fait quoi et quand
- ✅ Raisons des corrections (via ArbitratorCommand)

---

### 2. Reconstruction d'État

**Actuellement:**
- ❌ Impossible de reconstruire un match complet (breaks manquants)
- ❌ Impossible de reconstruire l'historique des tournois

**Avec Event Sourcing complet:**
- ✅ Replay complet d'un match
- ✅ Reconstruction de n'importe quel état passé
- ✅ Time-travel debugging

---

### 3. Analytics et Statistiques

**Actuellement:**
- ⚠️ Statistiques limitées (pas de durée réelle des breaks)
- ⚠️ Pas d'analyse de l'évolution des tournois

**Avec Event Sourcing complet:**
- ✅ Durée moyenne des breaks
- ✅ Analyse de l'évolution des tournois
- ✅ Patterns de jeu (fréquence des corrections, etc.)

---

### 4. Conformité et Légal

**Actuellement:**
- ⚠️ Audit trail incomplet

**Avec Event Sourcing complet:**
- ✅ Conformité RGPD (traçabilité complète)
- ✅ Preuve en cas de litige
- ✅ Transparence totale

---

## Conclusion

### État Actuel

**Points forts:**
- ✅ 74% des Use Cases ont leurs events
- ✅ Core Domain (GameSession) à 82%
- ✅ Team et GameMode à 100%

**Points faibles:**
- ❌ Tournament à 0% (gap critique)
- ⚠️ Breaks non tracés (gap important)
- ⚠️ Réorganisation matchups non tracée

---

### Roadmap

**Phase 1 (Priorité Haute):**
- Implémenter Tournament Events (3 events)
- Implémenter Break Events (2 events)
- **Objectif:** 93% de coverage (25/27)

**Phase 2 (Priorité Moyenne):**
- Implémenter MatchupsReordered (1 event)
- **Objectif:** 96% de coverage (26/27)

**Phase 3 (Priorité Basse):**
- Implémenter MatchupUpdated (1 event)
- Améliorer MatchupAdded payload
- **Objectif:** 100% de coverage (27/27)

---

### Impact Estimé

**Effort total:** 4-6 heures de développement

**Bénéfice:**
- Event Sourcing complet (100%)
- Audit trail total
- Reconstruction d'état complète
- Cohérence architecturale parfaite

**ROI:** Excellent - Peu d'effort pour un bénéfice architectural majeur.

---

## Références

- **Events existants:** `src/core/domain/events/*.ts`
- **Use Cases:** `src/core/useCases/*.ts`
- **EventStore:** `src/infrastructure/eventStore/EventStore.ts`
- **Repositories:** `src/infrastructure/database/*.ts`
