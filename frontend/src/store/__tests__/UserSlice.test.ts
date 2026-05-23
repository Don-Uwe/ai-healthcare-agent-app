import reducer, {
  setUserId,
  setSocialUserId,
  setUserToken,
  setUserHandle,
  setGuestMode,
  resetUserState,
} from '../UserSlice';

describe('UserSlice reducers', () => {
  const initialState = {
    user_id: '',
    user_token: '',
    user_handle: '',
    social_user_id: '',
    isGuest: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUserId', () => {
    const actual = reducer(initialState, setUserId('test_id_123'));
    expect(actual.user_id).toEqual('test_id_123');
  });

  it('should handle setSocialUserId', () => {
    const actual = reducer(initialState, setSocialUserId('social_123'));
    expect(actual.social_user_id).toEqual('social_123');
  });

  it('should handle setUserToken', () => {
    const actual = reducer(initialState, setUserToken('token_abc'));
    expect(actual.user_token).toEqual('token_abc');
  });

  it('should handle setUserHandle', () => {
    const actual = reducer(initialState, setUserHandle('handle_xyz'));
    expect(actual.user_handle).toEqual('handle_xyz');
  });

  it('should handle setGuestMode', () => {
    const actual = reducer(initialState, setGuestMode(true));
    expect(actual.isGuest).toEqual(true);
  });

  it('should handle resetUserState', () => {
    const modifiedState = {
      user_id: 'test_id_123',
      user_token: 'token_abc',
      user_handle: 'handle_xyz',
      social_user_id: 'social_123',
      isGuest: true,
    };
    const actual = reducer(modifiedState, resetUserState());
    expect(actual).toEqual(initialState);
  });
});
