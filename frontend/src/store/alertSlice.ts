import { createSlice } from "@reduxjs/toolkit";
const alertSlice = createSlice({
  name: "alert",
  initialState: {
    visible: false,
    title: "",
    message: "",
  },
  reducers: {
    showAlert(state, action) {
      state.visible = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
    },
    hideAlert(state) {
      state.visible = false;
      state.title = "";
      state.message = "";
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;