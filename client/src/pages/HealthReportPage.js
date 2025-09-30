import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  alpha,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  LocalHospital,
  List,
  Map,
  Analytics
} from '@mui/icons-material';
import ReportForm from '../components/health/ReportForm';
import ReportsList from '../components/health/ReportsList';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/health/MapView';
import HealthMetrics from '../components/health/HealthMetrics';
import { reportsService } from '../services/reportsService';



const HealthReportPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getReports();
      if (response.success) {
        setReports(response.data.reports || []);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleReportSubmit = async (newReport) => {
    try {
      console.log('HealthReportPage received report:', newReport);
      setLoading(true);
      const response = await reportsService.createReport(newReport);
      console.log('Backend response:', response);
      if (response.success) {
        setReports(prev => [response.data.report, ...prev]);
        setActiveTab(1); // Switch to reports list tab
      } else {
        setError(response.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        let errMsg = `Failed to submit report: ${error.response.data.message || 'Validation error'}`;
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errMsg += '\n' + error.response.data.errors.map(e => `- ${e.msg} (${e.param})`).join('\n');
        }
        setError(errMsg);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportUpdate = async (updatedReport) => {
    try {
      setLoading(true);
      const response = await reportsService.updateReport(updatedReport._id || updatedReport.id, updatedReport);
      if (response.success) {
        setReports(prev => prev.map(report => 
          report._id === updatedReport._id || report.id === updatedReport.id 
            ? response.data.report 
            : report
        ));
      } else {
        setError('Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportDelete = async (report) => {
    try {
      setLoading(true);
      const reportId = typeof report === 'object' ? (report._id || report.id) : report;
      const response = await reportsService.deleteReport(reportId);
      if (response.success) {
        setReports(prev => prev.filter(r => (r._id || r.id) !== reportId));
        setError(null);
        window.alert('Report deleted successfully.');
      } else {
        setError('Failed to delete report');
        window.alert('Failed to delete report.');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report. Please try again.');
      window.alert('Error deleting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleReportView = (report) => {
    console.log('Viewing report:', report);
    // You can implement a modal or navigation to view report details
  };

  const handleReportEdit = (updatedReport) => {
    console.log('Updating report:', updatedReport);
    setReports(prev => 
      prev.map(report => 
        report.id === updatedReport.id 
          ? { ...updatedReport, updatedAt: new Date().toISOString() }
          : report
      )
    );
  };

  const handleReportAdd = () => {
    console.log('Adding new report');
    setActiveTab(0); // Switch to the submit report tab
  };

  const handleReportResolve = async (report) => {
    try {
      setLoading(true);
      const reportId = typeof report === 'object' ? (report._id || report.id) : report;
      const response = await reportsService.resolveReport(reportId, { 
        status: 'resolved', 
        notes: 'Report marked as resolved' 
      });
      if (response.success) {
        setReports(prev => 
          prev.map(r => 
            (r._id || r.id) === reportId 
              ? { ...r, status: 'resolved', updatedAt: new Date().toISOString() }
              : r
          )
        );
        setError(null);
        window.alert('Report marked as resolved.');
      } else {
        setError(response.message || 'Failed to resolve report');
        window.alert(response.message || 'Failed to resolve report.');
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      let backendMsg = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Failed to resolve report. Please try again.';
      // Check for auth/permission errors
      if (
        backendMsg.toLowerCase().includes('permission') ||
        backendMsg.toLowerCase().includes('unauthorized') ||
        backendMsg.toLowerCase().includes('jwt') ||
        backendMsg.toLowerCase().includes('token')
      ) {
        setError('Authentication or permission error. Please log in with the correct role and try again.');
        window.alert('Authentication or permission error. Please log in with the correct role and try again.');
        // Optionally, redirect to login page:
        // window.location.href = '/login';
      } else {
        setError(backendMsg);
        window.alert('Error resolving report: ' + backendMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportUndo = async (report) => {
    try {
      setLoading(true);
      const reportId = typeof report === 'object' ? (report._id || report.id) : report;
      const response = await reportsService.undoResolution(reportId);
      if (response.success) {
        setReports(prev => 
          prev.map(r => 
            (r._id || r.id) === reportId 
              ? { ...r, status: 'pending', updatedAt: new Date().toISOString() }
              : r
          )
        );
      } else {
        setError('Failed to undo resolution');
      }
    } catch (error) {
      console.error('Error undoing resolution:', error);
      setError('Failed to undo resolution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTabIcon = (index) => {
    switch (index) {
      case 0: return <LocalHospital />;
      case 1: return <List />;
      case 2: return <Map />;
      case 3: return <Analytics />;
      default: return <LocalHospital />;
    }
  };

 const renderTabContent = () => {
  switch (activeTab) {
    case 0:
      return (
        <ReportForm 
          onSubmit={handleReportSubmit}
          onAdd={handleReportAdd}
        />
      );
    case 1:
      return (
        <ReportsList
          reports={reports}
          onDelete={handleReportDelete}
          onAdd={handleReportAdd}
          onResolve={handleReportResolve}
          onUndo={handleReportUndo}
          onView={handleReportView}
          onEdit={handleReportEdit}
          userRole={user?.role || 'user'}
        />
      );
    case 2:
      return (
        <MapView 
          reports={reports}
          onReportUpdate={handleReportUpdate}
          onReportDelete={handleReportDelete}
          onOpenReportForm={() => setActiveTab(0)}
          onRefresh={fetchReports}
        />
      );
    case 3:
      return (
        <HealthMetrics reports={reports} loading={loading} />
      );
    default:
      return null;
  }
};
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Community Health Reporting & Monitoring
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Real-time health reporting, outbreak tracking, and community health monitoring
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper 
        elevation={1} 
        sx={{ 
          mb: 3,
          background: alpha(theme.palette.background.paper, 0.9)
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              '&.Mui-selected': {
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <Tab 
            label="Submit Report" 
            icon={getTabIcon(0)} 
            iconPosition="start"
          />
          <Tab 
            label="Reports List" 
            icon={getTabIcon(1)} 
            iconPosition="start"
          />
          <Tab 
            label="Community Map" 
            icon={getTabIcon(2)} 
            iconPosition="start"
          />
          <Tab 
            label="Health Analytics" 
            icon={getTabIcon(3)} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {!loading && renderTabContent()}
      </Box>

      {/* Community Health Information */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 4, 
          background: alpha(theme.palette.info.light, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="h6" color="info.main" gutterBottom>
          About Community Health Reporting
        </Typography>
        <Typography variant="body2" paragraph>
          This platform enables real-time reporting of health issues affecting individuals and communities. 
          Community health reports are automatically flagged and routed to appropriate public health authorities 
          to ensure rapid response to emerging health threats.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Key Features:</strong> Disease outbreak tracking, mental health crisis reporting, 
          environmental health monitoring, geographic visualization, and real-time analytics to protect 
          community well-being.
        </Typography>
        <Typography variant="body2">
          <strong>Access Control:</strong> Only authorized health workers, healthcare providers, and administrators 
          can delete reports or mark them as resolved. Regular users can submit reports and view community health data.
        </Typography>
      </Paper>
    </Box>
  );
};

export default HealthReportPage;
