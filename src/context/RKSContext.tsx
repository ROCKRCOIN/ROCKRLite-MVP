import React, { createContext, useReducer, useEffect, useRef } from 'react';
import type { Version, Feature, MigrationStrategy } from '../interfaces/evolution/types';
import type { Domain } from '../interfaces/domain/types';

// RKS Account Types
export interface RKSAccount {
  id: string;
  userId: string;
  balance: number;
  lockedAmount: number;
  transactions: Transaction[];
  status: AccountStatus;
}

export interface UIMAAccount extends RKSAccount {
  weeklyCredit: number; // Default 18000 for MVP
  weeklyExpiration: Date;
  allocations: UIMAllocation[];
  miningPending: MiningPendingTask[];
}

export interface UIMAllocation {
  experienceId: string;
  amount: number;
  type: 'bid' | 'mining';
  status: 'pending' | 'locked' | 'mined' | 'expired' | 'cancelled';
  expiryDate: Date;
}

export interface MiningPendingTask {
  id: string;
  experienceId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;
  metadata: Record<string, any>;
}

export type AccountStatus = 'active' | 'locked' | 'suspended';
export type TransactionType = 'transfer' | 'bid' | 'mining' | 'refund' | 'system';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

// RKS Allocation for experiences
export interface RKSAllocation {
  total: number;
  breakdown: {
    host: number;       // 20% for MVP
    attendees: number;  // 50% for MVP
    curator: number;    // 5% for MVP
    venue: number;      // 10% for MVP
    production: number; // 10% for MVP
    ai: number;        // 5% for MVP
  };
  mining: {
    available: number;
    locked: number;
    distributed: number;
  };
}

// Eligibility configuration for UIMA funding
export interface EligibilityConfig {
  types: string[];
  settings: string[];
  subjects: string[];
  genres: string[];
}

// Context State
export interface RKSState {
  mainAccount: RKSAccount | null;
  uimaAccount: UIMAAccount | null;
  eligibilityConfig: EligibilityConfig;
  weeklyUimaCredit: number; // Default 18000 for MVP
  targetSeatPrice: number;  // Default 6000 for MVP
  loading: boolean;
  error: string | null;
  evolution: {
    version: Version;
    features: string[];
  };
}

// RKS Balance Result for X=Y mechanism
export interface BalanceResult {
  xTotal: number;
  yTotal: number;
  isBalanced: boolean;
  difference: number;
}

