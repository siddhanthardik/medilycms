import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function Blog() {
  const blogPosts = [
    {
      id: "1",
      title: "The Future of Medical Education: Digital Transformation in Healthcare Training",
      excerpt: "Exploring how technology is revolutionizing medical education and clinical training programs worldwide.",
      author: "Dr. Sarah Johnson",
      date: "December 15, 2024",
      category: "Medical Education",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "2",
      title: "Top 10 Clinical Rotation Tips for International Medical Graduates",
      excerpt: "Essential advice for IMGs looking to maximize their clinical rotation experience in the United States.",
      author: "Dr. Michael Chen",
      date: "December 10, 2024",
      category: "Career Advice",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "3",
      title: "Understanding USMLE Step 2 CS: Preparation Strategies That Work",
      excerpt: "Comprehensive guide to preparing for the USMLE Step 2 Clinical Skills examination.",
      author: "Dr. Emily Rodriguez",
      date: "December 5, 2024",
      category: "Exam Prep",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "4",
      title: "Navigating Specialty Choice: A Guide for Medical Students",
      excerpt: "How to choose the right medical specialty based on your interests, skills, and career goals.",
      author: "Dr. James Wilson",
      date: "November 30, 2024",
      category: "Career Planning",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "5",
      title: "The Impact of Telemedicine on Clinical Training",
      excerpt: "How virtual consultations and remote patient care are changing medical education.",
      author: "Dr. Lisa Park",
      date: "November 25, 2024",
      category: "Technology",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: "6",
      title: "Building Professional Networks During Medical Rotations",
      excerpt: "Strategies for creating meaningful professional relationships during your clinical experience.",
      author: "Dr. Robert Kim",
      date: "November 20, 2024",
      category: "Networking",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    }
  ];

  const categories = ["All", "Medical Education", "Career Advice", "Exam Prep", "Career Planning", "Technology", "Networking"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Medical Education Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights, tips, and trends in medical education 
            and clinical training from our expert contributors.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className={category === "All" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="aspect-w-16 aspect-h-9 lg:aspect-none">
              <img 
                src={blogPosts[0].image} 
                alt={blogPosts[0].title}
                className="w-full h-64 lg:h-full object-cover"
              />
            </div>
            <CardContent className="p-8">
              <Badge className="mb-4">{blogPosts[0].category}</Badge>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{blogPosts[0].title}</h2>
              <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {blogPosts[0].author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {blogPosts[0].date}
                  </div>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <Button>
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardContent className="p-6">
                <Badge className="mb-3">{post.category}</Badge>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{post.excerpt}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                  <span>{post.readTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="text-center mt-16 bg-blue-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest medical education insights 
            delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}