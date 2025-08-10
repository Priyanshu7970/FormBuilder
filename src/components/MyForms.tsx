import { Box, Button, Card, CardContent, CircularProgress, Container,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,IconButton,Paper,  Typography } from "@mui/material";

import { useEffect, useState } from "react";
import { MessageDialog } from "./MessageDialog";
import { useDispatch, useSelector } from "react-redux";
import type {AppDispatch,RootState} from '../store';
import { loadFormsFromLocalStorage,saveFormsToLocalStorage } from "./LocalStorage";
import {formsSlice} from '../slices/FormSlice';
import {  Delete as DeleteIcon, Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';

const { setLoading, setError, setForms, deleteFormLocally } = formsSlice.actions;

export const MyForms: React.FC<{ navigate: (path: string, state?: any) => void }> = ({ navigate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { forms, loading, error } = useSelector((state: RootState) => state.forms); // userId, isAuthReady removed

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogTitle, setMessageDialogTitle] = useState('');
  const [messageDialogContent, setMessageDialogContent] = useState('');

  const handleDeleteClick = (formId: string) => {
    setFormToDelete(formId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => { // Changed to synchronous
    if (formToDelete) {
      dispatch(setLoading(true));
      try {
        const updatedForms = forms.filter(form => form.id !== formToDelete);
        saveFormsToLocalStorage(updatedForms);
        dispatch(deleteFormLocally(formToDelete));
        setMessageDialogTitle('Form Deleted');
        setMessageDialogContent('The form has been successfully deleted.');
        setMessageDialogOpen(true);
      } catch (e: any) {
        console.error("Error deleting form from localStorage:", e);
        dispatch(setError(`Failed to delete form: ${e.message}`));
        setMessageDialogTitle('Error');
        setMessageDialogContent(`Failed to delete form: ${e.message}`);
        setMessageDialogOpen(true);
      } finally {
        setOpenDeleteDialog(false);
        setFormToDelete(null);
        dispatch(setLoading(false));
      }
    }
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setFormToDelete(null);
  };

  const handleMessageDialogClose = () => {
    setMessageDialogOpen(false);
  };

  // Load forms from localStorage on component mount
  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    const loadedForms = loadFormsFromLocalStorage();
    dispatch(setForms(loadedForms));
    dispatch(setLoading(false));
  }, [dispatch]); // Only dispatch is a dependency

  if (loading && forms.length === 0) { // Show loader only on initial load if no forms yet
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading forms...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" align="center" variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          My Saved Forms
        </Typography>
        {forms.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary">
            No forms saved yet. Go to "Create Form" to build one!
          </Typography>
        ) : (
          forms.map((form) => (
            <Card key={form.id} variant="outlined" sx={{ mb: 2, borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{form.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(form.createdAt).toLocaleString()} {/* Convert timestamp to readable date */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fields: {form.fields.length}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => navigate('/preview', { formConfig: form })}
                    aria-label="preview form"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="info"
                    onClick={() => navigate('/create', { formConfig: form })}
                    aria-label="edit form"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(form.id)}
                    aria-label="delete form"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this form? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <MessageDialog
        open={messageDialogOpen}
        title={messageDialogTitle}
        message={messageDialogContent}
        onClose={handleMessageDialogClose}
      />
    </Container>
  );
};