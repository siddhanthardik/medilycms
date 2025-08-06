import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminNavbar() {
  const { adminUser } = useAdminAuth();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        window.location.href = '/admin-login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin-login';
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'AD';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/admin-dashboard">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-primary">MEDILY</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Admin</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link href="/admin-dashboard">
              <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
            </Link>
            <Link href="/cms-dashboard">
              <Button variant="ghost" className="text-sm font-medium">CMS</Button>
            </Link>
            <Link href="/user-management">
              <Button variant="ghost" className="text-sm font-medium">Users</Button>
            </Link>
            <Link href="/team-management">
              <Button variant="ghost" className="text-sm font-medium">Team</Button>
            </Link>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Welcome back, <span className="font-medium">{adminUser?.firstName || 'Admin'}</span>
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={adminUser?.profileImageUrl} 
                      alt={`${adminUser?.firstName} ${adminUser?.lastName}`}
                    />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getInitials(adminUser?.firstName, adminUser?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {adminUser?.firstName} {adminUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {adminUser?.email}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    {adminUser?.adminRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
                
                <DropdownMenuItem asChild>
                  <Link href="/admin-dashboard" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/cms-dashboard" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    CMS Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}