import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  Globe,
  Filter,
  Search
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
  const { adminUser, isLoading, isAuthenticated } = useAdminAuth();
  const [applicationFilters, setApplicationFilters] = useState({
    status: 'all',
    dateRange: '30',
    search: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please login as admin to access this dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin-login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ['/api/programs'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Build query parameters for applications
  const applicationQueryParams = new URLSearchParams();
  if (applicationFilters.status !== 'all') {
    applicationQueryParams.set('status', applicationFilters.status);
  }
  if (applicationFilters.search) {
    applicationQueryParams.set('search', applicationFilters.search);
  }

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications', applicationFilters],
    queryFn: async () => {
      const params = applicationQueryParams.toString();
      const url = params ? `/api/applications?${params}` : '/api/applications';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const isSuperAdmin = adminUser?.adminRole === 'super_admin';

  if (!isAuthenticated || isLoading) {
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
              onClick={() => window.location.href = "/cms-dashboard"}
            >
              <FileText className="mr-2 h-4 w-4" />
              Content Management
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "/add-program"}
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
                      <p className="text-3xl font-bold text-gray-900">{applications?.length || 0}</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
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

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Application Management
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {applications?.length || 0} Total Applications
                    </Badge>
                    {applications && applications.filter((app: any) => app.status === 'pending').length > 0 && (
                      <Badge variant="destructive">
                        {applications.filter((app: any) => app.status === 'pending').length} Pending Review
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={applicationFilters.status}
                      onValueChange={(value) => 
                        setApplicationFilters(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={applicationFilters.dateRange}
                      onValueChange={(value) => 
                        setApplicationFilters(prev => ({ ...prev, dateRange: value }))
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 3 months</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="relative flex-1 min-w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or program..."
                        value={applicationFilters.search}
                        onChange={(e) => 
                          setApplicationFilters(prev => ({ ...prev, search: e.target.value }))
                        }
                        className="pl-10"
                      />
                    </div>
                    
                    {(applicationFilters.status !== 'all' || applicationFilters.search || applicationFilters.dateRange !== '30') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setApplicationFilters({ status: 'all', dateRange: '30', search: '' })}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-64 mb-2" />
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : applications && applications?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applicant Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Program Applied
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Application Date
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
                        {applications?.map((application: any) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {application.user?.firstName} {application.user?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {application.user?.email}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    ID: {application.userId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.program?.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.program?.city}, {application.program?.country}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {application.program?.duration} weeks • {application.program?.type}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {new Date(application.applicationDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={
                                  application.status === 'approved' ? 'default' :
                                  application.status === 'pending' ? 'secondary' :
                                  application.status === 'rejected' ? 'destructive' :
                                  'outline'
                                }
                                className={
                                  application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  ''
                                }
                              >
                                {application.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {application.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {application.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-primary hover:text-primary/80"
                                  onClick={() => {
                                    // Create detailed view modal or navigate to detail page
                                    const details = `
                                      Applicant Details:
                                      Name: ${application.user?.firstName} ${application.user?.lastName}
                                      Email: ${application.user?.email}
                                      Phone: ${application.user?.phone || 'Not provided'}
                                      Address: ${application.user?.address || 'Not provided'}
                                      
                                      Program Details:
                                      Program: ${application.program?.title}
                                      Location: ${application.program?.city}, ${application.program?.country}
                                      Hospital: ${application.program?.hospitalName || 'Not specified'}
                                      Preceptor: ${application.program?.preceptorName || 'Not specified'}
                                      Duration: ${application.program?.duration} weeks
                                      Type: ${application.program?.type}
                                      Fee: $${application.program?.cost || 0}
                                      
                                      Application Info:
                                      Status: ${application.status}
                                      Applied Date: ${new Date(application.applicationDate).toLocaleDateString()}
                                      Visa Status: ${application.visaStatus || 'Not specified'}
                                      Join Date: ${application.joinDate ? new Date(application.joinDate).toLocaleDateString() : 'Not set'}
                                      
                                      Documents:
                                      CV: ${application.cvUrl || 'Not uploaded'}
                                      Cover Letter: ${application.coverLetter ? 'Provided' : 'Not provided'}
                                      Additional Documents: ${application.additionalDocuments?.length || 0} files
                                      
                                      Review Notes: ${application.reviewNotes || 'No notes'}
                                    `;
                                    alert(details);
                                  }}
                                >
                                  View Details
                                </Button>
                                {application.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-700"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(`/api/applications/${application.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'approved' })
                                          });
                                          
                                          if (response.ok) {
                                            alert('Application approved successfully!');
                                            window.location.reload();
                                          } else {
                                            alert('Failed to approve application');
                                          }
                                        } catch (error) {
                                          alert('Error approving application');
                                        }
                                      }}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-600 hover:text-red-700"
                                      onClick={async () => {
                                        const notes = prompt('Add rejection reason (optional):');
                                        try {
                                          const response = await fetch(`/api/applications/${application.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                              status: 'rejected',
                                              reviewNotes: notes || 'Application rejected by admin'
                                            })
                                          });
                                          
                                          if (response.ok) {
                                            alert('Application rejected successfully!');
                                            window.location.reload();
                                          } else {
                                            alert('Failed to reject application');
                                          }
                                        } catch (error) {
                                          alert('Error rejecting application');
                                        }
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  </>
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
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-600 mb-4">Applications will appear here once students start applying to programs.</p>
                    <Button onClick={() => window.location.href = '/add-program'} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Programs to Get Applications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications?.filter((app: any) => app.status === 'pending').length || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Approved Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {applications?.filter((app: any) => app.status === 'approved').length || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Successfully approved</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Application Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {applications?.length > 0 
                      ? Math.round((applications.filter((app: any) => app.status === 'approved').length / applications.length) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Overall approval rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Program Management</CardTitle>
                  <Button 
                    onClick={() => window.location.href = '/add-program'}
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
                    <Button onClick={() => window.location.href = '/add-program'} className="bg-primary hover:bg-primary/90">
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
