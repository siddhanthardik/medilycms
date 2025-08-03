import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function AddProgram() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    hospitalName: "",
    mentorName: "",
    mentorTitle: "",
    location: "",
    country: "",
    city: "",
    specialtyId: "",
    duration: "",
    type: "",
    fee: "",
    description: "",
    requirements: [] as string[],
    startDate: "",
    availableSeats: "",
    totalSeats: "",
    intakeMonths: [] as string[],
    isHandsOn: false,
  });
  
  const [newRequirement, setNewRequirement] = useState("");
  const [newIntakeMonth, setNewIntakeMonth] = useState("");

  // Check admin access
  if (!isAuthenticated || !(user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const { data: specialties } = useQuery({
    queryKey: ['/api/specialties'],
  });

  const createProgramMutation = useMutation({
    mutationFn: async (programData: any) => {
      return await apiRequest("POST", "/api/programs", programData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Program created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      setLocation("/admin");
    },
    onError: (error) => {
      console.error("Program creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create program: ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }));
  };

  const addIntakeMonth = () => {
    if (newIntakeMonth.trim() && !formData.intakeMonths.includes(newIntakeMonth.trim())) {
      setFormData(prev => ({
        ...prev,
        intakeMonths: [...prev.intakeMonths, newIntakeMonth.trim()]
      }));
      setNewIntakeMonth("");
    }
  };

  const removeIntakeMonth = (month: string) => {
    setFormData(prev => ({
      ...prev,
      intakeMonths: prev.intakeMonths.filter(m => m !== month)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.hospitalName || !formData.location || !formData.specialtyId || !formData.mentorName || !formData.country || !formData.city || !formData.type || !formData.duration || !formData.availableSeats || !formData.totalSeats || !formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, hospital, mentor, location, country, city, type, duration, seats, start date).",
        variant: "destructive",
      });
      return;
    }

    const programData = {
      title: formData.title,
      type: formData.type as 'observership' | 'hands_on' | 'fellowship' | 'clerkship',
      specialtyId: formData.specialtyId,
      hospitalName: formData.hospitalName,
      mentorName: formData.mentorName,
      mentorTitle: formData.mentorTitle || null,
      location: formData.location,
      country: formData.country,
      city: formData.city,
      startDate: new Date(formData.startDate),
      duration: parseInt(formData.duration),
      intakeMonths: formData.intakeMonths,
      availableSeats: parseInt(formData.availableSeats),
      totalSeats: parseInt(formData.totalSeats),
      fee: formData.fee ? parseFloat(formData.fee) : null,
      currency: 'USD',
      isHandsOn: formData.type === 'hands_on',
      description: formData.description || '',
      requirements: formData.requirements,
      isActive: true,
      isFeatured: false,
    };

    console.log("Creating program with data:", programData);
    createProgramMutation.mutate(programData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/admin")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Program</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Program Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Cardiology Observership"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hospitalName">Hospital/Institution *</Label>
                  <Input
                    id="hospitalName"
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                    placeholder="e.g., Johns Hopkins Hospital"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mentorName">Mentor Name *</Label>
                  <Input
                    id="mentorName"
                    value={formData.mentorName}
                    onChange={(e) => handleInputChange("mentorName", e.target.value)}
                    placeholder="e.g., Dr. John Smith"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mentorTitle">Mentor Title</Label>
                  <Input
                    id="mentorTitle"
                    value={formData.mentorTitle}
                    onChange={(e) => handleInputChange("mentorTitle", e.target.value)}
                    placeholder="e.g., Chief of Cardiology"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Baltimore, MD, USA"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="e.g., USA"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g., Baltimore"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialtyId">Specialty *</Label>
                  <Select onValueChange={(value) => handleInputChange("specialtyId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {(specialties as any)?.map((specialty: any) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (weeks) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g., 4"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Program Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observership">Observership</SelectItem>
                      <SelectItem value="clerkship">Clerkship</SelectItem>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                      <SelectItem value="hands_on">Hands-on Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fee">Fee ($)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.fee}
                    onChange={(e) => handleInputChange("fee", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="availableSeats">Available Seats *</Label>
                  <Input
                    id="availableSeats"
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) => handleInputChange("availableSeats", e.target.value)}
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="totalSeats">Total Seats *</Label>
                  <Input
                    id="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => handleInputChange("totalSeats", e.target.value)}
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the program, what participants will learn..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Requirements</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((requirement, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {requirement}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeRequirement(requirement)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Intake Months</Label>
                <div className="flex gap-2 mb-2">
                  <Select onValueChange={(value) => setNewIntakeMonth(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addIntakeMonth}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.intakeMonths.map((month, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {month}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeIntakeMonth(month)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/admin")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProgramMutation.isPending}
                >
                  {createProgramMutation.isPending ? "Creating..." : "Create Program"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}