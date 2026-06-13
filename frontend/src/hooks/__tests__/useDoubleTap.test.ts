import { renderHook, act } from '@testing-library/react-native';
import { useDoubleTap } from '../useDoubleTap';

describe('useDoubleTap hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('triggers onSingleTap when tapped once after delay', () => {
    const onSingleTap = jest.fn();
    const onDoubleTap = jest.fn();

    const { result } = renderHook(() => useDoubleTap(onSingleTap, onDoubleTap, 300));

    act(() => {
      result.current();
    });

    expect(onSingleTap).not.toHaveBeenCalled();
    expect(onDoubleTap).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSingleTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).not.toHaveBeenCalled();
  });

  it('triggers onDoubleTap when tapped twice within delay', () => {
    const onSingleTap = jest.fn();
    const onDoubleTap = jest.fn();

    const { result } = renderHook(() => useDoubleTap(onSingleTap, onDoubleTap, 300));

    act(() => {
      result.current();
    });

    // Simulate short time pass
    act(() => {
      jest.advanceTimersByTime(100);
      jest.setSystemTime(new Date('2026-01-01T00:00:00.100Z'));
    });

    act(() => {
      result.current(); // Second tap
    });

    // Advance remaining time to ensure single tap doesn't fire
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    expect(onSingleTap).not.toHaveBeenCalled();
  });

  it('handles rapid single taps spaced further than delay', () => {
    const onSingleTap = jest.fn();
    const onDoubleTap = jest.fn();

    const { result } = renderHook(() => useDoubleTap(onSingleTap, onDoubleTap, 300));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(350);
      jest.setSystemTime(new Date('2026-01-01T00:00:00.350Z'));
    });

    expect(onSingleTap).toHaveBeenCalledTimes(1);

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(onSingleTap).toHaveBeenCalledTimes(2);
    expect(onDoubleTap).not.toHaveBeenCalled();
  });
});
