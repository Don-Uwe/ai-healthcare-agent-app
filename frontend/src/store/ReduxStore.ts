import { configureStore } from '@reduxjs/toolkit';
import NetworkSlice from './NetworkSlice';




const store = configureStore({
  reducer: {
    network: NetworkSlice,
    // MORE REDUCER WILL ADD LATER
  },
});

export default store;