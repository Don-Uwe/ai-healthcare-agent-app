import {configureStore} from '@reduxjs/toolkit';
import NetworkSlice from './NetworkSlice';
import articleReducer from './articleSlice';
import userReducer from './UserSlice';

const store = configureStore({
  reducer: {
    network: NetworkSlice,
    article: articleReducer,
    user: userReducer
  },
});

export default store;