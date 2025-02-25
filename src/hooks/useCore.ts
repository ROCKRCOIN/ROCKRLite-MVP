import { useStateContext } from './useStateContext';
import { useEvolution } from '../context/EvolutionContext';
import { useDomain } from './useDomain';

export const useCore = () => {
  const state = useStateContext();
  const evolution = useEvolution();
  const domain = useDomain();

  return {
    state,
    evolution,
    domain,
    // Integrated operations
    operations: {
      // State operations with evolution and domain awareness
      backup: async () => {
        await state.operations.backup();
        // Handle evolution and domain state backup
        const backup = {
          state: state.state,
          evolution: evolution.state,
          domain: domain.state,
          timestamp: Date.now()
        };
        return backup;
      },
      restore: async (backup: StateBackup) => {
        await state.operations.restore(backup);
        // Restore evolution and domain state
        if (backup.evolution) {
          await evolution.versions.upgrade(backup.evolution.version);
        }
        if (backup.domain) {
          await domain.operations.switchDomain(backup.domain.currentDomain);
        }
      },
      // Evolution operations with state and domain awareness
      upgrade: async (version: Version) => {
        await evolution.versions.upgrade(version);
        // Update state and domain accordingly
        await state.evolution.migrateState({
          fromVersion: state.state.version,
          toVersion: version,
          steps: []
        });
        // Update domain config if needed
        if (domain.state.currentDomain) {
          await domain.operations.updateSettings(
            domain.state.currentDomain,
            { ...domain.state.currentDomain.config, version }
          );
        }
      },
      // Domain operations with state and evolution awareness
      switchDomain: async (domainId: string) => {
        const targetDomain = domain.state.domains.find(d => d.id === domainId);
        if (targetDomain) {
          await domain.operations.switchDomain(targetDomain);
          // Update state and evolution context
          await state.sync.synchronize({
            ...state.state,
            domain: targetDomain
          });
          await evolution.features.enable({
            id: 'domain-switch',
            name: 'Domain Switch',
            enabled: true,
            config: { domainId }
          });
        }
      }
    }
  };
};