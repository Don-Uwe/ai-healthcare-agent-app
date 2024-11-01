import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user_id: '',
    user_token: '',
  },

  reducers: {
    setUserId(state, action) {
      state.user_id = action.payload;
    },

    setUserToken(state, action) {
      state.user_token = action.payload;
    },
    resetUserState(state) {
      state.user_id = '';
      state.user_token = '';
    },
  },
});

export const {setUserId, setUserToken, resetUserState} = userSlice.actions;

export default userSlice.reducer;