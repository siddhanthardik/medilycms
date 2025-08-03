import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Heart,
  User,
  Mail,
  GraduationCap,
  Calendar
} from "lucide-react";

export default function UserDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated || isLoading) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mockApplications = [
    {
      id: "1",
      programTitle: "Cardiology - Johns Hopkins",
      status: "accepted",
      applicationDate: "2024-01-15",
    },
    {
      id: "2", 
      programTitle: "Emergency Medicine - Mayo Clinic",
      status: "pending",
      applicationDate: "2024-01-20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications?.filter((app: any) => app.status === 'accepted').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications?.filter((app: any) => app.status === 'pending').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {favorites?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application: any) => (
                    <div key={application.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {application.programTitle || 'Program Title'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Applied on {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-4">Start by browsing available programs.</p>
                  <Button>Browse Programs</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={user?.firstName || ""}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={user?.lastName || ""}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    placeholder="Enter email"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medicalSchool">Medical School</Label>
                    <Input
                      id="medicalSchool"
                      value={user?.medicalSchool || ""}
                      placeholder="Enter medical school"
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={user?.graduationYear || ""}
                      placeholder="Enter graduation year"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="specialtyOfInterest">Specialty of Interest</Label>
                  <Input
                    id="specialtyOfInterest"
                    value={user?.specialtyOfInterest || ""}
                    placeholder="Enter specialty"
                  />
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorites Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Favorite Programs</CardTitle>
          </CardHeader>
          <CardContent>
            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((favorite: any) => (
                  <div key={favorite.id} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {favorite.programTitle || 'Favorite Program'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Added on {new Date(favorite.createdAt).toLocaleDateString()}
                    </p>
                    <Button size="sm" variant="outline">
                      View Program
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-4">Save programs you're interested in to find them easily later.</p>
                <Button>Browse Programs</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
