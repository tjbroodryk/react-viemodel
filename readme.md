# ViewModel State Management with React and TypeScript

This project aims to provide an simple and efficient **ViewModel pattern** using proxy objects to manage class-based state objects. It allows you to pass a class as state, encapsulating your business logic within methods, and ensuring that only subscribed components re-render when a specific property changes.

---

## Features

1. **Class-Based State Management**: Define a class that holds your state and logic, and use it directly in your components.
2. **Selective Re-Renders**: Only components that subscribe to a specific property of the state will re-render when that property changes, optimizing performance.
3. **ViewModel Pattern**: This implementation closely follows the ViewModel pattern, making it ideal for applications that require clear separation between business logic and UI.

---

## Installation

To install the necessary dependencies:

```bash
npm install @tjaybroodryk/react-viewmodel
```

---

## API Overview

### 1. `useViewModel`
This hook takes an instance of your class (state object) and returns a proxy that ensures state updates trigger re-renders only for the necessary properties.

### 2. `useSubscribe`
This hook allows a component to subscribe to specific properties of the ViewModel. The component will only re-render when the watched property changes.

### 3. `ProvideViewModel`
This is a context provider that supplies the ViewModel to the entire subtree. Use it to pass the state down through your component tree.

---

## Example Usage

Let's walk through how to use the hooks in a simple example.

### Step 1: Define Your ViewModel Class

First, create your ViewModel class with properties and methods to manage the state.

```typescript
class MyViewModel {
  count = 0;
  text = '';
  other = ''
  ['@@properties'] = ['count', 'text']; // Define the properties to watch

  increment() {
    this.count++;
  }

  changeOther(value: string) {
    this.other = value// this does not cause a state update, as it is not declared in the properties array
  }

  setText(newText: string) {
    this.text = newText;
  }
}
```

### Step 2: Use `useViewModel` and `useSubscribe` in Your Components

Next, use the `useViewModel` hook in a top-level component to manage the state, and the `useSubscribe` hook in child components to react to specific property changes.

```typescript
import React from 'react';
import { useViewModel, useSubscribe, ProvideViewModel } from './StateContext'; // Assuming hooks are in StateContext.ts

// Component subscribing to the "count" property
const CountComponent = () => {
  const count = useSubscribe((state) => state.count); // Subscribe to count
  return <div>Count: {count}</div>;
};

// Component subscribing to the "text" property
const TextComponent = () => {
  const text = useSubscribe<MyViewModel, string>((state) => state.text); // Subscribe to text
  return <div>Text: {text}</div>;
};

// Main component
const App = () => {
  const viewModel = new MyViewModel();

  return (
    <ProvideViewModel model={viewModel}>
      <h1>ViewModel with Selective Re-Renders</h1>
      <CountComponent />
      <TextComponent />
      <StateActions />
    </ProvideViewModel>
  );
};

// Component to trigger state changes
const StateActions = () => {
  const viewModel = useViewModel<MyViewModel>();

  return (
    <div>
      <button onClick={() => viewModel.increment()}>Increment Count</button>
      <button onClick={() => viewModel.setText('Hello World')}>Set Text</button>
    </div>
  );
};

export default App;
```

### Step 3: Render the App

Now render the `App` component. The `ProvideViewModel` context provider passes the ViewModel down the tree. The child components (`CountComponent` and `TextComponent`) will only re-render when their respective subscribed properties (`count` and `text`) change.

---

## API Documentation

### `useViewModel`

```
function useViewModel<T>(initialState: T): T;
```

- **Purpose**: Creates a proxy for your state, handling updates and ensuring only the relevant components re-render when state properties change.
- **Parameters**: `initialState` – The ViewModel class instance (e.g., `new MyViewModel()`).
- **Returns**: A proxied state object that can be used in components.

### `useSubscribe`

```typescript
function useSubscribe<T, P>(selector: (state: T) => P): P;
```

- **Purpose**: Subscribes a component to a specific property from the ViewModel. The component will re-render only when the selected property changes.
- **Parameters**:
  - `selector`: A function that selects a specific property from the ViewModel (e.g., `(state) => state.count`).
- **Returns**: The selected property.

### `ProvideViewModel`

```typescript
function ProvideViewModel<T>({ children, initialState }: { children: ReactNode; initialState: T }): JSX.Element;
```

- **Purpose**: Provides the ViewModel to the entire React tree below it using React Context.
- **Parameters**:
  - `children`: The child components that should have access to the ViewModel.
  - `initialState`: The ViewModel instance to be shared (e.g., `new MyViewModel()`).
- **Returns**: A `JSX.Element` that wraps the child components with the ViewModel context.

---

## Tests

To ensure the behavior of the ViewModel and hooks, tests are written using **Vitest**. The test suite checks:
1. Initial state setup.
2. Selective re-renders of subscribed properties.
3. Non-re-rendering when unrelated properties change.

To run tests:

```bash
yarn test
```

---

## Conclusion

This ViewModel approach is a clean and efficient way to manage state in React, particularly in complex applications. By subscribing only to specific properties, you can optimize performance by preventing unnecessary re-renders. This approach also fits well with the ViewModel pattern, enabling you to keep business logic within the state class.
