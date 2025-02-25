// src/context/ProfileContext.tsx 
import React, { createContext, useReducer, useRef, useEffect } from 'react'; 
import type { 
  ProfileState, 
  ProfileAction, 
  ProfileContextValue, 
  Profile 
} from '../interfaces/profile/types'; 
import { Version } from '../interfaces/evolution/types'; 
 
const initialState: ProfileState = { 
  currentProfile: null, 
  profiles: [], 
  loading: false, 
  error: null 
}; 
 
export const ProfileContext = createContext<ProfileContextValue | undefined>(undefined); 
 
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState { 
  switch (action.type) { 
    case 'SWITCH_PROFILE': 
      return { 
        ...state, 
      }; 
    case 'UPDATE_PROFILE': 
      return { 
        ...state, 
        profiles: state.profiles.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload } : p 
        ) 
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
 
export function ProfileProvider({ children }: { children: React.ReactNode }) { 
  const [state, dispatch] = useReducer(profileReducer, initialState); 
ECHO is off.
  const value: ProfileContextValue = { 
    state, 
    dispatch, 
    operations: { 
      switchProfile: async (profileId: string) => { 
        dispatch({ type: 'SWITCH_PROFILE', payload: profileId }); 
      }, 
      updateProfile: async (profile: Partial<Profile>) => { 
        dispatch({ type: 'UPDATE_PROFILE', payload: profile }); 
      }, 
      validateProfile: (profile: Profile) => { 
        return !!profile && !!profile.id && !!profile.type; 
      } 
    }, 
    evolution: { 
      version: { 
        major: 1, 
        minor: 0, 
        patch: 0, 
        timestamp: Date.now() 
      }, 
      migrateProfile: async (profile: Profile, migration: any) => { 
        dispatch({ type: 'UPDATE_PROFILE', payload: { ...profile, version: migration.version } }); 
      } 
    } 
  }; 
 
  return ( 
    <ProfileContext.Provider value={value}> 
      {children} 
    </ProfileContext.Provider> 
  ); 
} 