// Context Actions
export type RKSAction =
  | { type: 'SET_ACCOUNTS'; payload: { main: RKSAccount; uima: UIMAAccount } }
  | { type: 'UPDATE_MAIN_BALANCE'; payload: number }
  | { type: 'UPDATE_UIMA_BALANCE'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_UIMA_ALLOCATION'; payload: UIMAllocation }
  | { type: 'UPDATE_UIMA_ALLOCATION'; payload: { id: string; status: UIMAllocation['status'] } }
  | { type: 'SET_MINING_TASK'; payload: MiningPendingTask }
  | { type: 'UPDATE_MINING_TASK'; payload: { id: string; status: MiningPendingTask['status'] } }
  | { type: 'UPDATE_ELIGIBILITY_CONFIG'; payload: Partial<EligibilityConfig> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Context Value interface
export interface RKSContextValue {
  state: RKSState;
  dispatch: React.Dispatch<RKSAction>;
  
  // Account Management
  accounts: {
    getMainBalance: () => number;
    getUIMABalance: () => number;
    getLockedAmount: () => number;
    getPendingMining: () => number;
    creditWeeklyUIMA: () => Promise<void>;
  };
  
  // Transaction Management
  transactions: {
    transfer: (params: TransferParams) => Promise<boolean>;
    placeBid: (params: BidParams) => Promise<boolean>;
    validateTransaction: (transaction: Transaction) => boolean;
    getTransactionHistory: () => Transaction[];
  };
  
  // Mining Management
  mining: {
    calculateMining: (experience: any) => number;
    trackPending: (task: MiningPendingTask) => Promise<void>;
    processMiningReward: (taskId: string) => Promise<boolean>;
  };
  
  // Eligibility Management
  eligibility: {
    checkEligibility: (params: EligibilityParams) => boolean;
    getEligibleTypes: () => string[];
    getEligibleSettings: () => string[];
  };
  
  // Balance Calculation
  balance: {
    calculateXYBalance: (allocation: RKSAllocation) => BalanceResult;
    adjustToMaintainBalance: (allocation: RKSAllocation, changedKey: string, newValue: number) => RKSAllocation;
  };
  
  // Evolution Support
  evolution: {
    upgradeRKS: (migration: MigrationStrategy) => Promise<void>;
    validateVersion: (version: Version) => boolean;
  };
  
  // RKS Allocation Calculation
  calculateRKSAllocation: (params: {
    experienceType: string;
    experienceSetting: string;
    capacity: number;
    hostCount: number;
    domain?: string;
  }) => RKSAllocation;
}

export interface TransferParams {
  amount: number;
  toUserId: string;
  metadata?: Record<string, any>;
}

export interface BidParams {
  experienceId: string;
  amount: number;
  expiryDate: Date;
}

export interface EligibilityParams {
  type: string;
  setting: string;
  subject?: string;
  genre?: string;
}

// Initial State
const initialRKSState: RKSState = {
  mainAccount: null,
  uimaAccount: null,
  eligibilityConfig: {
    types: ['lecture', 'workshop', 'seminar'],
    settings: ['academic', 'cultural', 'social'],
    subjects: [],
    genres: []
  },
  weeklyUimaCredit: 18000, // Default for MVP
  targetSeatPrice: 6000,   // Default for MVP (3000 X + 3000 Y)
  loading: false,
  error: null,
  evolution: {
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      timestamp: Date.now()
    },
    features: []
  }
};

// Create the context
export const RKSContext = createContext<RKSContextValue | undefined>(undefined);

// Reducer function
function rksReducer(state: RKSState, action: RKSAction): RKSState {
  switch (action.type) {
    case 'SET_ACCOUNTS':
      return {
        ...state,
        mainAccount: action.payload.main,
        uimaAccount: action.payload.uima
      };
    case 'UPDATE_MAIN_BALANCE':
      return {
        ...state,
        mainAccount: state.mainAccount
          ? { ...state.mainAccount, balance: action.payload }
          : null
      };
    case 'UPDATE_UIMA_BALANCE':
      return {
        ...state,
        uimaAccount: state.uimaAccount
          ? { ...state.uimaAccount, weeklyCredit: action.payload }
          : null
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        mainAccount: state.mainAccount
          ? {
              ...state.mainAccount,
              transactions: [
                ...(state.mainAccount.transactions || []),
                action.payload
              ]
            }
          : null
      };
    case 'ADD_UIMA_ALLOCATION':
      return {
        ...state,
        uimaAccount: state.uimaAccount
          ? {
              ...state.uimaAccount,
              allocations: [
                ...(state.uimaAccount.allocations || []),
                action.payload
              ]
            }
          : null
      };
    case 'UPDATE_UIMA_ALLOCATION':
      return {
        ...state,
        uimaAccount: state.uimaAccount
          ? {
              ...state.uimaAccount,
              allocations: state.uimaAccount.allocations.map(allocation =>
                allocation.experienceId === action.payload.id
                  ? { ...allocation, status: action.payload.status }
                  : allocation
              )
            }
          : null
      };
    case 'SET_MINING_TASK':
      return {
        ...state,
        uimaAccount: state.uimaAccount
          ? {
              ...state.uimaAccount,
              miningPending: [
                ...(state.uimaAccount.miningPending || []),
                action.payload
              ]
            }
          : null
      };
    case 'UPDATE_MINING_TASK':
      return {
        ...state,
        uimaAccount: state.uimaAccount
          ? {
              ...state.uimaAccount,
              miningPending: state.uimaAccount.miningPending.map(task =>
                task.id === action.payload.id
                  ? { ...task, status: action.payload.status }
                  : task
              )
            }
          : null
      };
    case 'UPDATE_ELIGIBILITY_CONFIG':
      return {
        ...state,
        eligibilityConfig: {
          ...state.eligibilityConfig,
          ...action.payload
        }
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
    case 'RESET':
      return initialRKSState;
    default:
      return state;
  }
}

// RKS Provider Component
export const RKSProvider: React.FC<{
  children: React.ReactNode;
  domain?: Domain;
}> = ({ children, domain }) => {
  const [state, dispatch] = useReducer(rksReducer, initialRKSState);
  const stateRef = useRef(state);

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Weekly UIMA credit refresh check
  useEffect(() => {
    if (state.uimaAccount) {
      const now = new Date();
      const expiration = new Date(state.uimaAccount.weeklyExpiration);
      
      if (now > expiration) {
        creditWeeklyUIMA();
      }
    }
  }, [state.uimaAccount]);

  // Credit weekly UIMA function
  const creditWeeklyUIMA = async () => {
    if (!state.uimaAccount) return;
    
    try {
      // Set new expiration date (7 days from now)
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);
      
      // Create updated UIMA account
      const updatedUIMA: UIMAAccount = {
        ...state.uimaAccount,
        weeklyCredit: state.weeklyUimaCredit,
        weeklyExpiration: expiration
      };
      
      // Update state
      if (state.mainAccount) {
        dispatch({
          type: 'SET_ACCOUNTS',
          payload: {
            main: state.mainAccount,
            uima: updatedUIMA
          }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to credit weekly UIMA' });
    }
  };

  // Calculate X=Y balance
  const calculateXYBalance = (allocation: RKSAllocation): BalanceResult => {
    // Calculate X side (attendees)
    const xTotal = allocation.breakdown.attendees;
    
    // Calculate Y side (all suppliers)
    const yTotal = 
      allocation.breakdown.host +
      allocation.breakdown.curator +
      allocation.breakdown.venue +
      allocation.breakdown.production +
      allocation.breakdown.ai;
    
    return {
      xTotal,
      yTotal,
      isBalanced: Math.abs(xTotal - yTotal) < 0.001, // Allow for floating point errors
      difference: xTotal - yTotal
    };
  };

  // Adjust allocation to maintain X=Y balance
  const adjustToMaintainBalance = (
    allocation: RKSAllocation,
    changedKey: string,
    newValue: number
  ): RKSAllocation => {
    // Create a copy of the allocation
    const updated: RKSAllocation = {
      ...allocation,
      breakdown: { ...allocation.breakdown }
    };
    
    // Apply the change
    if (changedKey in updated.breakdown) {
      updated.breakdown[changedKey as keyof typeof updated.breakdown] = newValue;
    }
    
    // Calculate current balance
    const balance = calculateXYBalance(updated);
    
    // If already balanced, return the updated allocation
    if (balance.isBalanced) {
      return updated;
    }
    
    // Determine if adjustment needed on X or Y side
    if (changedKey === 'attendees') {
      // X side was changed, adjust Y side proportionally
      const currentYTotal = balance.yTotal;
      const targetYTotal = updated.breakdown.attendees;
      const adjustmentFactor = targetYTotal / currentYTotal;
      
      // Adjust all Y components proportionally
      updated.breakdown.host *= adjustmentFactor;
      updated.breakdown.curator *= adjustmentFactor;
      updated.breakdown.venue *= adjustmentFactor;
      updated.breakdown.production *= adjustmentFactor;
      updated.breakdown.ai *= adjustmentFactor;
    } else {
      // Y side was changed, adjust X side
      const currentYTotal = balance.yTotal;
      updated.breakdown.attendees = currentYTotal;
    }
    
    // Update total
    updated.total = updated.breakdown.attendees + balance.yTotal;
    
    return updated;
  };

  // Check experience eligibility for UIMA funding
  const checkEligibility = (params: EligibilityParams): boolean => {
    const { eligibilityConfig } = state;
    
    // Check if type is eligible
    if (!eligibilityConfig.types.includes(params.type)) {
      return false;
    }
    
    // Check if setting is eligible
    if (!eligibilityConfig.settings.includes(params.setting)) {
      return false;
    }
    
    // Check subject if provided
    if (params.subject && 
        eligibilityConfig.subjects.length > 0 && 
        !eligibilityConfig.subjects.includes(params.subject)) {
      return false;
    }
    
    // Check genre if provided
    if (params.genre && 
        eligibilityConfig.genres.length > 0 && 
        !eligibilityConfig.genres.includes(params.genre)) {
      return false;
    }
    
    return true;
  };

  // Process a bid transaction
  const placeBid = async (params: BidParams): Promise<boolean> => {
    const { experienceId, amount, expiryDate } = params;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if user has UIMA account
      if (!state.uimaAccount) {
        dispatch({ type: 'SET_ERROR', payload: 'No UIMA account available' });
        return false;
      }
      
      // Check if user has sufficient UIMA credit
      if (state.uimaAccount.weeklyCredit < amount) {
        dispatch({ type: 'SET_ERROR', payload: 'Insufficient UIMA credit' });
        return false;
      }
      
      // Create allocation record
      const allocation: UIMAllocation = {
        experienceId,
        amount,
        type: 'bid',
        status: 'pending',
        expiryDate
      };
      
      // Add allocation
      dispatch({ type: 'ADD_UIMA_ALLOCATION', payload: allocation });
      
      // Update UIMA balance
      dispatch({
        type: 'UPDATE_UIMA_BALANCE',
        payload: state.uimaAccount.weeklyCredit - amount
      });
      
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to place bid' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Calculate mining rewards
  const calculateMining = (experience: any): number => {
    // Simple implementation based on capacity
    const baseAmount = experience.capacity?.target ? experience.capacity.target * 100 : 1000;
    return Math.floor(baseAmount * 0.8); // 80% of base for mining
  };

  // Track pending mining task
  const trackPending = async (task: MiningPendingTask): Promise<void> => {
    dispatch({ type: 'SET_MINING_TASK', payload: task });
  };

  // Process mining reward
  const processMiningReward = async (taskId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Find the task
      const task = state.uimaAccount?.miningPending.find(t => t.id === taskId);
      if (!task) {
        dispatch({ type: 'SET_ERROR', payload: 'Mining task not found' });
        return false;
      }
      
      // Update task status
      dispatch({
        type: 'UPDATE_MINING_TASK',
        payload: { id: taskId, status: 'completed' }
      });
      
      // Create transaction record for mining reward
      if (state.mainAccount) {
        const transaction: Transaction = {
          id: `mining-${taskId}`,
          fromAccountId: 'system',
          toAccountId: state.mainAccount.id,
          amount: task.amount,
          type: 'mining',
          status: 'completed',
          timestamp: new Date(),
          metadata: {
            experienceId: task.experienceId,
            taskId: task.id
          }
        };
        
        // Add transaction
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        
        // Update main balance
        dispatch({
          type: 'UPDATE_MAIN_BALANCE',
          payload: state.mainAccount.balance + task.amount
        });
      }
      
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to process mining reward' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Create context value
  const contextValue: RKSContextValue = {
    state,
    dispatch,
    
    accounts: {
      getMainBalance: () => state.mainAccount?.balance || 0,
      getUIMABalance: () => state.uimaAccount?.weeklyCredit || 0,
      getLockedAmount: () => state.mainAccount?.lockedAmount || 0,
      getPendingMining: () => {
        const pendingTasks = state.uimaAccount?.miningPending.filter(
          task => task.status === 'pending'
        ) || [];
        return pendingTasks.reduce((sum, task) => sum + task.amount, 0);
      },
      creditWeeklyUIMA
    },
    
    transactions: {
      transfer: async (params: TransferParams) => {
        // Implementation would handle transfer between accounts
        // Simplified for MVP
        return true;
      },
      placeBid,
      validateTransaction: (transaction: Transaction) => {
        // Basic validation
        return transaction.amount > 0 && !!transaction.fromAccountId && !!transaction.toAccountId;
      },
      getTransactionHistory: () => state.mainAccount?.transactions || []
    },
    
    mining: {
      calculateMining,
      trackPending,
      processMiningReward
    },
    
    eligibility: {
      checkEligibility,
      getEligibleTypes: () => state.eligibilityConfig.types,
      getEligibleSettings: () => state.eligibilityConfig.settings
    },
    
    balance: {
      calculateXYBalance,
      adjustToMaintainBalance
    },
    
    evolution: {
      upgradeRKS: async (migration: MigrationStrategy) => {
        // Implementation would handle evolution
        // Simplified for MVP
      },
      validateVersion: (version: Version) => {
        return version.major >= state.evolution.version.major;
      }
    },
    
    // RKS Allocation calculation
    calculateRKSAllocation: (params: {
      experienceType: string;
      experienceSetting: string;
      capacity: number;
      hostCount: number;
      domain?: string;
    }) => {
      const { experienceType, experienceSetting, capacity, hostCount } = params;
      
      // Default allocation calculation
      const baseAmount = 3000; // Base RKS per attendee
      const total = baseAmount * capacity * 2; // x2 for mining
      
      // Breakdown according to the specification
      return {
        total,
        breakdown: {
          host: total * 0.2,
          attendees: total * 0.5,
          curator: total * 0.05,
          venue: total * 0.1,
          production: total * 0.1,
          ai: total * 0.05
        },
        mining: {
          available: total * 0.5, // 50% for mining
          locked: 0,
          distributed: 0
        }
      };
    }
  };

  return (
    <RKSContext.Provider value={contextValue}>
      {children}
    </RKSContext.Provider>
  );
};