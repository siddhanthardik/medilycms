import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import SearchFilters from "@/components/search-filters";
import ProgramCard from "@/components/program-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    type: "",
    minDuration: undefined as number | undefined,
    maxDuration: undefined as number | undefined,
    isFree: undefined as boolean | undefined,
    search: "",
  });

  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);

  // Reset page and programs when filters change
  useEffect(() => {
    setPage(1);
    setAllPrograms([]);
  }, [filters, sortBy]);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['/api/programs', filters, page],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });
      searchParams.append('page', page.toString());
      searchParams.append('limit', '10');
      const response = await fetch(`/api/programs?${searchParams}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      const data = await response.json();
      
      if (page === 1) {
        setAllPrograms(data.programs || []);
      } else {
        setAllPrograms(prev => [...prev, ...(data.programs || [])]);
      }
      
      return data;
    },
    enabled: true,
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['/api/specialties'],
    staleTime: 10 * 60 * 1000, // 10 minutes - specialties don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  const handleSearch = (searchFilters: any) => {
    setFilters({ ...filters, ...searchFilters });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection onSearch={handleSearch} specialties={specialties as any[]} />
      
      {/* Medical Department Programs Carousel - Visible on all pages, responsive design */}
      <div className="py-8 md:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Medical Department Programs
            </h2>
            <p className="mt-2 md:mt-4 text-lg md:text-xl text-gray-600">
              Specialized training programs across various medical departments
            </p>
          </div>

          {/* Continuous Scrolling Carousel */}
          <div className="relative">
            <div className="carousel-container">
              <div className="carousel-track">
                {/* First set of programs */}
                <div className="carousel-item">
                  <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Emergency Medicine"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                      <h3 className="text-lg md:text-xl font-bold">Emergency Medicine Training</h3>
                      <p className="text-xs md:text-sm opacity-90">Critical care and emergency procedures</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="IVF Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">IVF Training</h3>
                      <p className="text-sm opacity-90">Reproductive medicine and fertility treatments</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Ultrasound Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Ultrasound Training</h3>
                      <p className="text-sm opacity-90">Diagnostic imaging and sonography</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Radiology Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Radiology Training</h3>
                      <p className="text-sm opacity-90">Medical imaging and diagnostic radiology</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Surgery Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Surgery Training</h3>
                      <p className="text-sm opacity-90">Surgical techniques and procedures</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1582560475093-ba0103b2ec64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Cardiology Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Cardiology Training</h3>
                      <p className="text-sm opacity-90">Heart and cardiovascular medicine</p>
                    </div>
                  </div>
                </div>

                {/* Duplicate set for seamless loop */}
                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Emergency Medicine"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Emergency Medicine Training</h3>
                      <p className="text-sm opacity-90">Critical care and emergency procedures</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="IVF Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">IVF Training</h3>
                      <p className="text-sm opacity-90">Reproductive medicine and fertility treatments</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Ultrasound Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Ultrasound Training</h3>
                      <p className="text-sm opacity-90">Diagnostic imaging and sonography</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Radiology Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Radiology Training</h3>
                      <p className="text-sm opacity-90">Medical imaging and diagnostic radiology</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Surgery Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Surgery Training</h3>
                      <p className="text-sm opacity-90">Surgical techniques and procedures</p>
                    </div>
                  </div>
                </div>

                <div className="carousel-item">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1582560475093-ba0103b2ec64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Cardiology Training"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">Cardiology Training</h3>
                      <p className="text-sm opacity-90">Heart and cardiovascular medicine</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View All Programs
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <SearchFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              specialties={specialties as any[]}
            />
          </div>

          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Rotations</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Showing {programs.length || 0} programs
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="duration">Duration: Short to Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {[...Array(4)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-16 mb-2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allPrograms && allPrograms.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {allPrograms.map((program: any) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
                
                {programs?.hasMore !== false && (
                  <div className="text-center mt-8">
                    <Button 
                      variant="outline" 
                      className="px-8"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Load More Programs"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find more results.
                  </p>
                  <Button onClick={() => setFilters({
                    specialty: "",
                    location: "",
                    type: "",
                    minDuration: undefined,
                    maxDuration: undefined,
                    isFree: undefined,
                    search: "",
                  })}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
