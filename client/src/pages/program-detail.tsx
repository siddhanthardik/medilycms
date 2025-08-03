import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  DollarSign,
  Heart,
  Share,
  Send,
  Building,
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ProgramDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: program, isLoading } = useQuery({
    queryKey: ['/api/programs', id],
    enabled: !!id,
  });

  const { data: isFavorite } = useQuery({
    queryKey: ['/api/favorites', id, 'check'],
    enabled: !!id && isAuthenticated,
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { programId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Program added to favorites!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Program removed from favorites!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/applications", { 
        programId: id,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (isFavorite?.isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    applyMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: program?.title,
        text: program?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Program link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Program not found</h3>
              <p className="text-gray-600 mb-4">The program you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hands_on':
        return 'bg-green-100 text-green-800';
      case 'observership':
        return 'bg-blue-100 text-blue-800';
      case 'fellowship':
        return 'bg-purple-100 text-purple-800';
      case 'clerkship':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (availableSeats: number, totalSeats: number) => {
    const ratio = availableSeats / totalSeats;
    if (ratio > 0.5) return 'bg-green-100 text-green-800';
    if (ratio > 0.2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Image */}
        <div className="relative mb-6">
          <img 
            src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300" 
            alt="Clinical training environment" 
            className="w-full h-64 object-cover rounded-xl" 
          />
        </div>

        {/* Program Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getTypeColor(program.type)}>
                {program.type.replace('_', ' ')}
              </Badge>
              <Badge className={getStatusColor(program.availableSeats, program.totalSeats)}>
                {program.availableSeats > 0 ? `${program.availableSeats} seats left` : 'Full'}
              </Badge>
              {!program.fee || program.fee === '0' ? (
                <Badge className="bg-green-100 text-green-800">Free</Badge>
              ) : null}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
            <p className="text-xl text-gray-600">{program.hospitalName}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              {program.fee && program.fee !== '0' ? `$${program.fee}` : 'FREE'}
            </p>
            <p className="text-sm text-gray-500">{program.duration} weeks program</p>
          </div>
        </div>

        {/* Program Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Program Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Duration:
                  </span>
                  <span className="text-gray-900">{program.duration} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Start Date:
                  </span>
                  <span className="text-gray-900">
                    {new Date(program.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Available Seats:
                  </span>
                  <span className="text-gray-900">{program.availableSeats} of {program.totalSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900 capitalize">
                    {program.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hands-on:</span>
                  <span className="text-gray-900">
                    {program.isHandsOn ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Location & Mentor</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Location:
                  </span>
                  <span className="text-gray-900">{program.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Hospital:
                  </span>
                  <span className="text-gray-900">{program.hospitalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Mentor:
                  </span>
                  <span className="text-gray-900">{program.mentorName}</span>
                </div>
                {program.mentorTitle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="text-gray-900">{program.mentorTitle}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Fee:
                  </span>
                  <span className="text-gray-900">
                    {program.fee && program.fee !== '0' ? `$${program.fee}` : 'Free'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {program.description}
            </p>
          </CardContent>
        </Card>

        {/* Requirements */}
        {program.requirements && program.requirements.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {program.requirements.map((requirement: string, index: number) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90" 
            onClick={handleApply}
            disabled={applyMutation.isPending || program.availableSeats === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            {program.availableSeats === 0 ? 'Program Full' : 'Apply Now'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFavoriteToggle}
            disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
          >
            <Heart 
              className={`mr-2 h-4 w-4 ${isFavorite?.isFavorite ? 'fill-current text-red-500' : ''}`} 
            />
            {isFavorite?.isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
