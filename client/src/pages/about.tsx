import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Medily</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're dedicated to advancing medical education and connecting healthcare 
            professionals with world-class clinical opportunities worldwide.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-4">
              To bridge the gap between medical education and practical experience by 
              providing accessible, high-quality clinical rotation opportunities for 
              healthcare professionals at all stages of their careers.
            </p>
            <p className="text-lg text-gray-600">
              We believe that every healthcare professional deserves access to 
              world-class training and mentorship, regardless of their location or background.
            </p>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Medical team collaboration" 
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Compassionate Care",
                description: "Putting patient care and safety at the center of everything we do"
              },
              {
                icon: Users,
                title: "Collaboration",
                description: "Building strong partnerships between institutions and professionals"
              },
              {
                icon: Target,
                title: "Excellence",
                description: "Maintaining the highest standards in medical education and training"
              },
              {
                icon: Award,
                title: "Innovation",
                description: "Continuously improving healthcare education through technology"
              }
            ].map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our diverse team of medical professionals, educators, and technology experts 
            work together to create the best possible experience for our users.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Join Our Team
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}