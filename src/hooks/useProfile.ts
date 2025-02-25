// ROCKRLite-MVP/ROCKRLite-Core/src/hooks/useProfile.ts
import { useContext } from 'react';
import { ProfileContext } from '../context/ProfileContext';
import type { 
  Profile, 
  ProfileContextValue,
  ProfileRoleType,
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
  const { actions } = useProfile();
  return actions;
};

export const useProfileEvolution = () => {
  const { evolution } = useProfile();
  return evolution;
};

export const useProfileRKS = () => {
  const { currentProfile } = useProfile();
  return currentProfile?.rks;
};

export const useProfileValidation = () => {
  const { actions } = useProfile();
  return {
    validateProfile: actions.validateProfile,
    validateVersion: (profile: Profile, version: Version) => {
      const { evolution } = useProfile();
      return evolution.validateVersion(profile, version);
    }
  };
};

export const useProfileType = (type: ProfileRoleType) => {
  const { profiles } = useProfile();
  return profiles.filter(profile => profile.roleType === type);
};

export const useProfilesByStatus = (status: ProfileStatus) => {
  const { profiles } = useProfile();
  return profiles.filter(profile => profile.status === status);
};

export const useProfileDomain = () => {
  const { currentProfile } = useProfile();
  return currentProfile?.domain;
};

export const useProfileMigration = () => {
  const { evolution } = useProfile();
  return evolution.migrateProfile;
};

export const useProfileCreation = () => {
  const { actions } = useProfile();
  return actions.createProfile;
};