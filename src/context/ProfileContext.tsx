// src/context/ProfileContext.tsx
import React, { createContext, useReducer } from 'react';
import type {
  Profile,
  ProfileState,
  ProfileAction,
  ProfileContextValue,
  ProfileType,
  ProfileStatus
} from '../interfaces/profile/types';
import type { Version } from '../interfaces/evolution/types';

// Initial state
const initialState: ProfileState = {
  activeProfile: null,
  profiles: [],
  loading: false,
  error: null
};

// Create context
export const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// Reducer
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SWITCH_PROFILE':
      return {
        ...state,
        activeProfile: state.profiles.find(p => p.id === action.payload) || null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(profile =>
          profile.id === action.payload.id
            ? { ...profile, ...action.payload }
            : profile
        ),
        activeProfile: state.activeProfile?.id === action.payload.id
          ? { ...state.activeProfile, ...action.payload }
          : state.activeProfile
      };
    case 'ADD_PROFILE':
      return {
        ...state,
        profiles: [...state.profiles, action.payload]
      };
    case 'REMOVE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.filter(profile => profile.id !== action.payload),
        activeProfile: state.activeProfile?.id === action.payload
          ? null
          : state.activeProfile
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}

// Provider component
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Default version
  const currentVersion: Version = {
    major: 1,
    minor: 0,
    patch: 0,
    timestamp: Date.now()
  };

  // Create context value
  const value: ProfileContextValue = {
    state,
    dispatch,
    profiles: {
      active: state.activeProfile,
      available: state.profiles,
      switch: async (profileId) => {
        dispatch({ type: 'SWITCH_PROFILE', payload: profileId });
      },
      update: async (profile) => {
        if (profile.id) {
          dispatch({ type: 'UPDATE_PROFILE', payload: profile });
        }
      },
      create: async (profile) => {
        // We need to ensure we're creating a valid Profile
        const newProfile: Profile = {
          id: profile.id || Math.random().toString(36).substring(2, 9),
          type: profile.type || 'attendee' as ProfileType,
          status: profile.status || 'pending' as ProfileStatus,
          domain: profile.domain || '',
          verified: profile.verified || false,
          created: profile.created || new Date(),
          lastActive: profile.lastActive || new Date(),
          ...(profile as any) // Use any to avoid type errors, but make sure required fields are set above
        };
        dispatch({ type: 'ADD_PROFILE', payload: newProfile });
      },
      remove: async (profileId) => {
        dispatch({ type: 'REMOVE_PROFILE', payload: profileId });
      }
    },
    domains: {
      current: state.activeProfile?.domain || null,
      available: [...new Set(state.profiles.map(p => p.domain))],
      switchDomain: async (domain) => {
        const profileInDomain = state.profiles.find(p => p.domain === domain);
        if (profileInDomain) {
          dispatch({ type: 'SWITCH_PROFILE', payload: profileInDomain.id });
        }
      },
      getProfilesForDomain: (domain) => {
        return state.profiles.filter(p => p.domain === domain);
      }
    },
    evolution: {
      version: currentVersion,
      features: [],
      upgrade: async (profile) => {
        // Implementation would update profile to support new version features
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            ...profile,
            evolution: {
              version: currentVersion,
              features: []
            }
          }
        });
      }
    }
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}