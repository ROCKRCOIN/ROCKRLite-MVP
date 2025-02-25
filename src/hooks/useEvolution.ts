// Full path: src/hooks/useEvolution.ts

import { useContext } from 'react';
import { EvolutionContext } from '../context/EvolutionContext';
import type { 
  Version,
  Feature,
  FeatureState,
  MigrationStrategy,
  MigrationState,
  EvolutionContextValue,
  StateSystem,
  DomainEvolution,
  CrossDomainSync
} from '../interfaces/evolution/types';

export const useEvolution = (): EvolutionContextValue => {
  const context = useContext(EvolutionContext);
  
  if (context === undefined) {
    throw new Error('useEvolution must be used within an EvolutionProvider');
  }

  return {
    // Version Management (Part 7.0.3)
    version: {
      current: context.state.version,
      supported: context.versions.supported,
      upgrade: async (targetVersion: Version) => {
        await context.versions.upgrade(targetVersion);
      },
      rollback: async (version: Version) => {
        await context.versions.rollback(version);
      },
      validate: (version: Version) => context.versions.validate(version)
    },

    // Feature Management (Part 7.0.3 & Updated Part 4)
    features: {
      enabled: context.features.active,
      pending: context.features.pending,
      toggle: async (featureId: string, enabled: boolean) => {
        await context.features[enabled ? 'enable' : 'disable'](featureId);
      },
      validate: (feature: Feature) => context.features.validate(feature)
    },

    // Migration Support (Updated Part 4 & Part 7.0.4)
    migrations: {
      strategies: context.migrations.strategies,
      execute: async (strategy: MigrationStrategy) => {
        await context.migrations.execute(strategy);
      },
      validate: (strategy: MigrationStrategy) => context.migrations.validate(strategy),
      rollback: async (strategy: MigrationStrategy) => {
        await context.migrations.rollback(strategy);
      }
    },

    // State Evolution (Part 5 & Updated Part 5)
    state: {
      current: context.state,
      migrateState: async (state: StateSystem, migration: MigrationStrategy) => {
        await context.state.migrate(state, migration);
      },
      validateState: (state: StateSystem, version: Version) => 
        context.state.validate(state, version)
    },

    // Cross-Domain Evolution (Part 7.0.4)
    crossDomain: {
      validateDomainVersion: (domain: string, version: Version) =>
        context.crossDomain.validateVersion(domain, version),
      synchronizeVersions: async (domains: string[]) => {
        await context.crossDomain.synchronize(domains);
      },
      validateSync: (source: string, target: string) =>
        context.crossDomain.validateSync(source, target)
    },

    // Core Operations (Part 7.0.3)
    operations: {
      backup: async () => await context.operations.backup(),
      restore: async (version: Version) => await context.operations.restore(version),
      validate: () => context.operations.validate()
    }
  };
};