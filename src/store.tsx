import { configureStore } from "@reduxjs/toolkit";
import { formsSlice } from "./slices/FormSlice";

export const store = configureStore({
  reducer: {
    forms: formsSlice.reducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;