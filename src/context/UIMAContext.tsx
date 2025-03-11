import React, { createContext, useContext, useEffect, useRef } from 'react';
import { RKSContext, UIMAAccount, UIMAllocation, MiningPendingTask } from './RKSContext';
import type { Domain } from '../interfaces/domain/types';

// UIMA-specific types
export interface UIMAEligibilityResult {
  isEligible: boolean;
  reason?: string;
  maxBidAmount?: number;
}

export interface UIMACreditStatus {
  weeklyCredit: number;
  used: number;
  remaining: number;
  nextRefresh: Date;
  isRefreshPending: boolean;
}

export interface UIMABidResult {
  success: boolean;
  error?: string;
  allocation?: UIMAllocation;
  remainingCredit?: number;
}

// Context value interface
export interface UIMAContextValue {
  // Account status
  account: {
    getAccount: () => UIMAAccount | null;
    getCreditStatus: () => UIMACreditStatus;
    getAllocations: () => UIMAllocation[];
    getPendingMining: () => MiningPendingTask[];
  };
  
  // Bid management
  bidding: {
    placeBid: (experienceId: string, amount: number) => Promise<UIMABidResult>;
    cancelBid: (allocationId: string) => Promise<boolean>;
    getBidHistory: () => UIMAllocation[];
  };
  
  // Eligibility checking
  eligibility: {
    checkEligibility: (params: any) => UIMAEligibilityResult;
    getRecommendedBid: (experienceId: string) => number;
  };
  
  // Mining operations
  mining: {
    registerMiningTask: (experienceId: string, amount: number) => Promise<boolean>;
    getMiningHistory: () => MiningPendingTask[];
    checkMiningStatus: (taskId: string) => string;
  };
  
  // Credit management
  credits: {
    forceRefresh: () => Promise<boolean>;
    getWeeklyCreditAmount: () => number;
    getExpirationDate: () => Date | null;
  };
}

// Create the context first to avoid circular reference
export const UIMAContext = createContext<UIMAContextValue | undefined>(undefined);

