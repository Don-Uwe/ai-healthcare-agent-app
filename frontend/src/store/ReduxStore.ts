import {configureStore} from '@reduxjs/toolkit';
import NetworkSlice from './NetworkSlice';
import articleReducer from './articleSlice';

const store = configureStore({
  reducer: {
    network: NetworkSlice,
    article: articleReducer,
  },
});

export default store;