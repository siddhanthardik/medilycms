import { useState, useEffect, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
  Activity,
  Building2,
  ChevronLeft
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
  const { data: programsData, isLoading: programsLoading } = useQuery<{
    programs: any[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
  }>({
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
    enabled: !!user && activeView === 'dashboard'
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
    if (fetchedPreferences && typeof fetchedPreferences === 'object') {
      setPreferences({
        specialties: (fetchedPreferences as any).specialties || [],
        preferredMonths: (fetchedPreferences as any).preferredMonths || [],
        preferredLocations: (fetchedPreferences as any).preferredLocations || []
      });
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

  // Handle apply to program with production-grade error handling
  const handleApplyToProgram = async (programId: string, programTitle: string) => {
    if (!programId) {
      toast({
        title: "Error",
        description: "Invalid program selected",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for programs",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }

    try {
      const response = await fetch("/api/student/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Application Submitted",
          description: `Your application for ${programTitle || 'this program'} has been submitted successfully!`,
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

  // Filter programs with proper null checks
  const filteredPrograms = useMemo(() => {
    if (!programs || !Array.isArray(programs)) return [];
    
    return programs.filter((program: any) => {
      if (!program) return false;
      
      const searchLower = searchTerm?.toLowerCase() || '';
      const matchesSearch = !searchTerm || 
                           program.title?.toLowerCase().includes(searchLower) ||
                           program.hospitalName?.toLowerCase().includes(searchLower) ||
                           program.specialty?.toLowerCase().includes(searchLower) ||
                           program.location?.toLowerCase().includes(searchLower);
      const matchesSpecialty = filterSpecialty === "all" || program.specialty === filterSpecialty;
      const matchesLocation = filterLocation === "all" || program.location?.includes(filterLocation);
      return matchesSearch && matchesSpecialty && matchesLocation;
    });
  }, [programs, searchTerm, filterSpecialty, filterLocation]);

  // Pagination logic
  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPrograms.slice(startIndex, endIndex);
  }, [filteredPrograms, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  // Get unique values for filters with memoization
  const specialties = useMemo(() => {
    if (!programs || !Array.isArray(programs)) return [];
    return Array.from(new Set(programs.map((p: any) => p.specialty).filter(Boolean))).sort();
  }, [programs]);
  
  const locations = useMemo(() => {
    if (!programs || !Array.isArray(programs)) return [];
    return Array.from(new Set(programs.map((p: any) => p.location).filter(Boolean))).sort();
  }, [programs]);

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
                  className={activeView === 'dashboard' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeView === 'programs' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('programs')}
                  className={activeView === 'programs' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
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
          // Programs View - Modern UI matching the screenshot
          <div className="space-y-6">
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                {filtersOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Header with Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Sidebar Filters */}
              <div className={`lg:w-64 space-y-6 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">Filters</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiltersOpen(false)}
                        className="lg:hidden"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Specialty Filter */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Specialty</Label>
                      <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                        <SelectTrigger className="w-full">
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
                    </div>

                    {/* Program Type Filter */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Program Type</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="observership" />
                          <label htmlFor="observership" className="text-sm cursor-pointer">
                            Observership
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="hands-on" />
                          <label htmlFor="hands-on" className="text-sm cursor-pointer">
                            Hands-on Training
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="fellowship" />
                          <label htmlFor="fellowship" className="text-sm cursor-pointer">
                            Fellowship
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="clerkship" />
                          <label htmlFor="clerkship" className="text-sm cursor-pointer">
                            Clerkship
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Cost Filter */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Cost</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="free" />
                          <label htmlFor="free" className="text-sm cursor-pointer">
                            Free Programs
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="paid" />
                          <label htmlFor="paid" className="text-sm cursor-pointer">
                            Paid Programs
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Duration Filter */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Duration (weeks)</Label>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0]}
                          max={52}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Minimum</span>
                          <span>52 weeks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 space-y-4">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Available Rotations</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      Showing {filteredPrograms.length} programs
                    </span>
                    <Select defaultValue="relevant">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevant">Most Relevant</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Programs List */}
                {programsLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div className="flex gap-2 mb-3">
                              <div className="h-6 w-24 bg-gray-200 rounded skeleton-shimmer" />
                              <div className="h-6 w-20 bg-gray-200 rounded skeleton-shimmer" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="h-6 w-3/4 bg-gray-200 rounded skeleton-shimmer" />
                            <div className="h-4 w-full bg-gray-200 rounded skeleton-shimmer" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded skeleton-shimmer" />
                            <div className="flex gap-4 mt-4">
                              <div className="h-5 w-24 bg-gray-200 rounded skeleton-shimmer" />
                              <div className="h-5 w-24 bg-gray-200 rounded skeleton-shimmer" />
                              <div className="h-5 w-24 bg-gray-200 rounded skeleton-shimmer" />
                            </div>
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full skeleton-shimmer" />
                                <div className="space-y-2">
                                  <div className="h-4 w-32 bg-gray-200 rounded skeleton-shimmer" />
                                  <div className="h-3 w-24 bg-gray-200 rounded skeleton-shimmer" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="h-8 w-8 bg-gray-200 rounded mb-2 skeleton-shimmer" />
                            <div className="h-8 w-20 bg-gray-200 rounded mb-3 skeleton-shimmer" />
                            <div className="h-10 w-28 bg-gray-200 rounded skeleton-shimmer" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredPrograms.length === 0 ? (
                  <Card className="p-12 text-center">
                    <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No programs found</h3>
                    <p className="text-gray-500">Try adjusting your search filters or check back later for new programs.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {paginatedPrograms.map((program: any) => (
                      <Card 
                        key={program.id}
                        className="p-6 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-0 cursor-pointer group hover-lift fade-in"
                        onClick={() => setLocation(`/programs/${program.id}`)}
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Program Type Badge */}
                          <div className="flex-shrink-0">
                            <div className="flex gap-2 mb-3">
                              <Badge 
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200"
                              >
                                {program.type || 'Observership'}
                              </Badge>
                              {program.availableSeats && program.availableSeats > 0 && (
                                <Badge 
                                  variant="secondary"
                                  className="bg-green-100 text-green-700"
                                >
                                  Available
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Main Content */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors duration-200">
                              {program.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {program.description || `This program is designed for medical students seeking an in-depth observational experience within a fast-paced ${program.specialty} environment.`}
                            </p>
                            
                            {/* Program Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{program.location || program.city || 'Location TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{program.duration || '4 weeks'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{program.startDate ? new Date(program.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Flexible'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{program.availableSeats || 5} of {program.totalSeats || 5} seats</span>
                              </div>
                            </div>

                            {/* Mentor Info */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {program.mentorName ? program.mentorName.charAt(0).toUpperCase() : 'D'}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{program.mentorName || 'Dr John Smith'}</p>
                                <p className="text-xs text-gray-600">{program.mentorTitle || `Chief of ${program.specialty} Unit`}</p>
                                <p className="text-xs text-gray-500">{program.hospitalName || 'Medical Center'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Price and Action */}
                          <div className="flex flex-col items-end justify-between">
                            {/* Favorite Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteMutation.mutate(program.id);
                              }}
                              className="mb-2 hover:bg-gray-100 transition-all duration-200"
                            >
                              <Heart 
                                className={`h-5 w-5 transition-all duration-300 ${
                                  favoritePrograms.has(program.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-gray-400 hover:text-red-500'
                                }`}
                              />
                            </Button>

                            {/* Price */}
                            <div className="text-right mb-3">
                              <p className="text-2xl font-bold">
                                {program.fee && program.fee > 0 ? (
                                  <>
                                    ${Number(program.fee).toLocaleString()}
                                  </>
                                ) : (
                                  <span className="text-green-600">Free</span>
                                )}
                              </p>
                            </div>

                            {/* Apply Button */}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyToProgram(program.id, program.title);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ripple scale-click"
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>

                        {/* Hands-On Badge */}
                        {program.isHandsOn && (
                          <div className="mt-4 inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                            <Badge variant="outline" className="border-green-600 text-green-600">
                              Hands On
                            </Badge>
                            <span className="text-xs">- {program.duration || '2 seats left'}</span>
                          </div>
                        )}
                      </Card>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="bg-white hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={currentPage === pageNum ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-white hover:bg-gray-50"}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="bg-white hover:bg-gray-50"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>


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