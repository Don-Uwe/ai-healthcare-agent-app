import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user_id: '',
    user_token: '',
    user_handle: '',
  },

  reducers: {
    setUserId(state, action) {
      state.user_id = action.payload;
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
    },
  },
});

export const {setUserId, setUserToken, setUserHandle, resetUserState} =
  userSlice.actions;

export default userSlice.reducer;
