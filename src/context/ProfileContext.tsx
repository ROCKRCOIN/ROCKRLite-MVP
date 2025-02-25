// ROCKRLite-MVP/ROCKRLite-Core/src/context/ProfileContext.tsx
import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { useStateContext } from '../hooks/useStateContext';
import { useEvolution } from '../hooks/useEvolution';
import { useDomain } from '../hooks/useDomain';
import {
  Profile,
  ProfileContextValue,
  ProfileAction,
  ProfileState,
  RKSAccount,
  UIMAAccount,
  Transaction,
  Balance,
  StakeUpdate
} from '../interfaces/profile/types';
import { Version } from '../interfaces/evolution/types';

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const initialState: ProfileState = {
  currentProfile: null,
  profiles: [],
  loading: false,
  error: null
};

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_CURRENT_PROFILE':
      return {
        ...state,
        currentProfile: action.payload,
        error: null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(profile =>
          profile.id === action.payload.id ? { ...profile, ...action.payload } : profile
        ),
        currentProfile: state.currentProfile?.id === action.payload.id
          ? { ...state.currentProfile, ...action.payload }
          : state.currentProfile,
        error: null
      };
    case 'ADD_PROFILE':
      return {
        ...state,
        profiles: [...state.profiles, action.payload],
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'UPDATE_RKS_BALANCE':
      const updatedProfile = state.currentProfile
        ? {
            ...state.currentProfile,
            rks: {
              ...state.currentProfile.rks,
              mainAccount: {
                ...state.currentProfile.rks.mainAccount,
                balance: action.payload
              }
            }
          }
        : null;
      return {
        ...state,
        currentProfile: updatedProfile,
        profiles: state.profiles.map(profile =>
          profile.id === updatedProfile?.id ? updatedProfile : profile
        )
      };
    case 'UPDATE_UIMA_BALANCE':
      const uimaUpdatedProfile = state.currentProfile
        ? {
            ...state.currentProfile,
            rks: {
              ...state.currentProfile.rks,
              uimaAccount: {
                ...state.currentProfile.rks.uimaAccount,
                ...action.payload
              }
            }
          }
        : null;
      return {
        ...state,
        currentProfile: uimaUpdatedProfile,
        profiles: state.profiles.map(profile =>
          profile.id === uimaUpdatedProfile?.id ? uimaUpdatedProfile : profile
        )
      };
    default:
      return state;
  }
};

export interface ProfileProviderProps {
  children: React.ReactNode;
  initialProfiles?: Profile[];
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
  initialProfiles = []
}) => {
  const [state, dispatch] = useReducer(profileReducer, {
    ...initialState,
    profiles: initialProfiles
  });

  const stateRef = useRef(state);
  const { state: appState } = useStateContext();
  const evolution = useEvolution();
  const domain = useDomain();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const validateProfile = (profile: Profile): boolean => {
    if (!profile.id || !profile.roleType || !profile.domain) {
      return false;
    }
    return domain.operations.validateDomain(profile.domain);
  };

  const calculateBalance = async (profileId: string): Promise<Balance> => {
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile?.rks) {
      throw new Error('Profile RKS accounts not found');
    }
    return {
      main: profile.rks.mainAccount.balance,
      uima: profile.rks.uimaAccount.balance,
      staked: profile.rks.mainAccount.lockedAmount,
      locked: profile.rks.uimaAccount.lockedAmount,
      pending: profile.rks.uimaAccount.miningPending.reduce(
        (sum, task) => sum + task.amount,
        0
      )
    };
  };

  const value: ProfileContextValue = {
    currentProfile: state.currentProfile,
    profiles: state.profiles,
    loading: state.loading,
    error: state.error,
    actions: {
      switchProfile: async (profileId: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const profile = state.profiles.find(p => p.id === profileId);
          if (!profile) {
            throw new Error('Profile not found');
          }
          if (!validateProfile(profile)) {
            throw new Error('Invalid profile configuration');
          }
          dispatch({ type: 'SET_CURRENT_PROFILE', payload: profile });
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      },
      updateProfile: async (profileData: Partial<Profile>) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const profile = state.profiles.find(p => p.id === profileData.id);
          if (!profile) {
            throw new Error('Profile not found');
          }
          const updatedProfile = { ...profile, ...profileData };
          if (!validateProfile(updatedProfile)) {
            throw new Error('Invalid profile update');
          }
          dispatch({ type: 'UPDATE_PROFILE', payload: updatedProfile });
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      },
      createProfile: async (profileData: Partial<Profile>) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const newProfile: Profile = {
            id: `profile-${Date.now()}`,
            created: new Date(),
            lastActive: new Date(),
            whatsappVerified: false,
            status: 'PENDING',
            evolution: {
              version: evolution.state.version,
              features: [],
              migrations: []
            },
            rks: {
              mainAccount: {
                id: `rks-${Date.now()}`,
                balance: 0,
                transactions: [],
                lockedAmount: 0,
                status: 'active'
              } as RKSAccount,
              uimaAccount: {
                id: `uima-${Date.now()}`,
                balance: 0,
                transactions: [],
                lockedAmount: 0,
                status: 'active',
                weeklyCredit: 18000,
                weeklyExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                allocations: [],
                miningPending: []
              } as UIMAAccount,
              transactions: []
            },
            ...profileData
          } as Profile;

          if (!validateProfile(newProfile)) {
            throw new Error('Invalid profile configuration');
          }
          dispatch({ type: 'ADD_PROFILE', payload: newProfile });
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      },
      validateProfile
    },
    evolution: {
      version: evolution.versions.current,
      migrateProfile: async (profile: Profile, version: Version) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const migratedProfile = {
            ...profile,
            evolution: {
              ...profile.evolution,
              version
            }
          };
          dispatch({ type: 'UPDATE_PROFILE', payload: migratedProfile });
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      },
      validateVersion: (profile: Profile, version: Version) => {
        return evolution.migrations.validate({
          id: 'profile-migration',
          name: 'Profile Version Migration',
          fromVersion: profile.evolution.version,
          toVersion: version,
          steps: [],
          validation: [],
          rollback: [],
          dependencies: []
        });
      }
    },
    rks: {
      calculateBalance,
      processTransaction: async (transaction: Transaction) => {
        // Implementation for processing RKS transactions
      },
      updateStaking: async (staking: StakeUpdate) => {
        // Implementation for updating staking status
      }
    }
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;