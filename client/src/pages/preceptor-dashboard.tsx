import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit, 
  Eye,
  LogOut,
  GraduationCap,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import medilyLogoSrc from "@assets/medily-website-logo_1754424305557.jpg";

// Program form schema
const programSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["observership", "hands_on", "fellowship", "clerkship"]),
  specialtyId: z.string().min(1, "Specialty is required"),
  hospitalName: z.string().min(1, "Hospital name is required"),
  mentorName: z.string().min(1, "Mentor name is required"),
  mentorTitle: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  startDate: z.string().min(1, "Start date is required"),
  duration: z.string().min(1, "Duration is required"),
  availableSeats: z.string().min(1, "Available seats is required"),
  totalSeats: z.string().min(1, "Total seats is required"),
  fee: z.string().optional(),
  currency: z.string().default("USD"),
  isHandsOn: z.boolean().default(false),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
});

export default function PreceptorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  // Check if user is authenticated as preceptor
  const { data: preceptor, isLoading: authLoading } = useQuery({
    queryKey: ['/api/preceptor/current-user'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/preceptor/current-user");
      return response.json();
    },
    retry: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !preceptor) {
      window.location.href = "/preceptor-login";
    }
  }, [preceptor, authLoading]);

  // Form setup
  const programForm = useForm<z.infer<typeof programSchema>>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      type: "observership",
      currency: "USD",
      isHandsOn: false,
    },
  });

  // Data queries
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['/api/preceptor/programs'],
    enabled: !!preceptor,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/preceptor/applications'],
    enabled: !!preceptor,
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['/api/specialties'],
    enabled: !!preceptor,
  });

  // Mutations
  const createProgram = useMutation({
    mutationFn: async (data: z.infer<typeof programSchema>) => {
      const payload = {
        ...data,
        duration: parseInt(data.duration),
        availableSeats: parseInt(data.availableSeats),
        totalSeats: parseInt(data.totalSeats),
        fee: data.fee ? parseFloat(data.fee) : null,
        requirements: data.requirements ? data.requirements.split('\n').filter(req => req.trim()) : [],
        startDate: new Date(data.startDate).toISOString(),
      };
      return apiRequest("POST", "/api/preceptor/programs", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preceptor/programs'] });
      setProgramDialogOpen(false);
      programForm.reset();
      toast({ title: "Success", description: "Program created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create program", variant: "destructive" });
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ applicationId, status, notes }: { applicationId: string; status: string; notes?: string }) => {
      return apiRequest("PUT", `/api/preceptor/applications/${applicationId}`, { status, reviewNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preceptor/applications'] });
      toast({ title: "Success", description: "Application status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/preceptor/logout";
  };

  const onCreateProgram = (data: z.infer<typeof programSchema>) => {
    createProgram.mutate(data);
  };

  const handleEditProgram = (program: any) => {
    setSelectedProgram(program);
    programForm.reset({
      ...program,
      startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '',
      duration: program.duration?.toString() || '',
      availableSeats: program.availableSeats?.toString() || '',
      totalSeats: program.totalSeats?.toString() || '',
      fee: program.fee?.toString() || '',
      requirements: Array.isArray(program.requirements) ? program.requirements.join('\n') : program.requirements || '',
    });
    setProgramDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, icon: AlertCircle, text: "Pending" },
      accepted: { variant: "default" as const, icon: CheckCircle, text: "Accepted" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Rejected" },
      visa_pending: { variant: "secondary" as const, icon: Clock, text: "Visa Pending" },
      visa_confirmed: { variant: "default" as const, icon: CheckCircle, text: "Visa Confirmed" },
      enrolled: { variant: "default" as const, icon: GraduationCap, text: "Enrolled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated
  if (!preceptor) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={medilyLogoSrc} alt="Medily" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-semibold">Preceptor Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, Dr. {preceptor.firstName} {preceptor.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter((app: any) => app.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter((app: any) => app.status === 'enrolled').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="programs">My Programs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Programs</h2>
              <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setSelectedProgram(null); programForm.reset(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Program
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedProgram ? "Edit Program" : "Create New Program"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedProgram ? "Update your program details" : "Add a new clinical rotation program"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...programForm}>
                    <form onSubmit={programForm.handleSubmit(onCreateProgram)} className="space-y-4">
                      <FormField
                        control={programForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Program Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency Medicine Observership" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={programForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="observership">Observership</SelectItem>
                                  <SelectItem value="hands_on">Hands-on Training</SelectItem>
                                  <SelectItem value="fellowship">Fellowship</SelectItem>
                                  <SelectItem value="clerkship">Clerkship</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="specialtyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialty</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select specialty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {specialties.map((specialty: any) => (
                                    <SelectItem key={specialty.id} value={specialty.id}>
                                      {specialty.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={programForm.control}
                          name="hospitalName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hospital Name</FormLabel>
                              <FormControl>
                                <Input placeholder="City General Hospital" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="mentorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mentor Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Dr. John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={programForm.control}
                        name="mentorTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mentor Title (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Chief of Emergency Medicine" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={programForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="USA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Location</FormLabel>
                              <FormControl>
                                <Input placeholder="New York, USA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={programForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (weeks)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="4" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="fee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fee (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="1000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={programForm.control}
                          name="availableSeats"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available Seats</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={programForm.control}
                          name="totalSeats"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Seats</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={programForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the program objectives, learning outcomes, and what students can expect..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={programForm.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirements (One per line)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Medical degree&#10;Valid medical license&#10;Insurance coverage"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setProgramDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProgram.isPending}>
                          {createProgram.isPending ? "Creating..." : selectedProgram ? "Update Program" : "Create Program"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Programs List */}
            <div className="grid gap-6">
              {programsLoading ? (
                <div className="text-center py-8">Loading programs...</div>
              ) : programs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No programs yet</h3>
                    <p className="text-gray-600 mb-4">Create your first clinical rotation program to get started.</p>
                    <Button onClick={() => setProgramDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Program
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                programs.map((program: any) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{program.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {program.specialtyName} • {program.type}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditProgram(program)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{program.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(program.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{program.duration} weeks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{program.availableSeats}/{program.totalSeats} seats</span>
                        </div>
                      </div>
                      {program.fee && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>${program.fee} {program.currency}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold">Applications</h2>

            {applicationsLoading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here once students start applying to your programs.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visa Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application: any) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.user?.firstName} {application.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{application.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{application.program?.title}</div>
                        </TableCell>
                        <TableCell>
                          {new Date(application.applicationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            application.visaStatus === 'approved' ? 'default' :
                            application.visaStatus === 'pending' ? 'secondary' :
                            application.visaStatus === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {application.visaStatus || 'Not Required'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {application.joinDate ? new Date(application.joinDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              value={application.status}
                              onValueChange={(status) => updateApplicationStatus.mutate({ 
                                applicationId: application.id, 
                                status 
                              })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accept</SelectItem>
                                <SelectItem value="rejected">Reject</SelectItem>
                                <SelectItem value="visa_pending">Visa Pending</SelectItem>
                                <SelectItem value="visa_confirmed">Visa Confirmed</SelectItem>
                                <SelectItem value="enrolled">Enrolled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}