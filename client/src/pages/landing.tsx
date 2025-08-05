import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Calendar, Users, Search, Play, CheckCircle, BookOpen, Award, TrendingUp, Globe, Star } from "lucide-react";
import { Footer } from "@/components/footer";
import medilyLogoSrc from "@assets/medily-website-logo_1754424305557.jpg";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: BookOpen,
      title: "Expert Courses",
      description: "Comprehensive medical courses designed by industry experts"
    },
    {
      icon: Users,
      title: "Clinical Rotations", 
      description: "Hands-on clinical experience at top healthcare facilities"
    },
    {
      icon: TrendingUp,
      title: "Career Opportunities",
      description: "Access to exclusive job opportunities in healthcare"
    },
    {
      icon: Award,
      title: "Certification",
      description: "Internationally recognized certificates and credentials"
    }
  ];

  const popularCourses = [
    {
      id: "1",
      title: "Internal Medicine",
      description: "Comprehensive internal medicine course covering diagnosis and treatment",
      price: "$299",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "2", 
      title: "Surgery Fundamentals",
      description: "Essential surgical techniques and medical procedures",
      price: "$399",
      image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "3",
      title: "Pediatrics",
      description: "Specialized course in pediatric medicine and child healthcare",
      price: "$349", 
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Courses Enrolled" },
    { number: "500+", label: "Expert Instructors" },
    { number: "200+", label: "Partner Hospitals" },
    { number: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src={medilyLogoSrc} 
                  alt="Medily" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
                <a href="/about" className="text-gray-500 hover:text-gray-900">About us</a>
                <a href="/courses" className="text-gray-500 hover:text-gray-900">Courses</a>
                <a href="/clinical-rotations" className="text-gray-500 hover:text-gray-900">Clinical Rotations</a>
                <a href="/join" className="text-gray-500 hover:text-gray-900">Jobs</a>
                <a href="/blog" className="text-gray-500 hover:text-gray-900">Blog</a>
                <a href="/contact" className="text-gray-500 hover:text-gray-900">Contact us</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Advance Your <br />
                <span className="text-blue-600">Medical Career</span><br />
                with Expert Training
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                Join thousands of healthcare professionals who have
                advanced their skills through our comprehensive courses
                and clinical rotations.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  Explore Courses
                </Button>
                <Button 
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Medical professionals in training" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Medily Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Medily?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive medical education and career development 
              opportunities for healthcare professionals worldwide.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Courses Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Popular Courses
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Enhance your medical knowledge with our top-rated courses
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                    <Button className="bg-blue-600 hover:bg-blue-700">Enroll Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View All Courses
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-white">{stat.number}</div>
                <div className="text-blue-200 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to Advance Your Medical Career?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of healthcare professionals who have transformed their careers with 
            Medily
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
