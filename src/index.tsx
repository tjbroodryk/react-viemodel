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
  const createProxy = (obj: any): any => {
    const handler: ProxyHandler<any> = {
      get(target, prop: string | symbol, receiver) {
        const value = Reflect.get(target, prop, receiver);

        // If the property is an object and implements Watchable, recursively apply a proxy
        if (typeof value === 'object' && value !== null && 'properties' in value) {
          const watchableValue = value as Watchable;

          // Dynamically calculate properties for objects like `nodes`
          if (typeof target === 'object' && !Array.isArray(target) && target !== null) {
            // The properties array will be the dynamic keys of the object (like `nodes`)
            watchableValue.properties = Object.keys(target);
          }

          if (watchableValue.properties.includes(prop as string)) {
            return createProxy(watchableValue);
          }
        }

        return value;
      },
      set(target, prop: string | symbol, value) {
        const isNestedProp = typeof prop === 'string' && prop.includes('.');

        // Only allow setting if the property is watchable
        if (
          target[prop as keyof T] !== value &&
          (target.properties.includes(prop as string) || isNestedProp)
        ) {
          target[prop as keyof T] = value;
        }

        return true;
      },
    };

    return new Proxy(obj, handler);
  };

  // Create the proxy for the initial stateController
  return useMemo(() => createProxy(stateController), [stateController]);
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
