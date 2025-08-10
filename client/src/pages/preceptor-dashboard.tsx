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
  Stethoscope,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  LogOut,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Activity,
  MapPin,
  Bell,
  Settings
} from "lucide-react";

export default function PreceptorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/current-user"],
  });

  // Fetch preceptor's programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["/api/preceptor/programs"],
    enabled: !!user,
  });

  // Fetch applications for preceptor's programs
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/preceptor/applications"],
    enabled: !!user,
  });

  // Check authentication and role
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard",
        variant: "destructive",
      });
      setLocation("/login");
    } else if (user && user.role !== "preceptor") {
      toast({
        title: "Access Denied",
        description: "This dashboard is for preceptors only",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, userLoading, setLocation, toast]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "waitlisted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApplicationDecision = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/preceptor/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes: notes }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Application ${status} successfully`,
        });
        window.location.reload();
      } else {
        throw new Error("Failed to update application");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">MEDILY</span>
              </div>
              <Badge variant="secondary">Preceptor Portal</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                onClick={() => setLocation("/add-program")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Program
              </Button>
              
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">
                  Dr. {user?.firstName} {user?.lastName}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your clinical rotation programs and review applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {programs.length}
                  </p>
                  <p className="text-gray-600">Total Programs</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.length}
                  </p>
                  <p className="text-gray-600">Total Applications</p>
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
                    {applications.filter((app: any) => app.status === 'pending').length}
                  </p>
                  <p className="text-gray-600">Pending Review</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.filter((app: any) => app.status === 'accepted').length}
                  </p>
                  <p className="text-gray-600">Accepted</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="programs">My Programs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>
                  Review and manage applications for your programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <div
                        key={application.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">
                              {application.user?.firstName} {application.user?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              <strong>Program:</strong> {application.program?.title}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>📧 {application.user?.email}</span>
                              <span>📱 {application.user?.phoneNumber || "N/A"}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Medical School:</strong> {application.user?.medicalSchool || "Not provided"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Applied on: {new Date(application.applicationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                            {application.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApplicationDecision(application.id, 'accepted')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    const notes = prompt("Rejection reason (optional):");
                                    handleApplicationDecision(application.id, 'rejected', notes || undefined);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {application.essayResponses && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <strong className="text-sm">Essay Response:</strong>
                            <p className="text-sm mt-1">{application.essayResponses}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Applications will appear here once students apply to your programs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Programs</CardTitle>
                    <CardDescription>
                      Manage your clinical rotation programs
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setLocation("/add-program")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : programs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.map((program: any) => (
                      <div
                        key={program.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{program.title}</h3>
                          <Badge variant={program.isActive ? "default" : "secondary"}>
                            {program.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {program.city}, {program.country}
                          </p>
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {program.duration} weeks
                          </p>
                          <p className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${program.price}
                          </p>
                          <p className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {applications.filter((app: any) => app.programId === program.id).length} applications
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setLocation(`/edit-program/${program.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setLocation(`/program/${program.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No programs yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first clinical rotation program
                    </p>
                    <Button 
                      onClick={() => setLocation("/add-program")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Application Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Application trends chart</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Program Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {programs.slice(0, 3).map((program: any) => (
                      <div key={program.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{program.title}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(applications.filter((app: any) => app.programId === program.id).length / Math.max(applications.length, 1)) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {applications.filter((app: any) => app.programId === program.id).length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((application: any) => (
                    <div key={application.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 rounded-full bg-white">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New application from {application.user?.firstName} {application.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {application.program?.title} • {new Date(application.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}