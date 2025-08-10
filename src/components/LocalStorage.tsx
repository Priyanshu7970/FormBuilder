
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
export function loadFormsFromLocalStorage(): FormConfiguration[] {
  try {
    const jsonString = localStorage.getItem('users');
    return jsonString ? JSON.parse(jsonString) : [];
  } catch (e) {
    console.error("Error loading forms from localStorage:", e);
    return [];
  }
}

export function saveFormsToLocalStorage(forms: FormConfiguration[]) {
  try {
    localStorage.setItem('users', JSON.stringify(forms));
  } catch (e) {
    console.error("Error saving forms to localStorage:", e);
  }
}