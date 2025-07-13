import {configureStore} from '@reduxjs/toolkit';
import NetworkSlice from './NetworkSlice';
import dataReducer from './dataSlice';
import userReducer from './UserSlice';

const store = configureStore({
  reducer: {
    network: NetworkSlice,
    data: dataReducer,
    user: userReducer
  },
});

export default store;