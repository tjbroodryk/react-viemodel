import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from 'react';

import { useMemo } from 'react';

export interface Watchable {
  properties: string[];
}

export function useViewModel<T extends Watchable>(stateController: T): T {
  // Wrap the state controller in a Proxy
  const proxyState = useMemo(() => {
    return new Proxy(stateController, {
      set(target, prop: string | symbol, value) {
        if (
          target[prop as keyof T] !== value &&
          target.properties.includes(prop as string)
        ) {
          target[prop as keyof T] = value;
        }
        return true;
      },
    });
  }, [stateController]);

  return proxyState;
}

// Context definition
const StateContext = createContext<any>(null);

export function ViewModelProvider<T extends Watchable>({
  children,
  model: initialState,
}: {
  children: ReactNode;
  model: T;
}) {
  const stateController = useViewModel(initialState); // Proxy the state

  return (
    <StateContext.Provider value={stateController}>
      {children}
    </StateContext.Provider>
  );
}

// Custom hook to access the context (unchanging reference)
export function useViewModelContext<T>() {
  const context = useContext<T>(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
}

export function useSubscribe<T, P>(
  stateController: T,
  selector: (state: T) => P,
): P {
  const [, forceUpdate] = useState(0);
  const selectedValue = useRef<P>(selector(stateController)); // Store selected property value

  useEffect(() => {
    const checkForUpdates = () => {
      const newValue = selector(stateController);
      if (newValue !== selectedValue.current) {
        selectedValue.current = newValue;
        forceUpdate((x) => x + 1);
      }
    };

    // Setup mutation observer or subscription logic (based on a state change mechanism)
    // For simplicity, we'll just rely on React's rerender mechanism through forceUpdate

    checkForUpdates(); // Initial check on mount

    // Cleanup (if necessary)
    return () => {
      // Cleanup any observers if needed
    };
  }, [stateController, selector]);

  // Return the current selected value
  return selectedValue.current;
}

export const vm = {
  ViewModelProvider,
  useViewModel,
  useSubscribe,
  useViewModelContext,
};
