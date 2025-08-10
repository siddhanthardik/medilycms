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
  GraduationCap, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  LogOut,
  Stethoscope,
  Bell,
  Settings,
  Home
} from "lucide-react";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/current-user"],
  });

  // Fetch student's applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/student/applications"],
    enabled: !!user,
  });

  // Fetch available programs
  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/programs"],
  });
  
  const programs = programsData?.programs || [];

  // Check authentication and role
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard",
        variant: "destructive",
      });
      setLocation("/login");
    } else if (user && user.role !== "student") {
      toast({
        title: "Access Denied",
        description: "This dashboard is for students only",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "waitlisted":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">MEDILY</span>
              </div>
              <Badge variant="secondary">Student Portal</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                onClick={() => setLocation("/clinical-rotations")}
                className="bg-primary hover:bg-primary/90"
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Clinical Rotations
              </Button>
              
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
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
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your applications and explore new clinical rotation opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.length}
                  </p>
                  <p className="text-gray-600">Total Applications</p>
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
                    {applications.filter((app: any) => app.status === 'pending').length}
                  </p>
                  <p className="text-gray-600">Pending</p>
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
                    {applications.filter((app: any) => app.status === 'accepted' || app.status === 'approved').length}
                  </p>
                  <p className="text-gray-600">Accepted</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
                  <p className="text-gray-600">Available Programs</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="programs">Browse Programs</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application History</CardTitle>
                <CardDescription>
                  Track the status of your clinical rotation applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24" />
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
                              {application.program?.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.program?.city}, {application.program?.country}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {application.program?.duration} weeks
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                ${application.program?.price}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Applied on: {new Date(application.applicationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span>{application.status}</span>
                            </span>
                          </Badge>
                        </div>
                        {application.reviewNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                            <strong>Review Notes:</strong> {application.reviewNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start exploring clinical rotation programs
                    </p>
                    <Button 
                      onClick={() => setLocation("/clinical-rotations")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Browse Programs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Programs</CardTitle>
                <CardDescription>
                  Explore clinical rotation opportunities that match your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.slice(0, 4).map((program: any) => (
                      <div
                        key={program.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/program/${program.id}`)}
                      >
                        <h3 className="font-semibold mb-2">{program.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
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
                        </div>
                        <Button 
                          className="w-full mt-3"
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <p className="mt-1 text-gray-900">{user?.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <p className="mt-1 text-gray-900">{user?.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-gray-900">{user?.phoneNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Medical School</label>
                      <p className="mt-1 text-gray-900">{user?.medicalSchool || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Graduation Year</label>
                      <p className="mt-1 text-gray-900">{user?.graduationYear || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
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