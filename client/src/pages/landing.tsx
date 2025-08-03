import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Calendar, Users, Search, Filter, Stethoscope, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Landing() {
  const [searchFilters, setSearchFilters] = useState({
    specialty: "",
    location: "",
    duration: "",
  });

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const samplePrograms = [
    {
      id: "1",
      title: "Cardiology Rotation - Johns Hopkins Hospital",
      type: "Observership",
      status: "Available",
      location: "Baltimore, USA",
      duration: "4 weeks",
      startDate: "March 2024",
      availableSeats: "3 of 5 seats",
      fee: "$2,500",
      mentorName: "Dr. Michael Chen",
      mentorTitle: "Attending Cardiologist",
      hospitalImage: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      description: "Comprehensive cardiovascular medicine training with world-renowned cardiologists in Baltimore, Maryland.",
    },
    {
      id: "2",
      title: "Emergency Medicine - Mayo Clinic",
      type: "Hands-on",
      status: "2 seats left",
      location: "Rochester, USA",
      duration: "6 weeks",
      startDate: "April 2024",
      availableSeats: "2 of 4 seats",
      fee: "$3,800",
      mentorName: "Dr. Emily Rodriguez",
      mentorTitle: "Emergency Medicine Physician",
      hospitalImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      description: "Fast-paced emergency department experience with hands-on patient care opportunities.",
    },
    {
      id: "3",
      title: "Pediatric Surgery - Children's Hospital of Philadelphia",
      type: "Fellowship",
      status: "Free",
      location: "Philadelphia, USA",
      duration: "8 weeks",
      startDate: "May 2024",
      availableSeats: "1 of 2 seats",
      fee: "FREE",
      mentorName: "Dr. Jennifer Park",
      mentorTitle: "Pediatric Surgeon",
      hospitalImage: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      description: "Advanced pediatric surgical techniques and comprehensive child healthcare training program.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Stethoscope className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold text-gray-900">MEDILY</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800" 
            alt="Modern medical facility" 
            className="w-full h-full object-cover" 
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
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="emergency">Emergency Medicine</SelectItem>
                        <SelectItem value="internal">Internal Medicine</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      placeholder="City or Country"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
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
                        <SelectItem value="1-2m">1-2 months</SelectItem>
                        <SelectItem value="3+">3+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-primary text-white hover:bg-primary/90">
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

      {/* Filters & Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Filter className="mr-2 h-5 w-5 inline text-primary" />
                  Filters
                </h3>
                
                {/* Program Type */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Program Type</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Observership</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-700">Hands-on Training</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-700">Fellowship</span>
                    </label>
                  </div>
                </div>

                {/* Cost */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Cost</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-700">Free</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-700">Under $1,000</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-700">$1,000 - $5,000</span>
                    </label>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Start Date</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Time</SelectItem>
                      <SelectItem value="jan">January 2024</SelectItem>
                      <SelectItem value="feb">February 2024</SelectItem>
                      <SelectItem value="mar">March 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Rotations</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Showing 24 of 156 programs</span>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Most Relevant" />
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

            {/* Program Cards */}
            <div className="grid gap-6">
              {samplePrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            variant={program.type === 'Hands-on' ? 'default' : 'secondary'}
                            className={program.type === 'Hands-on' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          >
                            {program.type}
                          </Badge>
                          <Badge 
                            variant={program.status === 'Available' ? 'default' : program.status === 'Free' ? 'default' : 'secondary'}
                            className={
                              program.status === 'Available' ? 'bg-green-100 text-green-800' :
                              program.status === 'Free' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {program.status}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
                        <p className="text-gray-600 mb-3">{program.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="mr-2 h-4 w-4 text-primary" />
                            {program.location}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            {program.duration}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            {program.startDate}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            {program.availableSeats}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={program.hospitalImage} 
                          alt="Hospital" 
                          className="w-12 h-12 rounded-lg object-cover" 
                        />
                        <div>
                          <p className="font-medium text-gray-900">{program.mentorName}</p>
                          <p className="text-sm text-gray-500">{program.mentorTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${program.fee === 'FREE' ? 'text-green-600' : 'text-gray-900'}`}>
                          {program.fee}
                        </p>
                        <Button 
                          className="mt-2 bg-primary hover:bg-primary/90"
                          onClick={handleLogin}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="px-8">
                Load More Programs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Stethoscope className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">MEDILY</span>
              </div>
              <p className="text-gray-400 mb-4">Empowering Global Medical Careers</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Medical Professionals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Browse Rotations</a></li>
                <li><a href="#" className="hover:text-white">Application Process</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Institutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">List Your Program</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Resources</a></li>
                <li><a href="#" className="hover:text-white">Contact Sales</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MEDILY. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
