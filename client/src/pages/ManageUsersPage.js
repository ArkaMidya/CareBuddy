import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import userService from '../services/userService';

const ManageUsersPage = () => {
  const { user } = useAuth();
  const notify = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchUsers = async () => {
    if (!user || user.role !== 'admin') {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await userService.listUsers(localStorage.getItem('token')); // Assuming a listUsers method exists
      setUsers(response.data?.data?.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users.');
      notify.showError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        setLoading(true); // Show loading spinner during deletion
        await userService.deleteUser(userToDelete._id, localStorage.getItem('token'));
        notify.showSuccess(`User ${userToDelete.firstName} deleted successfully.`);
        handleCloseDeleteDialog();
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete user:', err);
        notify.showError(err.response?.data?.message || 'Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenEditDialog = (user) => {
    setUserToEdit(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      licenseNumber: user.providerInfo?.licenseNumber || '',
      specialization: user.providerInfo?.specialization?.[0] || '', // Assuming single specialization for now
      experience: user.providerInfo?.experience || '',
      education: user.providerInfo?.education || [],
      certifications: user.providerInfo?.certifications || [],
      organization: user.workerInfo?.organization || '',
      designation: user.workerInfo?.designation || '',
      areaOfService: user.workerInfo?.areaOfService || [],
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setUserToEdit(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name.split('.')[1]]: value,
        },
      }));
    } else if (name.includes('providerInfo.')) {
      setEditFormData(prev => ({
        ...prev,
        providerInfo: {
          ...prev.providerInfo,
          [name.split('.')[1]]: value,
        },
      }));
    } else if (name.includes('workerInfo.')) {
      setEditFormData(prev => ({
        ...prev,
        workerInfo: {
          ...prev.workerInfo,
          [name.split('.')[1]]: value,
        },
      }));
    } else if (name === 'specialization') { // Handle specialization separately as it's directly on form data
      setEditFormData(prev => ({ ...prev, specialization: value }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = async () => {
    if (!userToEdit) return;

    // Prepare data for backend: only send changed fields and handle nested objects
    const updates = {};
    // Direct fields
    ['firstName', 'lastName', 'email', 'role', 'phone'].forEach(field => {
      if (editFormData[field] !== undefined && editFormData[field] !== userToEdit[field]) {
        updates[field] = editFormData[field];
      }
    });

    // Address fields
    const addressUpdates = {};
    ['street', 'city', 'state', 'zipCode'].forEach(field => {
      const formValue = editFormData[`address.${field}`];
      const originalValue = userToEdit.address?.[field];
      if (formValue !== undefined && formValue !== originalValue) {
        addressUpdates[field] = formValue;
      }
    });
    if (Object.keys(addressUpdates).length > 0) {
      updates.address = { ...userToEdit.address, ...addressUpdates };
    }

    // Provider Info fields
    const providerInfoUpdates = {};
    // Handle specialization specifically
    if (editFormData.specialization !== undefined && (editFormData.specialization !== userToEdit.providerInfo?.specialization?.[0])) {
      providerInfoUpdates.specialization = [editFormData.specialization];
    }
    ['licenseNumber', 'experience'].forEach(field => {
      const formValue = editFormData[`providerInfo.${field}`];
      const originalValue = userToEdit.providerInfo?.[field];
      if (formValue !== undefined && formValue !== originalValue) {
        providerInfoUpdates[field] = formValue;
      }
    });
    // Special handling for array fields like education/certifications if they were editable

    if (Object.keys(providerInfoUpdates).length > 0) {
      updates.providerInfo = { ...userToEdit.providerInfo, ...providerInfoUpdates };
    }

    // Worker Info fields (simplified, assuming basic fields like organization/designation)
    const workerInfoUpdates = {};
    ['organization', 'designation'].forEach(field => {
      const formValue = editFormData[`workerInfo.${field}`];
      const originalValue = userToEdit.workerInfo?.[field];
      if (formValue !== undefined && formValue !== originalValue) {
        workerInfoUpdates[field] = formValue;
      }
    });
    if (Object.keys(workerInfoUpdates).length > 0) {
      updates.workerInfo = { ...userToEdit.workerInfo, ...workerInfoUpdates };
    }

    if (Object.keys(updates).length === 0) {
      notify.showInfo('No changes to save.');
      handleCloseEditDialog();
      return;
    }

    try {
      setLoading(true);
      await userService.updateUser(userToEdit._id, updates, localStorage.getItem('token'));
      notify.showSuccess(`User ${userToEdit.firstName} updated successfully.`);
      handleCloseEditDialog();
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Failed to update user:', err);
      notify.showError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading users...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <React.Fragment>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Users
        </Typography>
        {users.length === 0 ? (
          <Typography>No users found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="user table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.firstName} {u.lastName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleOpenEditDialog(u)}>Edit</Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(u)}
                      >Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete user {userToDelete?.firstName} {userToDelete?.lastName} ({userToDelete?.email})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit User: {userToEdit?.firstName} {userToEdit?.lastName}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="First Name" name="firstName" value={editFormData.firstName || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Last Name" name="lastName" value={editFormData.lastName || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} fullWidth margin="normal" disabled />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={editFormData.role || ''}
                  onChange={handleEditFormChange}
                  label="Role"
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="health_worker">Health Worker</MenuItem>
                  <MenuItem value="ngo">NGO</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="user">General User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" name="phone" value={editFormData.phone || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Street" name="address.street" value={editFormData.address?.street || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="City" name="address.city" value={editFormData.address?.city || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="State" name="address.state" value={editFormData.address?.state || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Zip Code" name="address.zipCode" value={editFormData.address?.zipCode || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            </Grid>

            {(editFormData.role === 'doctor' || editFormData.role === 'health_worker') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField label="License Number" name="providerInfo.licenseNumber" value={editFormData.licenseNumber || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Specialization</InputLabel>
                    <Select
                      name="specialization"
                      value={editFormData.specialization || ''}
                      onChange={handleEditFormChange}
                      label="Specialization"
                    >
                      {['Cardiologist', 'Neurologist', 'Pediatrician', 'Dermatologist', 'Psychiatrist', 'General Physician', 'Orthopedist', 'Gynecologist', 'Endocrinologist', 'Oncologist', 'Ophthalmologist', 'ENT Specialist', 'Urologist', 'Neurosurgeon', 'Pediatric Surgeon'].map(s => (
                        <MenuItem key={s} value={s.toLowerCase()}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField type="number" label="Experience (Years)" name="providerInfo.experience" value={editFormData.experience || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
                </Grid>
              </>
            )}

            {editFormData.role === 'ngo' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField label="Organization" name="workerInfo.organization" value={editFormData.organization || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Designation" name="workerInfo.designation" value={editFormData.designation || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ManageUsersPage;