// UIMA Provider Component
export const UIMAProvider: React.FC<{
  children: React.ReactNode;
  domain?: Domain;
}> = ({ children, domain }) => {
  // Use the RKS context
  const rksContext = useContext(RKSContext);
  
  if (!rksContext) {
    throw new Error('UIMAProvider must be used within an RKSProvider');
  }
  
  const { state: rksState, dispatch, accounts, mining, eligibility } = rksContext;
  const stateRef = useRef(rksState);
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = rksState;
  }, [rksState]);
  
  // Get UIMA account
  const getAccount = () => rksState.uimaAccount;
  
  // Get UIMA credit status
  const getCreditStatus = (): UIMACreditStatus => {
    const account = rksState.uimaAccount;
    
    if (!account) {
      return {
        weeklyCredit: rksState.weeklyUimaCredit,
        used: 0,
        remaining: 0,
        nextRefresh: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isRefreshPending: false
      };
    }
    
    const now = new Date();
    const expiration = new Date(account.weeklyExpiration);
    const isRefreshPending = now > expiration;
    
    // Calculate used amount
    const allocations = account.allocations || [];
    const usedAmount = allocations
      .filter(a => a.status === 'pending' || a.status === 'locked')
      .reduce((sum, a) => sum + a.amount, 0);
    
    return {
      weeklyCredit: account.weeklyCredit,
      used: usedAmount,
      remaining: account.weeklyCredit - usedAmount,
      nextRefresh: expiration,
      isRefreshPending
    };
  };
  
  // Place a bid using UIMA credits
  const placeBid = async (
    experienceId: string,
    amount: number
  ): Promise<UIMABidResult> => {
    // Validate input
    if (!experienceId || amount <= 0) {
      return {
        success: false,
        error: 'Invalid bid parameters'
      };
    }
    
    const account = rksState.uimaAccount;
    
    // Check if account exists
    if (!account) {
      return {
        success: false,
        error: 'No UIMA account available'
      };
    }
    
    // Check credit availability
    const creditStatus = getCreditStatus();
    if (amount > creditStatus.remaining) {
      return {
        success: false,
        error: 'Insufficient UIMA credit'
      };
    }
    
    // Set expiry date (24 hours from now for simplicity)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    
    // Place bid through RKS context
    const success = await rksContext.transactions.placeBid({
      experienceId,
      amount,
      expiryDate
    });
    
    if (!success) {
      return {
        success: false,
        error: 'Failed to place bid'
      };
    }
    
    // Get the newly created allocation
    const updatedAccount = rksState.uimaAccount;
    const newAllocation = updatedAccount?.allocations.find(
      a => a.experienceId === experienceId && a.status === 'pending'
    );
    
    return {
      success: true,
      allocation: newAllocation,
      remainingCredit: updatedAccount?.weeklyCredit || 0
    };
  };
  
  // Cancel a bid
  const cancelBid = async (allocationId: string): Promise<boolean> => {
    const account = rksState.uimaAccount;
    
    // Check if account exists
    if (!account) {
      return false;
    }
    
    // Find the allocation
    const allocation = account.allocations.find(a => a.experienceId === allocationId);
    
    if (!allocation || allocation.status !== 'pending') {
      return false;
    }
    
    // Update allocation status
    dispatch({
      type: 'UPDATE_UIMA_ALLOCATION',
      payload: { id: allocationId, status: 'cancelled' }
    });
    
    // Refund the credits
    dispatch({
      type: 'UPDATE_UIMA_BALANCE',
      payload: account.weeklyCredit + allocation.amount
    });
    
    return true;
  };
  
  // Check experience eligibility for UIMA
  const checkEligibility = (params: any): UIMAEligibilityResult => {
    // Check if experience is eligible for UIMA funding
    const isEligible = eligibility.checkEligibility({
      type: params.type,
      setting: params.setting,
      subject: params.subject,
      genre: params.genre
    });
    
    if (!isEligible) {
      return {
        isEligible: false,
        reason: 'Experience type, setting, subject, or genre not eligible for UIMA funding'
      };
    }
    
    // Get the credit status
    const creditStatus = getCreditStatus();
    
    // Check if user has sufficient UIMA credit
    if (creditStatus.remaining <= 0) {
      return {
        isEligible: false,
        reason: 'No UIMA credits available'
      };
    }
    
    // Return result with max bid amount
    return {
      isEligible: true,
      maxBidAmount: Math.min(creditStatus.remaining, rksState.targetSeatPrice / 2) // 3000 RKS default (half of 6000)
    };
  };
  
  // Get recommended bid for an experience
  const getRecommendedBid = (experienceId: string): number => {
    // Default to half of target seat price (3000 RKS)
    return rksState.targetSeatPrice / 2;
  };
  
  // Register a mining task
  const registerMiningTask = async (
    experienceId: string,
    amount: number
  ): Promise<boolean> => {
    try {
      // Create task
      const task: MiningPendingTask = {
        id: `mining-${experienceId}-${Date.now()}`,
        experienceId,
        amount,
        status: 'pending',
        createdAt: new Date()
      };
      
      // Track the pending mining task
      await mining.trackPending(task);
      
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Force refresh UIMA credits
  const forceRefresh = async (): Promise<boolean> => {
    try {
      await accounts.creditWeeklyUIMA();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Create context value
  const contextValue: UIMAContextValue = {
    account: {
      getAccount,
      getCreditStatus,
      getAllocations: () => rksState.uimaAccount?.allocations || [],
      getPendingMining: () => rksState.uimaAccount?.miningPending || []
    },
    
    bidding: {
      placeBid,
      cancelBid,
      getBidHistory: () => {
        return (rksState.uimaAccount?.allocations || [])
          .filter(a => a.type === 'bid')
          .sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());
      }
    },
    
    eligibility: {
      checkEligibility,
      getRecommendedBid
    },
    
    mining: {
      registerMiningTask,
      getMiningHistory: () => {
        return (rksState.uimaAccount?.miningPending || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      checkMiningStatus: (taskId: string) => {
        const task = rksState.uimaAccount?.miningPending.find(t => t.id === taskId);
        return task?.status || 'not_found';
      }
    },
    
    credits: {
      forceRefresh,
      getWeeklyCreditAmount: () => rksState.weeklyUimaCredit,
      getExpirationDate: () => {
        return rksState.uimaAccount?.weeklyExpiration 
          ? new Date(rksState.uimaAccount.weeklyExpiration) 
          : null;
      }
    }
  };
  
  return (
    <UIMAContext.Provider value={contextValue}>
      {children}
    </UIMAContext.Provider>
  );
};

