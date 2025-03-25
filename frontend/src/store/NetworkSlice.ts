import {createSlice} from '@reduxjs/toolkit';

const networkSlice = createSlice({
  name: 'Network',
  initialState: {
    isConnected: true,
  },

  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
  },
});

export const {setConnected} = networkSlice.actions;
export default networkSlice.reducer;
