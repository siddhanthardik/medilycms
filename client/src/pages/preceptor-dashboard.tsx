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
  Users, 
  FileText, 
  Calendar, 
  Settings,
  LogOut,
  School,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Star,
  GraduationCap
} from "lucide-react";

export default function PreceptorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/current-user"],
  });

  // Fetch preceptor's programs
  const { data: myProgramsData, isLoading: myProgramsLoading } = useQuery({
    queryKey: ["/api/preceptor/programs"],
    enabled: !!user,
  });
  
  const myPrograms = myProgramsData?.programs || [];

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
              <Stethoscope className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Preceptor Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, Dr. {user?.lastName}</p>
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
                    {myPrograms.length}
                  </p>
                  <p className="text-gray-600">My Programs</p>
                </div>
                <School className="h-8 w-8 text-blue-600" />
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
                <FileText className="h-8 w-8 text-green-600" />
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
                  <p className="text-gray-600">Accepted Students</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programs">My Programs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Clinical Programs</CardTitle>
                    <CardDescription>
                      Manage your clinical rotation programs
                    </CardDescription>
                  </div>
                  <Button onClick={() => setLocation("/programs/new")}>
                    Add New Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {myProgramsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : myPrograms.length > 0 ? (
                  <div className="space-y-4">
                    {myPrograms.map((program: any) => (
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
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">You haven't created any programs yet</p>
                    <Button onClick={() => setLocation("/programs/new")}>
                      Create Your First Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Applications</CardTitle>
                <CardDescription>
                  Review and manage applications for your programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {application.studentName || 'Student Name'}
                              </h4>
                              <Badge
                                variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' :
                                  application.status === 'pending' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {application.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Applied for: {application.programName}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Applied on: {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                            {application.coverLetter && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {application.coverLetter}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {application.status === 'pending' && (
                              <>
                                <Button size="sm" variant="default">
                                  Accept
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No applications yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Students</CardTitle>
                <CardDescription>
                  Students currently enrolled in your programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications
                      .filter((app: any) => app.status === 'accepted')
                      .map((student: any) => (
                        <div
                          key={student.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">
                                {student.studentName || 'Student Name'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {student.programName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Started: {new Date(student.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View Progress
                              </Button>
                              <Button size="sm" variant="ghost">
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {applications.filter((app: any) => app.status === 'accepted').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No enrolled students yet
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}