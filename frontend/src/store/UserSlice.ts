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
  },
});

export const {setUserId, setUserToken} = userSlice.actions;

export default userSlice.reducer;
