import {createSlice} from '@reduxjs/toolkit';
const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
  reducers: {
    showAlert(state, action) {
      state.visible = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.onConfirm = action.payload.onConfirm || null;
      state.onCancel = action.payload.onCancel || null;
    },
    hideAlert(state) {
      state.visible = false;
      state.title = '';
      state.message = '';
      state.onConfirm = null;
      state.onCancel = null;
    },
  },
});

export const {showAlert, hideAlert} = alertSlice.actions;
export default alertSlice.reducer;
