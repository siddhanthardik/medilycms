// Admin Permission Management
export interface AdminPermissions {
  // Program Management
  create_programs: boolean;
  modify_programs: boolean;
  delete_programs: boolean;
  view_all_programs: boolean;
  
  // Analytics
  view_basic_analytics: boolean;
  view_complete_analytics: boolean;
  
  // User Management
  view_users: boolean;
  manage_users: boolean;
  
  // Financial
  view_payments: boolean;
  manage_payment_gateway: boolean;
  
  // Marketing
  create_coupons: boolean;
  manage_marketing: boolean;
  
  // Applications & Enrollments
  view_enrollments: boolean;
  manage_applications: boolean;
  view_booking_status: boolean;
}

export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  create_programs: true,
  modify_programs: true,
  delete_programs: true,
  view_all_programs: true,
  view_basic_analytics: true,
  view_complete_analytics: true,
  view_users: true,
  manage_users: true,
  view_payments: true,
  manage_payment_gateway: true,
  create_coupons: true,
  manage_marketing: true,
  view_enrollments: true,
  manage_applications: true,
  view_booking_status: true,
};

export const REGULAR_ADMIN_PERMISSIONS: AdminPermissions = {
  create_programs: true,
  modify_programs: false,
  delete_programs: false,
  view_all_programs: true,
  view_basic_analytics: true,
  view_complete_analytics: false,
  view_users: false,
  manage_users: false,
  view_payments: true,
  manage_payment_gateway: false,
  create_coupons: true,
  manage_marketing: false,
  view_enrollments: true,
  manage_applications: true,
  view_booking_status: true,
};

export function hasPermission(user: any, permission: keyof AdminPermissions): boolean {
  if (!user?.isAdmin) return false;
  
  if (user.adminRole === 'super_admin') {
    return SUPER_ADMIN_PERMISSIONS[permission];
  }
  
  if (user.adminRole === 'regular_admin') {
    return REGULAR_ADMIN_PERMISSIONS[permission];
  }
  
  // Check custom permissions if any
  const userPermissions = user.adminPermissions as string[] || [];
  return userPermissions.includes(permission);
}

export function getUserPermissions(user: any): AdminPermissions {
  if (!user?.isAdmin) {
    return Object.keys(SUPER_ADMIN_PERMISSIONS).reduce((acc, key) => {
      acc[key as keyof AdminPermissions] = false;
      return acc;
    }, {} as AdminPermissions);
  }
  
  if (user.adminRole === 'super_admin') {
    return SUPER_ADMIN_PERMISSIONS;
  }
  
  if (user.adminRole === 'regular_admin') {
    return REGULAR_ADMIN_PERMISSIONS;
  }
  
  // Default fallback
  return REGULAR_ADMIN_PERMISSIONS;
}