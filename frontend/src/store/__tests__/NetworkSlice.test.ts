import reducer, { setConnected } from '../NetworkSlice';

describe('NetworkSlice reducers', () => {
  const initialState = {
    isConnected: true,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setConnected to false', () => {
    const actual = reducer(initialState, setConnected(false));
    expect(actual.isConnected).toEqual(false);
  });

  it('should handle setConnected to true', () => {
    const disconnectedState = { isConnected: false };
    const actual = reducer(disconnectedState, setConnected(true));
    expect(actual.isConnected).toEqual(true);
  });
});
