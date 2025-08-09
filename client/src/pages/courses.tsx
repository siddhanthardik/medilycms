import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, BookOpen } from "lucide-react";

export default function Courses() {
  const courses = [
    {
      id: "1",
      title: "Internal Medicine Fundamentals",
      description: "Comprehensive course covering internal medicine principles, diagnosis, and treatment protocols",
      duration: "8 weeks",
      students: 1234,
      rating: 4.8,
      price: "$299",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "2",
      title: "Surgery Fundamentals",
      description: "Essential surgical techniques and procedures for medical professionals",
      duration: "12 weeks",
      students: 856,
      rating: 4.9,
      price: "$399",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "3",
      title: "Pediatric Medicine",
      description: "Specialized training in pediatric care and child healthcare management",
      duration: "10 weeks",
      students: 672,
      rating: 4.7,
      price: "$349",
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "4",
      title: "Emergency Medicine",
      description: "Critical care protocols and emergency response procedures",
      duration: "6 weeks",
      students: 945,
      rating: 4.8,
      price: "$279",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "5",
      title: "Cardiology Essentials",
      description: "Cardiovascular medicine fundamentals and diagnostic techniques",
      duration: "9 weeks",
      students: 723,
      rating: 4.9,
      price: "$359",
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "6",
      title: "Medical Ethics & Law",
      description: "Understanding medical ethics, legal requirements, and professional responsibilities",
      duration: "4 weeks",
      students: 1156,
      rating: 4.6,
      price: "$199",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Medical Courses</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advance your medical knowledge with our comprehensive courses designed by 
            industry experts and leading medical professionals.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{course.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()} students
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-blue-50 rounded-lg p-12">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of medical professionals who have advanced their careers 
            through our comprehensive online courses.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
            Browse All Courses
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}