import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  HealthAndSafety,
  Report,
  School,
  Person,
  Business,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  TrendingUp,
  People,
  LocalHospital,
  VolunteerActivism,
  Campaign,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleBasedStats = () => {
    switch (user?.role) {
      case 'patient':
        return [
          { title: 'Health Reports', count: 3, icon: <Report />, color: 'primary' },
          { title: 'Consultations', count: 2, icon: <HealthAndSafety />, color: 'success' },
          { title: 'Education Modules', count: 8, icon: <School />, color: 'info' },
          { title: 'Active Campaigns', count: 5, icon: <Campaign />, color: 'warning' },
        ];
      case 'healthcare_provider':
        return [
          { title: 'Active Patients', count: 45, icon: <People />, color: 'primary' },
          { title: 'Scheduled Consultations', count: 12, icon: <HealthAndSafety />, color: 'success' },
          { title: 'Health Reports', count: 28, icon: <Report />, color: 'info' },
          { title: 'Resources Shared', count: 15, icon: <LocalHospital />, color: 'warning' },
        ];
      case 'health_worker':
        return [
          { title: 'Community Reports', count: 67, icon: <Report />, color: 'primary' },
          { title: 'Field Visits', count: 23, icon: <LocationOn />, color: 'success' },
          { title: 'Health Camps', count: 8, icon: <Campaign />, color: 'info' },
          { title: 'Patients Assisted', count: 156, icon: <People />, color: 'warning' },
        ];
      case 'ngo_worker':
        return [
          { title: 'Active Programs', count: 12, icon: <Campaign />, color: 'primary' },
          { title: 'Volunteers', count: 89, icon: <VolunteerActivism />, color: 'success' },
          { title: 'Communities Served', count: 34, icon: <LocationOn />, color: 'info' },
          { title: 'Health Resources', count: 45, icon: <LocalHospital />, color: 'warning' },
        ];
      case 'admin':
        return [
          { title: 'Total Users', count: 1247, icon: <People />, color: 'primary' },
          { title: 'Active Reports', count: 89, icon: <Report />, color: 'success' },
          { title: 'Health Resources', count: 234, icon: <LocalHospital />, color: 'info' },
          { title: 'Active Campaigns', count: 23, icon: <Campaign />, color: 'warning' },
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    const actions = [
      { title: 'Report Health Issue', path: '/reports', icon: <Report /> },
      { title: 'Find Health Resources', path: '/resources', icon: <LocalHospital /> },
      { title: 'Book Consultation', path: '/consultations', icon: <HealthAndSafety /> },
      { title: 'Health Education', path: '/education', icon: <School /> },
    ];

    // Add role-specific actions
    if (['healthcare_provider', 'health_worker', 'ngo_worker'].includes(user?.role)) {
      actions.push({ title: 'View Reports', path: '/reports', icon: <Report /> });
    }

    if (user?.role === 'admin') {
      actions.push({ title: 'Manage Users', path: '/admin/users', icon: <People /> });
    }

    return actions;
  };

  const getRecentActivity = () => {
    const activities = [
      { text: 'Health report submitted', time: '2 hours ago', type: 'report' },
      { text: 'New consultation scheduled', time: '4 hours ago', type: 'consultation' },
      { text: 'Education module completed', time: '1 day ago', type: 'education' },
      { text: 'Campaign registration', time: '2 days ago', type: 'campaign' },
    ];

    return activities;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'report':
        return <Report fontSize="small" />;
      case 'consultation':
        return <HealthAndSafety fontSize="small" />;
      case 'education':
        return <School fontSize="small" />;
      case 'campaign':
        return <Campaign fontSize="small" />;
      default:
        return <TrendingUp fontSize="small" />;
    }
  };

  const stats = getRoleBasedStats();
  const quickActions = getQuickActions();
  const recentActivity = getRecentActivity();

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        py: 3,
        position: 'relative',
      }}>
        {/* Welcome Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Here's what's happening in your health ecosystem today.
          </Typography>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: `${stat.color}.main` }}>
                        {stat.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main` }}>
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={action.icon}
                        onClick={() => navigate(action.path)}
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        {action.title}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.text}
                          secondary={activity.time}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* User Profile Summary */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Profile Summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {user?.firstName} {user?.lastName}
                        </Typography>
                        <Chip 
                          label={user?.role?.replace('_', ' ').toUpperCase()} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">{user?.email}</Typography>
                    </Box>
                    {user?.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">{user?.phone}</Typography>
                      </Box>
                    )}
                    {user?.address?.city && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {user?.address?.city}, {user?.address?.state}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/profile')}
                        startIcon={<Person />}
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
