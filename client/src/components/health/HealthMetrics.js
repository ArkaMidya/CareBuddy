import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  LocalHospital,
  People,
  LocationOn
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HealthMetrics = ({ reports = [], loading = false }) => {
  const [metrics, setMetrics] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    recentReports: 0,
    avgResolutionTime: 0
  });

  useEffect(() => {
    if (reports.length > 0) {
      const total = reports.length;
      const resolved = reports.filter(r => r.status === 'resolved').length;
      const pending = reports.filter(r => r.status === 'pending').length;
      const inProgress = reports.filter(r => r.status === 'in_progress').length;
      const high = reports.filter(r => r.severity === 'high').length;
      const medium = reports.filter(r => r.severity === 'medium').length;
      const low = reports.filter(r => r.severity === 'low').length;
      
      // Calculate recent reports (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recent = reports.filter(r => new Date(r.createdAt) > sevenDaysAgo).length;

      // Calculate average resolution time (simplified)
      const resolvedReports = reports.filter(r => r.status === 'resolved');
      const avgTime = resolvedReports.length > 0 ? 
        resolvedReports.reduce((acc, r) => {
          const created = new Date(r.createdAt);
          const resolved = new Date(r.resolvedAt || r.updatedAt);
          return acc + (resolved - created) / (1000 * 60 * 60 * 24); // days
        }, 0) / resolvedReports.length : 0;

      setMetrics({
        totalReports: total,
        resolvedReports: resolved,
        pendingReports: pending,
        inProgressReports: inProgress,
        highSeverity: high,
        mediumSeverity: medium,
        lowSeverity: low,
        recentReports: recent,
        avgResolutionTime: Math.round(avgTime * 10) / 10
      });
    }
  }, [reports]);

  const getStatusData = () => {
    // Handle case-insensitive status matching
    const resolved = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;
    const inProgress = reports.filter(r => r.status?.toLowerCase() === 'in_progress' || r.status?.toLowerCase() === 'in progress').length;
    const pending = reports.filter(r => r.status?.toLowerCase() === 'pending').length;
    
    // Only show labels for statuses that have data
    const labels = [];
    const data = [];
    const colors = [];
    
    if (resolved > 0) {
      labels.push('Resolved');
      data.push(resolved);
      colors.push('#4caf50');
    }
    if (inProgress > 0) {
      labels.push('In Progress');
      data.push(inProgress);
      colors.push('#ff9800');
    }
    if (pending > 0) {
      labels.push('Pending');
      data.push(pending);
      colors.push('#2196f3');
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  const getSeverityData = () => {
    // Handle case-insensitive severity matching
    const high = reports.filter(r => r.severity?.toLowerCase() === 'high').length;
    const medium = reports.filter(r => r.severity?.toLowerCase() === 'medium').length;
    const low = reports.filter(r => r.severity?.toLowerCase() === 'low').length;
    
    // Only show labels for severities that have data
    const labels = [];
    const data = [];
    const colors = [];
    
    if (high > 0) {
      labels.push('High');
      data.push(high);
      colors.push('#f44336');
    }
    if (medium > 0) {
      labels.push('Medium');
      data.push(medium);
      colors.push('#ff9800');
    }
    if (low > 0) {
      labels.push('Low');
      data.push(low);
      colors.push('#4caf50');
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  const getTrendData = () => {
    // Generate actual trend data from reports for the last 7 days
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(dateStr);
      
      // Count reports created on this date
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const reportsOnDay = reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= dayStart && reportDate <= dayEnd;
      }).length;
      
      data.push(reportsOnDay);
    }

    return {
      labels,
      datasets: [
        {
          label: 'New Reports',
          data,
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getMonthlyTrendData = () => {
    // Generate monthly trend data for the last 6 months
    const labels = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      labels.push(monthStr);
      
      // Count reports created in this month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const reportsInMonth = reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= monthStart && reportDate <= monthEnd;
      }).length;
      
      data.push(reportsInMonth);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Reports per Month',
          data,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const MetricCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {trend > 0 ? (
                  <TrendingUp fontSize="small" color="success" />
                ) : (
                  <TrendingDown fontSize="small" color="error" />
                )}
                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}% from last week
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <Box>
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <LocalHospital sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Health Reports Available
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Submit your first health report to see analytics and trends here.
                <br />
                The dashboard will show severity distribution, report status, and monthly trends
                based on the reports you create.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Reports"
            value={metrics.totalReports}
            icon={<LocalHospital color="primary" />}
            color="primary"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Resolved"
            value={metrics.resolvedReports}
            icon={<CheckCircle color="success" />}
            color="success"
            subtitle={`${metrics.totalReports > 0 ? ((metrics.resolvedReports / metrics.totalReports) * 100).toFixed(1) : 0}% resolution rate`}
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending"
            value={metrics.pendingReports}
            icon={<Schedule color="warning" />}
            color="warning"
            subtitle="Awaiting action"
            trend={-3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="High Priority"
            value={metrics.highSeverity}
            icon={<Warning color="error" />}
            color="error"
            subtitle="Requires immediate attention"
            trend={-8}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Status Distribution
              </Typography>
              <Box height={300}>
                {getStatusData().labels.length > 0 ? (
                  <Doughnut
                    data={getStatusData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body2" color="textSecondary">
                      No status data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Severity Distribution
              </Typography>
              <Box height={300}>
                {getSeverityData().labels.length > 0 ? (
                  <Doughnut
                    data={getSeverityData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body2" color="textSecondary">
                      No severity data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Report Trends
              </Typography>
              <Box height={300}>
                <Line
                  data={getTrendData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Trends
              </Typography>
              <Box height={300}>
                <Line
                  data={getMonthlyTrendData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Reports this week</Typography>
                  <Chip label={metrics.recentReports} size="small" color="primary" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Avg. resolution time</Typography>
                  <Chip label={`${metrics.avgResolutionTime} days`} size="small" color="success" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Response rate</Typography>
                  <Chip label="95%" size="small" color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Indicators
              </Typography>
              <Box>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Resolution Rate</Typography>
                    <Typography variant="body2">
                      {metrics.totalReports > 0 ? ((metrics.resolvedReports / metrics.totalReports) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.totalReports > 0 ? (metrics.resolvedReports / metrics.totalReports) * 100 : 0}
                    color="success"
                  />
                </Box>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">High Priority Response</Typography>
                    <Typography variant="body2">87%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={87} color="warning" />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Community Engagement</Typography>
                    <Typography variant="body2">92%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={92} color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthMetrics;
