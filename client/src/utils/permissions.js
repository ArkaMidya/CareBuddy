// Role-based access control for health reports
export const ROLES = {
  ADMIN: 'admin',
  HEALTH_WORKER: 'health_worker',
  HEALTHCARE_PROVIDER: 'healthcare_provider',
  NGO_WORKER: 'ngo_worker',
  PATIENT: 'patient',
  USER: 'user'
};

// Check if user can manage health reports (delete, mark as resolved, etc.)
export const canManageHealthReports = (user) => {
  if (!user || !user.role) return false;
  
  return [
    ROLES.ADMIN,
    ROLES.HEALTH_WORKER,
    ROLES.HEALTHCARE_PROVIDER
  ].includes(user.role);
};

// Check if user can delete health reports
export const canDeleteHealthReports = (user) => {
  return canManageHealthReports(user);
};

// Check if user can mark reports as resolved
export const canResolveHealthReports = (user) => {
  return canManageHealthReports(user);
};

// Check if user can edit health reports
export const canEditHealthReports = (user) => {
  if (!user || !user.role) return false;
  
  return [
    ROLES.ADMIN,
    ROLES.HEALTH_WORKER,
    ROLES.HEALTHCARE_PROVIDER,
    ROLES.NGO_WORKER
  ].includes(user.role);
};

// Check if user can view all reports (not just their own)
export const canViewAllReports = (user) => {
  if (!user || !user.role) return false;
  
  return [
    ROLES.ADMIN,
    ROLES.HEALTH_WORKER,
    ROLES.HEALTHCARE_PROVIDER,
    ROLES.NGO_WORKER
  ].includes(user.role);
};

// Get user-friendly role display name
export const getRoleDisplayName = (role) => {
  if (!role) return 'User';
  
  const roleMap = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.HEALTH_WORKER]: 'Health Worker',
    [ROLES.HEALTHCARE_PROVIDER]: 'Healthcare Provider',
    [ROLES.NGO_WORKER]: 'NGO Worker',
    [ROLES.PATIENT]: 'Patient',
    [ROLES.USER]: 'User'
  };
  
  return roleMap[role] || role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

