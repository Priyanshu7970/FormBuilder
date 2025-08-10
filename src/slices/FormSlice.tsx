
import { createSlice } from '@reduxjs/toolkit';
import type  {PayloadAction}  from '@reduxjs/toolkit';
import type { FormConfiguration,FormsState } from '../types/formTypes';



const initialFormsState: FormsState = {
  forms: [],
  loading: true, // Still true initially, as we load from localStorage
  error: null,
};

export const formsSlice = createSlice({
  name: 'forms',
  initialState: initialFormsState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setForms: (state, action: PayloadAction<FormConfiguration[]>) => {
      state.forms = action.payload.sort((a, b) => b.createdAt - a.createdAt);
    },
    addFormLocally: (state, action: PayloadAction<FormConfiguration>) => {
      state.forms.unshift(action.payload);
      state.forms.sort((a, b) => b.createdAt - a.createdAt);
    },
    updateFormLocally: (state, action: PayloadAction<FormConfiguration>) => {
      const index = state.forms.findIndex(form => form.id === action.payload.id);
      if (index !== -1) {
        state.forms[index] = action.payload;
        state.forms.sort((a, b) => b.createdAt - a.createdAt);
      }
    },
    deleteFormLocally: (state, action: PayloadAction<string>) => {
      state.forms = state.forms.filter(form => form.id !== action.payload);
    },
  },
});
