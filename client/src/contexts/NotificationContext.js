import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { io as ioClient } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'error', 'warning', 'info', 'success'
  });

  const [notifications, setNotifications] = useState([]); // persistent notifications
  const socketRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  };

  const showSuccess = (message) => showNotification(message, 'success');
  const showError = (message) => showNotification(message, 'error');
  const showWarning = (message) => showNotification(message, 'warning');
  const showInfo = (message) => showNotification(message, 'info');

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    // persistent notifications API
    notifications,
    unreadCount,
    addNotification: (n) => setNotifications(s => [n, ...s]),
    // markAsRead will remove the notification from the in-memory list (auto-delete after checking)
    markAsRead: (id) => setNotifications(s => s.filter(n => n.id !== id)),
    removeNotification: (id) => setNotifications(s => s.filter(n => n.id !== id)),
    clearNotifications: () => setNotifications([]),
    socket: socketRef.current,
  };

  // Setup socket connection and listeners for server-sent events
  useEffect(() => {
    try {
      const base = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const socket = ioClient(base, { auth: { token: localStorage.getItem('token') } });
      socketRef.current = socket;

      socket.on('connect', () => console.log('Notification socket connected', socket.id));
      socket.on('connect_error', (err) => console.error('Notification socket connect_error', err));

      const pushNotification = (type, payload, explicitMessage) => {
        const nested = payload && (payload.consultation || payload.campaign || payload.report);
        const id = (nested && (nested._id || nested.id)) || (payload && (payload._id || payload.id)) || `${type}-${Date.now()}`;
        const message = explicitMessage || payload?.message || (nested && (nested.title || nested.name || nested.type)) || `${type} event received`;
        const n = { id, type, message, data: payload, createdAt: new Date().toISOString(), read: false };
        setNotifications(prev => [n, ...prev]);
        // also show a transient snackbar
        showInfo(n.message);
      };

      socket.on('campaign:created', (campaign) => {
        pushNotification('campaign', campaign, `New campaign: ${campaign.title || campaign.name || 'Campaign'}`);
      });

      socket.on('report:created', (report) => {
        pushNotification('report', report, `New health report: ${report.title || report.type || 'Report'}`);
      });

      socket.on('consultation:requested', (payload) => {
        // payload is { consultation, patient, message }
        // only push if the current socket user is the intended provider (server already emits to specific room)
        pushNotification('consultation:requested', payload, payload?.message || `New consultation request`);
      });

      socket.on('consultation:responded', (payload) => {
        // payload may be { consultation, action, provider, message } or legacy consultation object
        pushNotification('consultation:responded', payload, payload?.message || `Your consultation request was updated`);
      });

      return () => {
        try { socket.disconnect(); } catch (e) {}
        socketRef.current = null;
      };
    } catch (e) {
      console.error('Failed to initialize notification socket', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};








