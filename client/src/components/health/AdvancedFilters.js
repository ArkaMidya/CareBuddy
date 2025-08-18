import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Collapse,
  Grid,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  FilterList,
  Search,
  Clear,
  ExpandMore,
  ExpandLess,
  DateRange,
  LocationOn,
  LocalHospital,
  Warning
} from '@mui/icons-material';

const healthTypes = [
  'General Checkup',
  'Emergency',
  'Disease Outbreak',
  'Mental Health',
  'Environmental Health',
  'Community Health Issue',
  'Chronic Condition',
  'Injury',
  'Preventive Care',
  'Other'
];

const severityLevels = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

const statusOptions = [
  'Pending',
  'In Progress',
  'Resolved',
  'Urgent'
];

const AdvancedFilters = ({ filters, onFiltersChange, sx = {} }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Auto-expand when there are active filters
  useEffect(() => {
    const hasActiveFilters = Object.values(localFilters).some(value => 
      value !== '' && value !== null
    );
    if (hasActiveFilters && !expanded) {
      setExpanded(true);
    }
  }, [localFilters, expanded]);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    type: '',
    severity: '',
    status: '',
    location: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      type: '',
      severity: '',
      status: '',
      location: '',
      dateFrom: '',
      dateTo: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (field) => {
    const newFilters = { ...localFilters, [field]: '' };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== '' && value !== null
    ).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const renderFilterChips = () => {
    const chips = [];
    
    if (localFilters.search) {
      chips.push(
        <Chip
          key="search"
          label={`Search: "${localFilters.search}"`}
          onDelete={() => handleRemoveFilter('search')}
          color="primary"
          variant="outlined"
          size="small"
        />
      );
    }
    
    if (localFilters.type) {
      chips.push(
        <Chip
          key="type"
          label={`Type: ${localFilters.type}`}
          onDelete={() => handleRemoveFilter('type')}
          color="secondary"
          variant="outlined"
          size="small"
        />
      );
    }
    
    if (localFilters.severity) {
      chips.push(
        <Chip
          key="severity"
          label={`Severity: ${localFilters.severity}`}
          onDelete={() => handleRemoveFilter('severity')}
          color="warning"
          variant="outlined"
          size="small"
        />
      );
    }
    
    if (localFilters.status) {
      chips.push(
        <Chip
          key="status"
          label={`Status: ${localFilters.status}`}
          onDelete={() => handleRemoveFilter('status')}
          color="info"
          variant="outlined"
          size="small"
        />
      );
    }
    
    if (localFilters.location) {
      chips.push(
        <Chip
          key="location"
          label={`Location: ${localFilters.location}`}
          onDelete={() => handleRemoveFilter('location')}
          color="success"
          variant="outlined"
          size="small"
        />
      );
    }
    
    if (localFilters.dateFrom) {
      chips.push(
        <Chip
          key="dateFrom"
          label={`From: ${localFilters.dateFrom}`}
          onDelete={() => handleRemoveFilter('dateFrom')}
          color="default"
          variant="outlined"
          size="small"
        />
      );
    }
    
    if (localFilters.dateTo) {
      chips.push(
        <Chip
          key="dateTo"
          label={`To: ${localFilters.dateTo}`}
          onDelete={() => handleRemoveFilter('dateTo')}
          color="default"
          variant="outlined"
          size="small"
        />
      );
    }
    
    return chips;
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3,
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, 0.9),
        ...sx
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6" component="h3">
            Advanced Filters
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={getActiveFiltersCount()}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasActiveFilters && (
            <Tooltip title="Clear All Filters">
              <IconButton 
                onClick={handleClearFilters}
                size="small"
                color="error"
              >
                <Clear />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title={expanded ? "Collapse Filters" : "Expand Filters"}>
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {renderFilterChips()}
          </Box>
        </Box>
      )}

      {/* Collapsible Filter Form */}
      <Collapse in={expanded}>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Reports"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, description, or location..."
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: 'action.active', mr: 1 }} />
                )
              }}
            />
          </Grid>

          {/* Health Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Health Type</InputLabel>
              <Select
                value={localFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Health Type"
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {healthTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type === 'Emergency' ? (
                        <Warning color="error" fontSize="small" />
                      ) : (
                        <LocalHospital color="primary" fontSize="small" />
                      )}
                      {type}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Severity */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Severity Level</InputLabel>
              <Select
                value={localFilters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                label="Severity Level"
              >
                <MenuItem value="">
                  <em>All Severities</em>
                </MenuItem>
                {severityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={level}
                        color={
                          level === 'Critical' || level === 'High' ? 'error' :
                          level === 'Medium' ? 'warning' : 'success'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={status}
                        color={
                          status === 'Urgent' ? 'error' :
                          status === 'Pending' ? 'warning' :
                          status === 'In Progress' ? 'info' : 'success'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={localFilters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, State, or ZIP Code"
              InputProps={{
                startAdornment: (
                  <LocationOn sx={{ color: 'action.active', mr: 1 }} />
                )
              }}
            />
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <DateRange sx={{ color: 'action.active', mr: 1 }} />
                  )
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <DateRange sx={{ color: 'action.active', mr: 1 }} />
                  )
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<Clear />}
          >
            Clear Filters
          </Button>
          <Button
            variant="contained"
            onClick={() => setExpanded(false)}
            startIcon={<FilterList />}
          >
            Apply Filters
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedFilters;
