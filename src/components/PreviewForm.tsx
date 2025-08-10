import { useEffect, useState } from "react";
import type { FormConfiguration } from "../types/formTypes";
import { Box, Button, Checkbox, Container, FormControl, MenuItem, Paper, Select, TextField, Typography, FormControlLabel, RadioGroup, InputLabel, Radio } from "@mui/material";
import { MessageDialog } from "./MessageDialog";

export const PreviewForm: React.FC<{ navigate: (path: string) => void, formConfig: FormConfiguration }> = ({ navigate, formConfig }) => {
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    // Initialize form data with default values or empty strings
    const initialData: any = {};
    formConfig.fields.forEach(field => {
      if (field.type === 'checkbox') {
        initialData[field.id] = false;
      } else if (field.type === 'radio' || field.type === 'select') {
        initialData[field.id] = ''; // Or first option if exists: field.options?.[0] || ''
      } else {
        initialData[field.id] = '';
      }
    });
    setFormData(initialData);
    setFormErrors({});
  }, [formConfig]);

  const handleOpenDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field on change
    if (formErrors[fieldId]) {
      setFormErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: any = {};
    formConfig.fields.forEach(field => {
      const value = formData[field.id];

      if (field.required && (value === '' || value === false || (Array.isArray(value) && value.length === 0))) {
        errors[field.id] = `${field.label} is required.`;
      }

      if (field.type === 'text' || field.type === 'email' || field.type === 'number') {
        if (field.minLength && value.length < field.minLength) {
          errors[field.id] = `${field.label} must be at least ${field.minLength} characters.`;
        }
        if (field.maxLength && value.length > field.maxLength) {
          errors[field.id] = `${field.label} cannot exceed ${field.maxLength} characters.`;
        }
        if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
          errors[field.id] = `${field.label} does not match the required pattern.`;
        }
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.id] = `${field.label} is not a valid email address.`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      handleOpenDialog('Form Submitted', `Form Data: ${JSON.stringify(formData, null, 2)}`);
      console.log('Form Submitted:', formData);
      // Here you would typically send data to a backend or process it
    } else {
      handleOpenDialog('Validation Error', 'Please correct the errors in the form.');
    }
  };
 
   
  return (
    <>
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Preview: {formConfig.name}
        </Typography>

        <form onSubmit={handleSubmit}>
          {formConfig.fields.map(field => (
            <Box key={field.id} sx={{ mb: 3 }}>
              {field.type === 'text' || field.type === 'number' || field.type === 'email' ? (
                <TextField
                  label={field.label}
                  variant="outlined"
                  fullWidth
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  error={!!formErrors[field.id]}
                  helperText={formErrors[field.id]}
                  inputProps={field.type === 'number' ? { inputMode: 'numeric', pattern: '[0-9]*' } : {}}
                />
              ) : field.type === 'checkbox' ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData[field.id] || false}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                      required={field.required}
                    />
                  }
                  label={field.label}
                />
              ) : field.type === 'radio' ? (
                <FormControl component="fieldset" error={!!formErrors[field.id]} required={field.required}>
                  <Typography variant="subtitle1" component="legend" sx={{ mb: 1 }}>{field.label}{field.required ? ' *' : ''}</Typography>
                  <RadioGroup
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  >
                    {field.options?.map(option => (
                      <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                    ))}
                  </RadioGroup>
                  {formErrors[field.id] && <Typography color="error" variant="caption">{formErrors[field.id]}</Typography>}
                </FormControl>
              ) : field.type === 'select' ? (
                <FormControl fullWidth variant="outlined" error={!!formErrors[field.id]} required={field.required}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    label={field.label}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {field.options?.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                  {formErrors[field.id] && <Typography color="error" variant="caption">{formErrors[field.id]}</Typography>}
                </FormControl>
              ) : null}
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ px: 4, py: 1.5, borderRadius: '8px' }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={() =>{ navigate('/create')}}
              sx={{ px: 4, py: 1.5, borderRadius: '8px' }}
            >
              Back to Editor
            </Button>
          </Box>
        </form>
      </Paper>
      <MessageDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={handleCloseDialog}
      />
  </Container>
    </>

    )};