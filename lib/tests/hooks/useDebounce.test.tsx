import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderDebounce = (initialValue = 'a', delay = 1000) =>
    renderHook(({ value }) => useDebounce(value, delay), {
      initialProps: { value: initialValue },
    });

  it('uses the default delay of 500ms when delay is not provided', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  it('does not update before delay', () => {
    const { result, rerender } = renderDebounce();

    expect(result.current).toBe('a');

    rerender({
      value: 'ab',
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });

    expect(result.current).toBe('a');
  });

  it('only updates after the delay', () => {
    const { result, rerender } = renderDebounce();

    expect(result.current).toBe('a');

    rerender({
      value: 'ab',
    });

    act(() => {
      jest.advanceTimersByTime(1001);
    });

    expect(result.current).toBe('ab');
  });

  it('only keeps the last value after rapid changes', () => {
    const { result, rerender } = renderDebounce();

    rerender({ value: 'ab' });
    act(() => jest.advanceTimersByTime(200));

    rerender({ value: 'abc' });
    act(() => jest.advanceTimersByTime(200));

    rerender({ value: 'abcd' });
    act(() => jest.advanceTimersByTime(1001));

    expect(result.current).toBe('abcd');
  });

  it('does not update after unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    unmount();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });
});
