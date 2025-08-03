import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Calendar, Users, Building, User } from "lucide-react";

interface ProgramCardProps {
  program: {
    id: string;
    title: string;
    type: string;
    hospitalName: string;
    mentorName: string;
    mentorTitle?: string;
    location: string;
    duration: number;
    startDate: string;
    availableSeats: number;
    totalSeats: number;
    fee?: string;
    isHandsOn: boolean;
    description: string;
    isActive: boolean;
  };
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { programId: program.id });
    },
    onSuccess: () => {
      setIsFavorited(true);
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
      await apiRequest("DELETE", `/api/favorites/${program.id}`);
    },
    onSuccess: () => {
      setIsFavorited(false);
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

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    // Navigate to program detail page for application
    window.location.href = `/program/${program.id}`;
  };

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
    if (availableSeats === 0) return 'bg-red-100 text-red-800';
    const ratio = availableSeats / totalSeats;
    if (ratio > 0.5) return 'bg-green-100 text-green-800';
    if (ratio > 0.2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (availableSeats: number, totalSeats: number) => {
    if (availableSeats === 0) return 'Full';
    if (availableSeats <= 2) return `${availableSeats} seats left`;
    return 'Available';
  };

  const formatFee = (fee?: string) => {
    if (!fee || fee === '0' || fee === '0.00') return 'FREE';
    return `$${parseFloat(fee).toLocaleString()}`;
  };

  const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Link href={`/program/${program.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getTypeColor(program.type)}>
                  {formatType(program.type)}
                </Badge>
                <Badge className={getStatusColor(program.availableSeats, program.totalSeats)}>
                  {getStatusText(program.availableSeats, program.totalSeats)}
                </Badge>
                {(!program.fee || program.fee === '0') && (
                  <Badge className="bg-green-100 text-green-800">Free</Badge>
                )}
                {program.isHandsOn && (
                  <Badge className="bg-blue-100 text-blue-800">Hands-on</Badge>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{program.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  {program.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  {program.duration} weeks
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  {new Date(program.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  {program.availableSeats} of {program.totalSeats} seats
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorited ? 'fill-current text-red-500' : 'text-gray-400'}`} 
              />
            </Button>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{program.mentorName}</p>
                <p className="text-sm text-gray-500">
                  {program.mentorTitle || 'Medical Professional'}
                </p>
                <p className="text-sm text-gray-500">{program.hospitalName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                (!program.fee || program.fee === '0') ? 'text-green-600' : 'text-gray-900'
              }`}>
                {formatFee(program.fee)}
              </p>
              <Button 
                className="mt-2 bg-primary hover:bg-primary/90"
                onClick={handleApply}
                disabled={program.availableSeats === 0}
              >
                {program.availableSeats === 0 ? 'Full' : 'Apply Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
