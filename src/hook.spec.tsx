import React from 'react';
import { act } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import { vm, Watchable } from './index'; // Assuming hooks are imported from the same file
import { ReactNode, useRef } from 'react';

// Dummy state class
class NestedState implements Watchable {
  foo = 'bar';
  '@@properties' = ['foo'];

  setFoo(newFoo: string) {
    this.foo = newFoo;
  }
}
class MyState implements Watchable {
  count = 0;
  text = '';
  nested = new NestedState();
  other = 'unwatched';

  '@@properties' = ['count', 'text'];

  increment() {
    this.count++;
  }

  setText(newText: string) {
    this.text = newText;
  }

  setOther(newOther: string) {
    this.other = newOther;
  }
}

// Helper to wrap in the context provider
const renderWithProvider = (ui: ReactNode, state: any) => {
  return render(
    <vm.ViewModelProvider model={state}>{ui}</vm.ViewModelProvider>,
  );
};

// Tests for useViewModel and useSubscribe
describe('useViewModel and useSubscribe', () => {
  test('subscribes to count and triggers re-render only when count changes', () => {
    const state = new MyState();

    const CountComponent = () => {
      const count = vm.useSubscribe(state, (s) => s.count);
      const renderCount = useRef(0); // Counter for the number of renders
      renderCount.current += 1; // Increment on each render

      return (
        <div>
          <div>Count: {count}</div>
          <p>Renders: {renderCount.current}</p>
        </div>
      );
    };

    const { rerender } = renderWithProvider(<CountComponent />, state);

    // Initial render, count should be 0
    expect(screen.getByText('Count: 0')).toBeDefined();

    // Act to change count
    act(() => {
      state.increment();
    });

    // Trigger re-render
    rerender(<CountComponent />);

    // After state change, count should update to 1
    expect(screen.getByText('Count: 1')).toBeDefined();

    // Act to change count
    act(() => {
      state.setText('Hello, World!');
    });

    // Count should still be 1, because only text changed
    expect(screen.getByText('Count: 1')).toBeDefined();
  });

  test('subscribes to nested property and triggers re-render only when count changes', () => {
    const state = new MyState();

    const CountComponent = () => {
      const foo = vm.useSubscribe(state, (s) => s.nested.foo);
      const renderCount = useRef(0); // Counter for the number of renders
      renderCount.current += 1; // Increment on each render

      return (
        <div>
          <div>Foo: {foo}</div>
          <p>Renders: {renderCount.current}</p>
        </div>
      );
    };

    const { rerender } = renderWithProvider(<CountComponent />, state);

    // Initial render, count should be 0
    expect(screen.getByText('Foo: bar')).toBeDefined();

    // Act to change count
    act(() => {
      state.nested.setFoo('baz');
    });

    // Trigger re-render
    rerender(<CountComponent />);

    // After state change, count should update to 1
    expect(screen.getByText('Foo: baz')).toBeDefined();
  });

  test('does not re-render when unrelated property changes', () => {
    const state = new MyState();

    const CountComponent = () => {
      const count = vm.useSubscribe(state, (s) => s.count);
      return <div>Count: {count}</div>;
    };

    const { rerender } = renderWithProvider(<CountComponent />, state);

    // Initial render, count should be 0
    expect(screen.getByText('Count: 0')).toBeDefined();

    // Change unrelated property
    act(() => {
      state.setText('New Text');
    });

    // Trigger re-render
    rerender(<CountComponent />);

    // Count should still be 0, because only text changed
    expect(screen.getByText('Count: 0')).toBeDefined();
  });

  test('re-renders when text property changes', () => {
    const state = new MyState();

    const TextComponent = () => {
      const text = vm.useSubscribe(state, (s) => s.text);
      return <div>Text: {text}</div>;
    };

    const { rerender } = renderWithProvider(<TextComponent />, state);

    // Initial render, text should be empty
    expect(screen.getByText('Text:')).toBeDefined();

    // Change text property
    act(() => {
      state.setText('Hello, World!');
    });

    // Trigger re-render
    rerender(<TextComponent />);

    // Text should update after state change
    expect(screen.getByText('Text: Hello, World!')).toBeDefined();
  });

  test('do not rerender when unwatched property changes', () => {
    const state = new MyState();

    const TextComponent = () => {
      const text = vm.useSubscribe(state, (s) => s.text);
      return <div>Text: {text}</div>;
    };

    const { rerender } = renderWithProvider(<TextComponent />, state);

    // Initial render, text should be empty
    expect(screen.getByText('Text:')).toBeDefined();

    // Change unwatched property
    act(() => {
      state.setOther('New Value');
    });

    // Trigger re-render
    rerender(<TextComponent />);

    // Text should still be empty, because only nested property changed
    expect(screen.getByText('Text:')).toBeDefined();
  })
});
