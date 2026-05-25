/// <reference types="jest" />

import reducer, { showAlert, hideAlert } from '../alertSlice';

type AlertState = Parameters<typeof reducer>[0];

describe('alertSlice reducers', () => {
  const initialState: AlertState = {
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle showAlert', () => {
    const mockPayload = {
      title: 'Warning',
      message: 'Are you sure?',
      onConfirm: () => {},
      onCancel: () => {},
    };

    const actual = reducer(initialState, showAlert(mockPayload));

    expect(actual.visible).toEqual(true);
    expect(actual.title).toEqual('Warning');
    expect(actual.message).toEqual('Are you sure?');
    expect(actual.onConfirm).toBe(mockPayload.onConfirm);
    expect(actual.onCancel).toBe(mockPayload.onCancel);
  });

  it('should handle showAlert without optional callbacks', () => {
    const mockPayload = {
      title: 'Success',
      message: 'Operation completed',
    };

    const actual = reducer(initialState, showAlert(mockPayload));

    expect(actual.visible).toEqual(true);
    expect(actual.title).toEqual('Success');
    expect(actual.message).toEqual('Operation completed');
    expect(actual.onConfirm).toBeNull();
    expect(actual.onCancel).toBeNull();
  });

  it('should handle hideAlert', () => {
    const visibleState: AlertState = {
      visible: true,
      title: 'Warning',
      message: 'Are you sure?',
      onConfirm: null,
      onCancel: null,
    };

    const actual = reducer(visibleState, hideAlert());

    expect(actual).toEqual(initialState);
  });
});