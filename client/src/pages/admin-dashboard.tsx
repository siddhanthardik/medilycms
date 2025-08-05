import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  TrendingUp,
  BarChart3,
  Activity,
  MapPin,
  Calendar,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Star,
  FileText,
  Building,
  Globe
} from "lucide-react";
// Note: Permission checking will be handled server-side

// Statistics Cards Component
function StatisticsCards({ analytics, isLoading }: { analytics: any; isLoading: boolean }) {
  const stats = [
    {
      title: "Total Programs",
      value: analytics?.totalPrograms || 0,
      change: "+12%",
      changeType: "positive",
      icon: ClipboardList,
      description: "Active clinical rotation programs"
    },
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      change: "+8%",
      changeType: "positive", 
      icon: Users,
      description: "Registered medical professionals"
    },
    {
      title: "Total Applications",
      value: analytics?.totalApplications || 0,
      change: "+15%",
      changeType: "positive",
      icon: FileText,
      description: "Applications submitted this month"
    },
    {
      title: "Revenue",
      value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: "+23%",
      changeType: "positive",
      icon: DollarSign,
      description: "Total platform revenue"
    },
    {
      title: "Success Rate",
      value: `${analytics?.applicationSuccessRate || 0}%`,
      change: "+5%",
      changeType: "positive",
      icon: CheckCircle,
      description: "Application acceptance rate"
    },
    {
      title: "Active Countries",
      value: analytics?.activeCountries || 0,
      change: "+2",
      changeType: "positive",
      icon: Globe,
      description: "Countries with active programs"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Analytics Charts Component
function AnalyticsCharts({ analytics, isLoading }: { analytics: any; isLoading: boolean }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      {/* Application Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Application Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-2 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Pending", value: analytics?.applicationStats?.pending || 0, color: "bg-yellow-500" },
                { label: "Accepted", value: analytics?.applicationStats?.accepted || 0, color: "bg-green-500" },
                { label: "Rejected", value: analytics?.applicationStats?.rejected || 0, color: "bg-red-500" },
                { label: "Waitlisted", value: analytics?.applicationStats?.waitlisted || 0, color: "bg-blue-500" }
              ].map((status, index) => {
                const total = Object.values(analytics?.applicationStats || {}).reduce((sum: number, val: any) => sum + val, 0);
                const percentage = total > 0 ? Math.round((status.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={percentage} className="w-24" />
                      <span className="text-sm text-gray-600 w-8">{status.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Program Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Observership", value: analytics?.programStats?.observership || 0, color: "bg-blue-500" },
                { label: "Hands-on", value: analytics?.programStats?.hands_on || 0, color: "bg-green-500" },
                { label: "Fellowship", value: analytics?.programStats?.fellowship || 0, color: "bg-purple-500" },
                { label: "Clerkship", value: analytics?.programStats?.clerkship || 0, color: "bg-orange-500" }
              ].map((type, index) => {
                const total = Object.values(analytics?.programStats || {}).reduce((sum: number, val: any) => sum + val, 0);
                const percentage = total > 0 ? Math.round((type.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={percentage} className="w-24" />
                      <span className="text-sm text-gray-600 w-8">{type.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not authenticated or not authorized admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    // Check if user is admin AND has adminRole (only Medily representatives)
    if (!isLoading && isAuthenticated && (!(user as any)?.isAdmin || !(user as any)?.adminRole)) {
      toast({
        title: "Access Denied",
        description: "You don't have authorization to access the admin panel. This panel is restricted to authorized Medily representatives only.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: isAuthenticated && (user as any)?.isAdmin && (user as any)?.adminRole,
    retry: false,
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ['/api/programs'],
    enabled: isAuthenticated && (user as any)?.isAdmin && (user as any)?.adminRole,
    retry: false,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications'],
    enabled: isAuthenticated && (user as any)?.isAdmin && (user as any)?.adminRole,
    retry: false,
  });

  const isSuperAdmin = (user as any)?.adminRole === 'super_admin';

  if (!isAuthenticated || isLoading || !(user as any)?.isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/cms"}
            >
              <FileText className="mr-2 h-4 w-4" />
              Content Management
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "/admin/add-program"}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Program
            </Button>
          </div>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {analyticsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : analytics ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{(analytics as any)?.totalPrograms || 0}</p>
                      <p className="text-gray-600">Total Programs</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{(analytics as any)?.totalUsers || 0}</p>
                      <p className="text-gray-600">Total Users</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{(analytics as any)?.pendingApplications || 0}</p>
                      <p className="text-gray-600">Pending Applications</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">${((analytics as any)?.monthlyRevenue || 0).toLocaleString()}</p>
                      <p className="text-gray-600">Monthly Revenue</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Application Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization would go here</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Popular Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-2 w-32" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (analytics as any)?.popularSpecialties ? (
                <div className="space-y-3">
                  {(analytics as any).popularSpecialties.map((specialty: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{specialty.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${((analytics as any).popularSpecialties[0] ? (specialty.count / (analytics as any).popularSpecialties[0].count) * 100 : 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{specialty.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Dashboard with Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="financial">Financial</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatisticsCards analytics={analytics} isLoading={analyticsLoading} />
            <AnalyticsCharts analytics={analytics} isLoading={analyticsLoading} />
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))
                  ) : (
                    [
                      { action: "New application submitted", user: "Dr. Sarah Johnson", time: "2 minutes ago", icon: FileText, color: "text-blue-600" },
                      { action: "Program approved", user: "Johns Hopkins", time: "15 minutes ago", icon: CheckCircle, color: "text-green-600" },
                      { action: "User registered", user: "Dr. Michael Chen", time: "32 minutes ago", icon: Users, color: "text-purple-600" },
                      { action: "Payment processed", user: "Harvard Medical School", time: "1 hour ago", icon: DollarSign, color: "text-green-600" },
                      { action: "Review submitted", user: "Dr. Emily Davis", time: "2 hours ago", icon: Star, color: "text-yellow-600" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Program Management</CardTitle>
                  <Button 
                    onClick={() => window.location.href = '/admin/add-program'}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-64 mb-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (programs as any)?.programs && (programs as any)?.programs?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Program
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applications
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(programs as any)?.programs?.slice(0, 10).map((program: any) => (
                          <tr key={program.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{program.title}</div>
                                <div className="text-sm text-gray-500">
                                  {program.duration} weeks • ${program.cost || 'Free'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                {program.city}, {program.country}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" className="capitalize">
                                {program.type.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {Math.floor(Math.random() * 25) + 5}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  Edit
                                </Button>
                                {isSuperAdmin && (
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first clinical rotation program.</p>
                    <Button onClick={() => window.location.href = '/admin/add-program'} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-900">{(analytics as any)?.totalUsers || 0}</p>
                          <p className="text-sm text-blue-600">Total Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-900">{(analytics as any)?.activeUsers || 0}</p>
                          <p className="text-sm text-green-600">Active Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-purple-900">{(analytics as any)?.newUsersThisMonth || 0}</p>
                          <p className="text-sm text-purple-600">New This Month</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* User list would be implemented here with real data */}
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">User management interface would be implemented here</p>
                    {isSuperAdmin && (
                      <p className="text-sm text-gray-400 mt-2">Super Admin: Full user management access</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Financial Analytics
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">Super Admin Only</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-900">${((analytics as any)?.totalRevenue || 0).toLocaleString()}</p>
                          <p className="text-sm text-green-600">Total Revenue</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-900">${((analytics as any)?.monthlyRevenue || 0).toLocaleString()}</p>
                          <p className="text-sm text-blue-600">Monthly Revenue</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-purple-900">${(analytics as any)?.avgTransactionValue || '0'}</p>
                          <p className="text-sm text-purple-600">Avg Transaction</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-orange-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-orange-900">{(analytics as any)?.pendingPayments || '0'}</p>
                          <p className="text-sm text-orange-600">Pending Payments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">Detailed financial reports and payment management would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
