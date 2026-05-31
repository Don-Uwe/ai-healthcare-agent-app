import {configureStore} from '@reduxjs/toolkit';
import NetworkSlice from './NetworkSlice';
import dataReducer from './dataSlice';
import userReducer from './UserSlice';
import alertReducer from './alertSlice';

const store = configureStore({
  reducer: {
    network: NetworkSlice,
    data: dataReducer,
    user: userReducer,
    alert: alertReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;