import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { store } from "../store";
import { v4 as uuidv4 } from 'uuid';
import { formsSlice } from "../slices/FormSlice";
import { saveFormsToLocalStorage } from "./LocalStorage";
import { Box, Button, Card, Checkbox, Container, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography,CircularProgress, FormControlLabel } from "@mui/material";
import { MessageDialog } from "./MessageDialog";

import { Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Save as SaveIcon } from '@mui/icons-material';
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'checkbox' | 'radio' | 'select';
  placeholder?: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string; 
  options?: string[]; 
}

interface FormConfiguration {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: number; 
}
export  type RootState = ReturnType<typeof store.getState>;
export  type AppDispatch = typeof store.dispatch;
export const CreateForm: React.FC<{ navigate: (path: string, state?: any) => void, currentForm?: FormConfiguration | null }> = ({ navigate, currentForm }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, forms } = useSelector((state: RootState) => state.forms); 

  const [formName, setFormName] = useState(currentForm?.name || '');
  const [fields, setFields] = useState<FormField[]>(currentForm?.fields || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
const { setLoading, setError, addFormLocally, updateFormLocally } = formsSlice.actions;

  useEffect(() => {
    if (currentForm) {
      setFormName(currentForm.name);
      setFields(currentForm.fields);
    } else {
      setFormName('');
      setFields([]);
    }
  }, [currentForm]);

  const handleOpenDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const addField = () => {
    setFields([...fields, {
      id: uuidv4(),
      label: '',
      type: 'text',
      required: false,
    }]);
  };

  const updateField = (index: number, key: keyof FormField, value: any) => {
    const newFields = [...fields];
    // Special handling for options to ensure they are always an array
    if (key === 'options' && typeof value === 'string') {
        newFields[index][key] = value.split(',').map(s => s.trim());
    } else {
        (newFields[index] as any)[key] = value;
    }
    setFields(newFields);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSaveForm = () => { // Changed to synchronous as localStorage is sync
    if (!formName.trim()) {
      handleOpenDialog('Validation Error', 'Form name cannot be empty.');
      return;
    }
    if (fields.length === 0) {
      handleOpenDialog('Validation Error', 'Please add at least one field to the form.');
      return;
    }
    for (const field of fields) {
      if (!field.label.trim()) {
        handleOpenDialog('Validation Error', 'All field labels must be filled.');
        return;
      }
      if ((field.type === 'radio' || field.type === 'select') && (!field.options || field.options.length === 0 || field.options.every(o => o.trim() === ''))) {
        handleOpenDialog('Validation Error', `Field "${field.label}" of type ${field.type} requires at least one option.`);
        return;
      }
    }

    dispatch(setLoading(true)); 
    try {
      const formConfig: FormConfiguration = {
        id: currentForm?.id || uuidv4(),
        name: formName,
        fields: fields.map(field => ({
          ...field,
          options: field.options?.filter(o => o.trim() !== '') // Clean up empty options
        })),
        createdAt: currentForm?.createdAt || Date.now(), // Use Date.now() for timestamp
      };

      let updatedForms = [...forms]; // Get current forms from Redux state

      if (currentForm) {
        // Update existing form
        const index = updatedForms.findIndex(f => f.id === formConfig.id);
        if (index !== -1) {
          updatedForms[index] = formConfig;
        }
        dispatch(updateFormLocally(formConfig));
        handleOpenDialog('Form Saved', 'Form updated successfully!');
      } else {
        // Add new form
        updatedForms.unshift(formConfig); // Add to the beginning
        dispatch(addFormLocally(formConfig));
        handleOpenDialog('Form Saved', 'Form created successfully!');
        setFormName('');
        setFields([]);
      }
      saveFormsToLocalStorage(updatedForms); // Persist to localStorage
    } catch (e: any) {
      console.error("Error saving form:", e);
      dispatch(setError(`Failed to save form: ${e.message}`));
      handleOpenDialog("Error", `Failed to save form: ${e.message}`);
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          {currentForm ? 'Edit Form' : 'Create New Form'}
        </Typography>

        <TextField
          label="Form Name"
          variant="outlined"
          fullWidth
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          sx={{ mb: 3 }}
          required
        />

        <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Form Fields
        </Typography>
  
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ mb: 3, p: 2, borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Field {index + 1}</Typography>
              <IconButton color="error" onClick={() => deleteField(field.id)} disabled={loading}>
                <DeleteIcon />
              </IconButton>
            </Box>

            <TextField
              label="Field Label"
              variant="outlined"
              fullWidth
              value={field.label}
              onChange={(e) => updateField(index, 'label', e.target.value)}
              sx={{ mb: 2 }}
              required
            />
           
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={field.type}
                onChange={(e) => updateField(index, 'type', e.target.value as FormField['type'])}
                label="Field Type"
                disabled={loading}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
                <MenuItem value="radio">Radio Buttons</MenuItem>
                <MenuItem value="select">Dropdown Select</MenuItem>
              </Select>
            </FormControl>

            {(field.type === 'text' || field.type === 'number' || field.type === 'email') && (
              <>
                <TextField
                  label="Placeholder"
                  variant="outlined"
                  fullWidth
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.required}
                      onChange={(e) => updateField(index, 'required', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Required"
                  sx={{ mb: 2 }}
                />
                {field.type === 'text' && (
                  <>
                    <TextField
                      label="Min Length"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={field.minLength || ''}
                      onChange={(e) => updateField(index, 'minLength', parseInt(e.target.value) || undefined)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Max Length"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={field.maxLength || ''}
                      onChange={(e) => updateField(index, 'maxLength', parseInt(e.target.value) || undefined)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Validation Pattern (Regex)"
                      variant="outlined"
                      fullWidth
                      value={field.pattern || ''}
                      onChange={(e) => updateField(index, 'pattern', e.target.value)}
                      sx={{ mb: 2 }}
                      helperText="e.g., ^[A-Za-z]+$"
                    />
                  </>
                )}
              </>
            )}

            {(field.type === 'radio' || field.type === 'select') && (
              <>
                <TextField
                  label="Options (comma-separated)"
                  variant="outlined"
                  fullWidth
                  value={field.options?.join(', ') || ''}
                  onChange={(e) => updateField(index, 'options', e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="e.g., Option A, Option B, Option C"
                  required
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.required}
                      onChange={(e) => updateField(index, 'required', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Required"
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </Card>
        ))}
     
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addField}
          fullWidth
          sx={{ mb: 3, py: 1.5, borderRadius: '8px' }}
          disabled={loading}
        >
          Add Field
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveForm}
            sx={{ px: 4, py: 1.5, borderRadius: '8px' }}
            disabled={loading}
          >
            {currentForm ? 'Update Form' : 'Save Form'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              if (fields.length === 0) {
                handleOpenDialog('Cannot Preview', 'Please add at least one field to preview the form.');
                return;
              }
              navigate('/preview', { formConfig: { name: formName, fields: fields } });
            }}
            sx={{ px: 4, py: 1.5, borderRadius: '8px' }}
            disabled={loading}
          >
            Preview
          </Button>
        </Box>
       
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>}
        {error && <Typography color="error" sx={{ mt: 2 }} align="center">{error}</Typography>}
      </Paper>
      
      <MessageDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={handleCloseDialog}
      />
    </Container>
  );
};