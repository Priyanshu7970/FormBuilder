export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'checkbox' | 'radio' | 'select' | 'date' | 'derived';
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean | null;
  options?: string[]; // Used for radio and select
  minLength?: number; // Used for text and textarea
  maxLength?: number; // Used for text and textarea
  pattern?: string; // Used for text and textarea (regex)
  // Properties for derived fields
  isDerived?: boolean;
  parentFieldIds?: string[];
  formula?: string; // JavaScript expression for calculation
}

/**
 * Defines the overall structure for a form configuration.
 * @interface FormConfiguration
 * @property {string} id - Unique identifier for the form.
 * @property {string} name - The name of the form.
 * @property {FormField[]} fields - An array of field configurations for the form.
 * @property {number} createdAt - Timestamp of when the form was created.
 */
export interface FormConfiguration {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: number;
}
export interface FormsState {
  forms: FormConfiguration[];
  loading: boolean;
  error: string | null;
}
