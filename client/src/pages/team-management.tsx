import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TeamMember, InsertTeamMember } from "@shared/schema";

interface TeamMemberFormData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  email: string;
  linkedinUrl: string;
  sortOrder: number;
}

const initialFormData: TeamMemberFormData = {
  name: "",
  title: "",
  bio: "",
  profileImage: "",
  email: "",
  linkedinUrl: "",
  sortOrder: 0,
};

export default function TeamManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberFormData>(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Create team member mutation
  const createMemberMutation = useMutation({
    mutationFn: (data: InsertTeamMember) => apiRequest(`/api/team-members`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingMember(null);
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    },
  });

  // Update team member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamMember> }) => 
      apiRequest(`/api/team-members/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingMember(null);
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
    },
  });

  // Delete team member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/team-members/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.title) {
      toast({
        title: "Error",
        description: "Name and title are required fields",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting form data:", formData);
    console.log("Editing member:", editingMember);

    if (editingMember) {
      console.log("Updating member with ID:", editingMember.id);
      updateMemberMutation.mutate({
        id: editingMember.id,
        data: formData,
      });
    } else {
      console.log("Creating new member");
      createMemberMutation.mutate(formData);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      bio: member.bio || "",
      profileImage: member.profileImage || "",
      email: member.email || "",
      linkedinUrl: member.linkedinUrl || "",
      sortOrder: member.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      deleteMemberMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingMember(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="outline" onClick={() => window.location.href = '/cms-dashboard'} className="flex items-center gap-2">
              ← Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Team Member Management</h1>
          <p className="text-gray-600 mt-2">Manage your team members for the About page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Job title"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief biography"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image URL</Label>
                  <Input
                    id="profileImage"
                    value={formData.profileImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMemberMutation.isPending || updateMemberMutation.isPending}
                >
                  {createMemberMutation.isPending || updateMemberMutation.isPending 
                    ? "Saving..." 
                    : editingMember ? "Update" : "Add"
                  } Team Member
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!teamMembers || teamMembers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No team members yet</h3>
          <p className="text-gray-600 mb-4">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <Badge variant="secondary" className="text-sm">
                          {member.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(member.id)}
                      disabled={deleteMemberMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {member.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{member.bio}</p>
                )}
                <div className="space-y-1 text-xs text-gray-500">
                  {member.email && <div>📧 {member.email}</div>}
                  {member.linkedinUrl && (
                    <div>
                      🔗 <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  <div className="text-gray-400">Sort: {member.sortOrder}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}