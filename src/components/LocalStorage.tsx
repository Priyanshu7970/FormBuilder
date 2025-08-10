import type { FormConfiguration } from "../types/formTypes";

export function loadFormsFromLocalStorage(): FormConfiguration[] {
  try {
    const jsonString = localStorage.getItem('forms');
    return jsonString ? JSON.parse(jsonString) : [];
  } catch (e) {
    console.error("Error loading forms from localStorage:", e);
    return [];
  }
}

export function saveFormsToLocalStorage(forms: FormConfiguration[]) {
  try {
    localStorage.setItem('forms', JSON.stringify(forms));
  } catch (e) {
    console.error("Error saving forms to localStorage:", e);
  }
}