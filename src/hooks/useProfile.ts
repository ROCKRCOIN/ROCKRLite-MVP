// src/hooks/useProfile.ts
import { useContext } from 'react';
import { ProfileContext } from '../context/ProfileContext';
import type {
  Profile,
  ProfileContextValue,
  ProfileType,
  ProfileStatus
} from '../interfaces/profile/types';
import type { Version } from '../interfaces/evolution/types';

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const useProfileActions = () => {
  // Adjust path to match actual interface structure
  const { state, dispatch } = useProfile();
  return {
    validateProfile: (profile: Profile): boolean => {
      return !!profile.id && !!profile.type && !!profile.domain;
    },
    createProfile: (profile: Profile) => {
      dispatch({ type: 'ADD_PROFILE', payload: profile });
      return Promise.resolve();
    },
    updateProfile: (profile: Partial<Profile>) => {
      dispatch({ type: 'UPDATE_PROFILE', payload: profile });
      return Promise.resolve();
    }
  };
};

export const useProfileEvolution = () => {
  // Adjust path to match actual interface structure
  return {
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      timestamp: Date.now()
    },
    features: [],
    validateVersion: (profile: Profile, version: Version) => true,
    migrateProfile: (profile: Profile) => Promise.resolve()
  };
};

export const useProfileRKS = () => {
  // Adjust path to match actual interface structure
  const { state } = useProfile();
  return state.activeProfile?.rks;
};

export const useProfileValidation = () => {
  const actions = useProfileActions();
  const evolution = useProfileEvolution();
  
  return {
    validateProfile: actions.validateProfile,
    validateVersion: (profile: Profile, version: Version) => {
      return evolution.validateVersion(profile, version);
    }
  };
};

export const useProfileType = (type: ProfileType) => {
  // Adjust path to match actual interface structure
  const { state } = useProfile();
  return state.profiles.filter(profile => profile.type === type);
};

export const useProfilesByStatus = (status: ProfileStatus) => {
  // Adjust path to match actual interface structure
  const { state } = useProfile();
  return state.profiles.filter(profile => profile.status === status);
};

export const useProfileDomain = () => {
  // Adjust path to match actual interface structure
  const { state } = useProfile();
  return state.activeProfile?.domain;
};

export const useProfileMigration = () => {
  const evolution = useProfileEvolution();
  return evolution.migrateProfile;
};

export const useProfileCreation = () => {
  const actions = useProfileActions();
  return actions.createProfile;
};