import { useContext } from 'react';
import { StateContext } from '../context/StateContext';

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};

export const useStateSelector = <T>(selector: (state: StateSystem) => T): T => {
  const { state } = useStateContext();
  return React.useMemo(() => selector(state), [state, selector]);
};