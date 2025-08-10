
import { createSlice } from '@reduxjs/toolkit';
import type  {PayloadAction}  from '@reduxjs/toolkit';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'checkbox' | 'radio' | 'select';
  placeholder?: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex for text fields (optional)
  options?: string[]; // For radio and select fields
}
interface FormConfiguration {
  id: string;
  // userId is no longer needed as there's no authentication
  name: string;
  fields: FormField[];
  createdAt: number; // Changed from Timestamp to number (for Date.now())
}
interface FormsState {
  forms: FormConfiguration[];
  loading: boolean;
  error: string | null;
  // userId and isAuthReady are no longer needed
}

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
    // Removed setUserId, setIsAuthReady reducers
    setForms: (state, action: PayloadAction<FormConfiguration[]>) => {
      state.forms = action.payload.sort((a, b) => b.createdAt - a.createdAt); // Sort by number
    },
    addFormLocally: (state, action: PayloadAction<FormConfiguration>) => {
      state.forms.unshift(action.payload); // Add to the beginning for latest first
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