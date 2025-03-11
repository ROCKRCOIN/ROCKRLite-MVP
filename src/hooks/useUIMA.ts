import { useContext } from 'react';
import { UIMAContext, UIMAContextValue, UIMACreditStatus, UIMAEligibilityResult, UIMABidResult } from '../context/UIMAContext';
import { UIMAAccount, UIMAllocation, MiningPendingTask } from '../context/RKSContext';

/**
 * Hook to access the UIMA context
 * @returns The UIMA context value
 * @throws Error if used outside of a UIMAProvider
 */
export const useUIMA = (): UIMAContextValue => {
  const context = useContext(UIMAContext);
  
  if (context === undefined) {
    throw new Error('useUIMA must be used within a UIMAProvider');
  }
  
  return context;
};

/**
 * Hook to access UIMA account information
 * @returns Object containing UIMA account data
 */
export const useUIMAAccount = (): {
  account: UIMAAccount | null;
  creditStatus: UIMACreditStatus;
  allocations: UIMAllocation[];
  pendingMining: MiningPendingTask[];
} => {
  const { account } = useUIMA();
  
  return {
    account: account.getAccount(),
    creditStatus: account.getCreditStatus(),
    allocations: account.getAllocations(),
    pendingMining: account.getPendingMining()
  };
};

/**
 * Hook to access UIMA bidding functionality
 * @returns Object containing bidding functions
 */
export const useUIMABidding = () => {
  const { bidding } = useUIMA();
  
  return {
    placeBid: bidding.placeBid,
    cancelBid: bidding.cancelBid,
    bidHistory: bidding.getBidHistory()
  };
};

/**
 * Hook to access UIMA eligibility checking
 * @returns Object containing eligibility functions
 */
export const useUIMAEligibility = () => {
  const { eligibility } = useUIMA();
  
  return {
    checkEligibility: eligibility.checkEligibility,
    getRecommendedBid: eligibility.getRecommendedBid
  };
};

/**
 * Hook to access UIMA mining functionality
 * @returns Object containing mining functions
 */
export const useUIMAMining = () => {
  const { mining } = useUIMA();
  
  return {
    registerMiningTask: mining.registerMiningTask,
    miningHistory: mining.getMiningHistory(),
    checkMiningStatus: mining.checkMiningStatus
  };
};

/**
 * Hook to access UIMA credit management
 * @returns Object containing credit management functions
 */
export const useUIMACredits = () => {
  const { credits } = useUIMA();
  
  return {
    forceRefresh: credits.forceRefresh,
    weeklyCreditAmount: credits.getWeeklyCreditAmount(),
    expirationDate: credits.getExpirationDate()
  };
};

export default useUIMA;