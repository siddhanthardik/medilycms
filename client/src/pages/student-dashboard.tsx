import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
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
  Home,
  Heart,
  BookOpen,
  Award,
  TrendingUp,
  Filter,
  Search,
  Star,
  ChevronRight,
  Edit,
  Save,
  X,
  Briefcase,
  Users,
  Activity
} from "lucide-react";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'programs' | 'dashboard'>('programs');
  const [favoritePrograms, setFavoritePrograms] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    medicalSchool: "",
    graduationYear: "",
    bio: ""
  });

  // Clinical preferences state
  const [preferences, setPreferences] = useState({
    specialties: [] as string[],
    preferredMonths: [] as string[],
    preferredLocations: [] as string[]
  });

  // Fetch preferences query - moved after user query

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/current-user"],
  });

  // Fetch student's applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery<any[]>({
    queryKey: ["/api/student/applications"],
    enabled: !!user,
  });

  // Fetch available programs
  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/programs"],
  });
  
  const programs = programsData?.programs || [];

  // Fetch favorites
  const { data: favoritesData } = useQuery<any[]>({
    queryKey: ["/api/student/favorites"],
    enabled: !!user,
  });

  // Fetch preferences query
  const { data: fetchedPreferences } = useQuery({
    queryKey: ['/api/student/preferences'],
    enabled: !!user && currentView === 'dashboard'
  });

  useEffect(() => {
    if (favoritesData) {
      setFavoritePrograms(new Set(favoritesData.map((f: any) => f.programId)));
    }
  }, [favoritesData]);

  // Initialize profile form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        medicalSchool: user.medicalSchool || "",
        graduationYear: user.graduationYear || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  // Update local preferences when fetched
  useEffect(() => {
    if (fetchedPreferences) {
      setPreferences(fetchedPreferences);
    }
  }, [fetchedPreferences]);

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

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const isFavorite = favoritePrograms.has(programId);
      if (isFavorite) {
        const res = await apiRequest("DELETE", `/api/student/favorites/${programId}`);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/student/favorites", { programId });
        return await res.json();
      }
    },
    onSuccess: (_, programId) => {
      const newFavorites = new Set(favoritePrograms);
      if (favoritePrograms.has(programId)) {
        newFavorites.delete(programId);
        toast({
          title: "Removed from favorites",
          description: "Program removed from your favorites",
        });
      } else {
        newFavorites.add(programId);
        toast({
          title: "Added to favorites",
          description: "Program added to your favorites",
        });
      }
      setFavoritePrograms(newFavorites);
      queryClient.invalidateQueries({ queryKey: ["/api/student/favorites"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      return await apiRequest("PUT", "/api/student/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: typeof preferences) => {
      return await apiRequest("PUT", "/api/student/preferences", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Clinical preferences updated successfully",
      });
      setIsEditingPreferences(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  });

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

  // Handle apply to program
  const handleApplyToProgram = async (programId: string, programName: string) => {
    try {
      const response = await fetch("/api/student/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programId }),
      });

      if (response.ok) {
        toast({
          title: "Application Submitted",
          description: `Your application for ${programName} has been submitted successfully!`,
        });
        // Refresh applications list
        queryClient.invalidateQueries({ queryKey: ["/api/student/applications"] });
      } else {
        const error = await response.json();
        toast({
          title: "Application Failed",
          description: error.message || "Failed to submit application",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  // Filter programs
  const filteredPrograms = programs && Array.isArray(programs) ? programs.filter((program: any) => {
    const matchesSearch = !searchTerm || 
                         program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "all" || program.specialty === filterSpecialty;
    const matchesLocation = filterLocation === "all" || program.location?.includes(filterLocation);
    return matchesSearch && matchesSpecialty && matchesLocation;
  }) : [];

  // Get unique values for filters
  const specialties = programs && Array.isArray(programs) ? Array.from(new Set(programs.map((p: any) => p.specialty).filter(Boolean))) : [];
  const locations = programs && Array.isArray(programs) ? Array.from(new Set(programs.map((p: any) => p.location).filter(Boolean))) : [];

  // Calculate statistics
  const stats = {
    totalApplications: applications?.length || 0,
    pendingApplications: applications?.filter((app: any) => app.status === 'pending').length || 0,
    acceptedApplications: applications?.filter((app: any) => app.status === 'accepted' || app.status === 'approved').length || 0,
    availablePrograms: programs?.length || 0,
    favoritePrograms: favoritePrograms.size
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating shapes animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glassmorphic header */}
      <header className="relative backdrop-blur-xl bg-white/70 shadow-lg border-b border-white/20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                    Student Portal
                  </h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.firstName}</p>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('dashboard')}
                  className={activeView === 'dashboard' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : ''}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeView === 'programs' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('programs')}
                  className={activeView === 'programs' ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : ''}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Programs
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/50"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('dashboard')}
                className="hover:bg-white/50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 hover:bg-red-50 text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' ? (
          // Dashboard View
          <div className="space-y-8 animate-fadeIn">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.totalApplications}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Total Applications</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {stats.pendingApplications}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Pending</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      {stats.acceptedApplications}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Accepted</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {stats.availablePrograms}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Available</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {stats.favoritePrograms}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Favorites</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 backdrop-blur-xl bg-white/70">
                <TabsTrigger value="profile">My Profile</TabsTrigger>
                <TabsTrigger value="preferences">Clinical Preferences</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 shadow-xl border border-white/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                      Profile Information
                    </h3>
                    {!isEditingProfile ? (
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="bg-gradient-to-r from-teal-500 to-purple-600 text-white hover:opacity-90"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateProfileMutation.mutate(profileForm)}
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-green-500 to-teal-600 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              firstName: user?.firstName || "",
                              lastName: user?.lastName || "",
                              email: user?.email || "",
                              phoneNumber: user?.phoneNumber || "",
                              medicalSchool: user?.medicalSchool || "",
                              graduationYear: user?.graduationYear || "",
                              bio: user?.bio || ""
                            });
                          }}
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Medical School</Label>
                      <Input
                        value={profileForm.medicalSchool}
                        onChange={(e) => setProfileForm({...profileForm, medicalSchool: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Graduation Year</Label>
                      <Input
                        value={profileForm.graduationYear}
                        onChange={(e) => setProfileForm({...profileForm, graduationYear: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        disabled={!isEditingProfile}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preferences">
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 shadow-xl border border-white/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                      Clinical Preferences
                    </h3>
                    {!isEditingPreferences ? (
                      <Button
                        onClick={() => setIsEditingPreferences(true)}
                        className="bg-gradient-to-r from-teal-500 to-purple-600 text-white hover:opacity-90"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Preferences
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updatePreferencesMutation.mutate(preferences)}
                          disabled={updatePreferencesMutation.isPending}
                          className="bg-gradient-to-r from-green-500 to-teal-600 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                        <Button
                          onClick={() => setIsEditingPreferences(false)}
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label>Select Preferred Specialties*</Label>
                      <Select 
                        disabled={!isEditingPreferences}
                        value={preferences.specialties.join(', ')}
                        onValueChange={(value) => setPreferences({...preferences, specialties: value.split(', ')})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select specialties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Emergency Medicine, Critical Care Medicine, Family Medicine, Geriatric Medicine">
                            Emergency Medicine, Critical Care Medicine, Family Medicine, Geriatric Medicine
                          </SelectItem>
                          <SelectItem value="Internal Medicine, Pediatrics, Surgery">
                            Internal Medicine, Pediatrics, Surgery
                          </SelectItem>
                          <SelectItem value="Psychiatry, Radiology, Anesthesiology">
                            Psychiatry, Radiology, Anesthesiology
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Preferred Months*</Label>
                      <Select 
                        disabled={!isEditingPreferences}
                        value={preferences.preferredMonths.join(', ')}
                        onValueChange={(value) => setPreferences({...preferences, preferredMonths: value.split(', ')})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="June, December">June, December</SelectItem>
                          <SelectItem value="January, July">January, July</SelectItem>
                          <SelectItem value="March, September">March, September</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Preferred Locations*</Label>
                      <Select 
                        disabled={!isEditingPreferences}
                        value={preferences.preferredLocations.join(', ')}
                        onValueChange={(value) => setPreferences({...preferences, preferredLocations: value.split(', ')})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="California, Kansas, New Jersey, New York">
                            California, Kansas, New Jersey, New York
                          </SelectItem>
                          <SelectItem value="Texas, Florida, Illinois, Ohio">
                            Texas, Florida, Illinois, Ohio
                          </SelectItem>
                          <SelectItem value="Washington, Oregon, Arizona, Nevada">
                            Washington, Oregon, Arizona, Nevada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="applications">
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-6">
                    My Applications
                  </h3>

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
                          className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 bg-white/50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{application.programName}</h4>
                              <p className="text-gray-600">{application.institution}</p>
                              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                                <Badge
                                  variant={
                                    application.status === 'accepted' ? 'default' :
                                    application.status === 'rejected' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {application.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p>No applications yet</p>
                      <Button
                        onClick={() => setActiveView('programs')}
                        className="mt-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white"
                      >
                        Browse Programs
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Programs View
          <div className="space-y-8 animate-fadeIn">
            {/* Search and Filters */}
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Programs Grid */}
            {programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-12 text-center">
                <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No programs found</h3>
                <p className="text-gray-500">Try adjusting your search filters or check back later for new programs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPrograms.map((program: any) => (
                  <div
                    key={program.id}
                    className="group backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Program Image/Header */}
                    <div className="relative h-32 bg-gradient-to-br from-teal-400 to-purple-600">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-teal-500 text-white mb-2">
                          {program.availableSeats || 1} Seat{program.availableSeats !== 1 ? 's' : ''} offered
                        </Badge>
                        <h3 className="text-white font-bold text-lg line-clamp-2">
                          {program.specialty} with Clinical Adjunct Faculty
                        </h3>
                      </div>
                      {/* Favorite button */}
                      <button
                        onClick={() => toggleFavoriteMutation.mutate(program.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favoritePrograms.has(program.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-white'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Program Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{program.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                          ${program.price}
                        </div>
                        <span className="text-sm text-gray-500">USD</span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {program.programType || 'Observership'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {program.shadowing || 'Pre-Med Shadowing'}
                        </Badge>
                      </div>

                      <div className="pt-3 border-t">
                        <Button
                          className="w-full bg-gradient-to-r from-teal-500 to-purple-600 text-white hover:opacity-90 group-hover:shadow-lg transition-all"
                          onClick={() => handleApplyToProgram(program.id, program.name)}
                        >
                          Apply Now
                          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredPrograms.length === 0 && !programsLoading && (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No programs found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom styles */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}