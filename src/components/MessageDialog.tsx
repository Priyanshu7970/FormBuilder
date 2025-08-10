import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";

interface MessageDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({ open, title, message, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};