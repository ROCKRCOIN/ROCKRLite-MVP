// src/interfaces/profile/types.ts 
import { Version } from '../evolution/types'; 
 
export type ProfileType = 
 
export type ProfileStatus = 
 
export interface Profile { 
  id: string; 
  type: ProfileType; 
  role?: string; 
  status: ProfileStatus; 
  domain: string; 
  reviews?: ReviewMetrics; 
  verified: boolean; 
  created: Date; 
  lastActive: Date; 
  version?: Version; 
} 
 
export interface ReviewMetrics { 
  rating: number; 
  responseRate: number; 
  responseTime: number; 
  experienceCount: number; 
  lastUpdated: Date; 
} 
 
export interface ProfileState { 
  profiles: Profile[]; 
  loading: boolean; 
} 
 
export type ProfileAction = 
  state: ProfileState; 
  dispatch: React.Dispatch<ProfileAction>; 
  operations: { 
    switchProfile: (profileId: string) => Promise<void>; 
    updateProfile: (profile: Partial<Profile>) => Promise<void>; 
    validateProfile: (profile: Profile) => boolean; 
  }; 
  evolution: { 
    version: Version; 
    migrateProfile: (profile: Profile, migration: any) => Promise<void>; 
  }; 
} 
