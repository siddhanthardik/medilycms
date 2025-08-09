import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import { 
  Users, 
  Target, 
  Award, 
  Heart,
  Globe,
  BookOpen,
  Shield,
  Zap,
  CheckCircle,
  DollarSign,
  Clock,
  Stethoscope
} from "lucide-react";

export default function About() {
  // Fetch team members from API
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const features = [
    {
      icon: BookOpen,
      title: "Simple and clear content",
      description: "No heavy textbooks or confusing language. We keep it real, practical, and easy to follow."
    },
    {
      icon: Users,
      title: "Made by medical experts",
      description: "Our content is created by experienced doctors, nurses, and trainers who know what really works."
    },
    {
      icon: Target,
      title: "Focus on real skills",
      description: "We teach what actually helps you at work – from clinical knowledge to practical skills."
    },
    {
      icon: DollarSign,
      title: "Affordable and accessible",
      description: "Quality learning shouldn't be expensive. We keep our pricing simple and fair for everyone."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="from-primary via-blue-600 to-blue-700 py-20 text-[#000000] bg-[#ffffff00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Stethoscope className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Skill With Medily
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-blue-100">
              At Medily, we help healthcare professionals learn and grow in their careers. We offer simple, 
              practical courses that help doctors, nurses, and other healthcare professionals improve their 
              skills and stay updated with what's new in healthcare.
            </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              Transforming Healthcare Education
            </Badge>
          </div>
        </div>
      </section>
      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <div className="prose prose-lg mx-auto text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                Healthcare is changing all the time, and we know how important it is to keep learning. 
                That's why we've created an easy-to-use platform where learning fits into your busy schedule. 
                Some of the programs are designed to take anytime from anywhere and learn at your own pace. 
                But more focus is given on enhancing hands-on skills.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Our team includes experienced medical professionals who design courses that are useful, clear, 
                and based on real-world practice. We keep things simple so that anyone can learn without feeling 
                overwhelmed. We started Medily because we saw a need for quality training that's affordable and 
                easy to access.
              </p>
              <p className="text-lg leading-relaxed">
                We want to support healthcare professionals who are passionate about doing their best for their patients.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="mr-3 h-6 w-6 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our vision is to make healthcare learning simple, practical, and available to every healthcare 
                  professional. We want to create a space where doctors, nurses, and other medical staff can 
                  easily build their skills, no matter where they are. We believe that better learning leads to 
                  better care, and our goal is to support the people who care for others by helping them grow 
                  in their careers.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Award className="mr-3 h-6 w-6 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our mission is to provide useful, easy-to-understand training for healthcare professionals 
                  that fits into their busy lives. We aim to offer flexible learning options that are based 
                  on real medical practice, created by experts, and focused on helping people do their jobs better.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Why Choose Medily */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Skill With Medily</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 mx-auto">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Meet Our Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet Our Team</h2>
          {isLoadingTeam ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers?.map((member) => (
                <Card key={member.id} className="text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      <img
                        src={member.profileImage || "/api/placeholder/400/400"}
                        alt={member.name}
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-blue-100"
                        onError={(e) => {
                          console.log('Image failed to load:', member.profileImage);
                          e.currentTarget.src = "/api/placeholder/400/400";
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', member.profileImage);
                        }}
                      />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{member.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">{member.title}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{member.bio}</p>
                    {member.linkedinUrl && (
                      <div className="mt-4">
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Connect on LinkedIn →
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Healthcare Skills?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of healthcare professionals who are advancing their careers with practical, 
            expert-designed training that fits into their busy lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              size="lg"
            >
              Get Started Today
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/contact"}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              size="lg"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}