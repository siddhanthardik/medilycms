import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface HeroSectionProps {
  onSearch: (filters: {
    specialty: string;
    location: string;
    duration: string;
    search?: string;
  }) => void;
  specialties: Array<{ id: string; name: string }>;
}

export default function HeroSection({ onSearch, specialties }: HeroSectionProps) {
  const [searchFilters, setSearchFilters] = useState({
    specialty: "",
    location: "",
    duration: "",
    search: "",
  });

  // Fetch hero content from CMS
  const { data: heroContent } = useQuery({
    queryKey: ['/api/cms/pages/home-page-id/sections'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get hero background image from CMS or use default
  const heroSection = heroContent?.sections?.find((section: any) => 
    section.sectionName === 'hero' && section.contentType === 'image'
  );
  const heroImageUrl = heroSection?.imageUrl || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800";

  const handleSearch = () => {
    onSearch(searchFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img 
          src={heroImageUrl} 
          alt="Modern medical facility" 
          className="w-full h-full object-cover" 
          onError={(e) => {
            // Fallback to default image if CMS image fails to load
            e.currentTarget.src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800";
          }}
        />
        <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find Your Perfect<br />
          <span className="text-blue-200">Medical Rotation</span>
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-blue-100">
          Connect with world-class medical institutions and mentors. Discover clinical opportunities that advance your career in medicine.
        </p>
        
        {/* Search Bar */}
        <div className="mt-10 max-w-4xl">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <Select
                    value={searchFilters.specialty}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, specialty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    placeholder="City or Country"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <Select
                    value={searchFilters.duration}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Duration</SelectItem>
                      <SelectItem value="1-2">1-2 weeks</SelectItem>
                      <SelectItem value="3-4">3-4 weeks</SelectItem>
                      <SelectItem value="5-8">5-8 weeks</SelectItem>
                      <SelectItem value="9-12">9-12 weeks</SelectItem>
                      <SelectItem value="13+">13+ weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
