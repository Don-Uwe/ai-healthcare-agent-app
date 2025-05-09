import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user_id: '',
    user_token: '',
    user_handle: '',
    social_user_id: '',
  },

  reducers: {
    setUserId(state, action) {
      state.user_id = action.payload;
    },

    setSocialUserId(state, action) {
      state.social_user_id = action.payload;
    },

    setUserToken(state, action) {
      state.user_token = action.payload;
    },
    setUserHandle(state, action) {
      state.user_handle = action.payload;
    },
    resetUserState(state) {
      state.user_id = '';
      state.user_token = '';
      state.user_handle = '';
      state.social_user_id = '';
    },
  },
});

export const {
  setUserId,
  setUserToken,
  setUserHandle,
  resetUserState,
  setSocialUserId,
} = userSlice.actions;

export default userSlice.reducer;
