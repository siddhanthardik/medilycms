import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Globe, Award, TrendingUp } from "lucide-react";

export default function Join() {
  const benefits = [
    "Access to 500+ clinical rotation programs worldwide",
    "Direct connection with top-tier medical institutions",
    "Expert mentorship and guidance",
    "Comprehensive application support",
    "Networking opportunities with global healthcare professionals",
    "Career advancement resources and tools",
    "24/7 customer support",
    "Regular updates on new opportunities"
  ];

  const membershipTiers = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for exploring opportunities",
      features: [
        "Browse all programs",
        "Basic search filters",
        "Program details access",
        "Community forum access"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$49/month",
      description: "For serious medical professionals",
      features: [
        "All Basic features",
        "Apply to unlimited programs",
        "Priority application review",
        "Advanced search filters",
        "Direct messaging with coordinators",
        "Application tracking dashboard",
        "Resume/CV review service"
      ],
      popular: true
    },
    {
      name: "Premium",
      price: "$99/month",
      description: "Complete career advancement package",
      features: [
        "All Professional features",
        "Personal career advisor",
        "Interview preparation sessions",
        "Letters of recommendation assistance",
        "Exclusive networking events",
        "Early access to new programs",
        "Custom program matching"
      ],
      popular: false
    }
  ];

  const stats = [
    { icon: Users, number: "10,000+", label: "Active Members" },
    { icon: Globe, number: "50+", label: "Countries" },
    { icon: Award, number: "500+", label: "Partner Institutions" },
    { icon: TrendingUp, number: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Join the Medily Community</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with a global network of healthcare professionals and unlock 
            opportunities that will advance your medical career.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Join Medily?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Choose Your Membership
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{tier.price}</div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.price === 'Free' ? 'Get Started' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What Our Members Say
            </h2>
            <blockquote className="text-xl text-gray-700 mb-6 max-w-4xl mx-auto">
              "Medily transformed my career. Through their platform, I secured a rotation 
              at Johns Hopkins and eventually matched into my dream residency program. 
              The support and opportunities are unmatched."
            </blockquote>
            <div className="text-gray-600">
              <strong>Dr. Priya Patel</strong> - Internal Medicine Resident
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Advance Your Medical Career?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have transformed their 
            careers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Start Free Trial
            </Button>
            <Button variant="outline" className="text-lg px-8 py-3">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}