import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, markAsRead } = useNotification();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Notifications</Typography>
        {(!notifications || notifications.length === 0) ? (
          <Typography>No notifications</Typography>
        ) : (
          <List>
            {notifications.map(n => (
              <ListItem key={n.id} sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }} secondaryAction={<Button onClick={() => { markAsRead(n.id); }}>Dismiss</Button>}>
                <ListItemText primary={n.message} secondary={new Date(n.createdAt).toLocaleString()} onClick={() => navigate(n.type === 'report' ? '/health-reports' : n.type === 'campaign' ? '/campaigns' : '/consultations')} sx={{ cursor: 'pointer' }} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default NotificationsPage;




