import { useContext } from 'react';
import { RKSContext, RKSContextValue } from '../context/RKSContext';

/**
 * Hook to access the RKS context
 * @returns The RKS context value
 * @throws Error if used outside of an RKSProvider
 */
export const useRKS = (): RKSContextValue => {
  const context = useContext(RKSContext);
  
  if (context === undefined) {
    throw new Error('useRKS must be used within an RKSProvider');
  }
  
  return context;
};

/**
 * Hook to access RKS balance information
 * @returns Object containing main and UIMA balances
 */
export const useRKSBalance = () => {
  const { accounts } = useRKS();
  
  return {
    mainBalance: accounts.getMainBalance(),
    uimaBalance: accounts.getUIMABalance(),
    lockedAmount: accounts.getLockedAmount(),
    pendingMining: accounts.getPendingMining(),
    totalAvailable: accounts.getMainBalance() - accounts.getLockedAmount()
  };
};

/**
 * Hook to access RKS transaction functionality
 * @returns Object containing transaction functions
 */
export const useRKSTransactions = () => {
  const { transactions } = useRKS();
  
  return {
    transfer: transactions.transfer,
    placeBid: transactions.placeBid,
    validateTransaction: transactions.validateTransaction,
    transactionHistory: transactions.getTransactionHistory()
  };
};

/**
 * Hook to access RKS balance calculation utilities
 * @returns Object containing balance calculation functions
 */
export const useRKSBalanceCalculation = () => {
  const { balance } = useRKS();
  
  return {
    calculateXYBalance: balance.calculateXYBalance,
    adjustToMaintainBalance: balance.adjustToMaintainBalance
  };
};

/**
 * Hook to access RKS mining functionality
 * @returns Object containing mining functions
 */
export const useRKSMining = () => {
  const { mining } = useRKS();
  
  return {
    calculateMining: mining.calculateMining,
    trackPending: mining.trackPending,
    processMiningReward: mining.processMiningReward
  };
};

export default useRKS;