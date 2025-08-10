import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield,
  Users, 
  FileText, 
  Calendar, 
  Settings,
  LogOut,
  BarChart,
  School,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  UserCheck,
  BookOpen
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/current-user"],
  });

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/statistics"],
    enabled: !!user,
  });

  // Fetch all programs
  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/programs"],
  });
  
  const programs = programsData?.programs || [];

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user,
  });

  // Check authentication and role
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the admin dashboard",
        variant: "destructive",
      });
      setLocation("/login");
    } else if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "This dashboard is for administrators only",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, userLoading, setLocation, toast]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalUsers || 0}
                  </p>
                  <p className="text-gray-600">Total Users</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {programs.filter((p: any) => p.isActive).length}
                  </p>
                  <p className="text-gray-600">Active Programs</p>
                </div>
                <School className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalApplications || 0}
                  </p>
                  <p className="text-gray-600">Total Applications</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.pendingReviews || 0}
                  </p>
                  <p className="text-gray-600">Pending Reviews</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage all users, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.slice(0, 10).map((user: any) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                                {user.role}
                              </Badge>
                              <Badge variant={user.isActive ? 'outline' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Program Management</CardTitle>
                <CardDescription>
                  Manage clinical rotation programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : programs.length > 0 ? (
                  <div className="space-y-4">
                    {programs.map((program: any) => (
                      <div
                        key={program.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{program.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {program.institution}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {program.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {program.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${program.price}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Badge variant="outline">{program.specialty}</Badge>
                              <Badge variant={program.isActive ? 'default' : 'secondary'}>
                                {program.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {program.availableSeats > 0 && (
                                <Badge variant="outline">
                                  {program.availableSeats} seats available
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No programs found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>
                  Review and manage all applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Application management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  View system analytics and generate reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">User Growth</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      Chart placeholder
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Application Trends</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      Chart placeholder
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Program Performance</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      Chart placeholder
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Revenue Overview</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      Chart placeholder
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}