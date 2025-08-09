import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Search, Calendar, User, Clock, ChevronRight, Tag } from "lucide-react";
import { Link } from "wouter";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch published blog posts
  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/blog-posts', selectedCategory],
  });

  // Fetch blog categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/cms/blog-categories'],
  });

  // Filter posts based on search
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateReadTime = (content: string) => {
    if (!content) return "5 min read";
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Featured post (most recent published post)
  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 from-teal-600 to-teal-700 bg-[#0079f2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Medily Blog</h1>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                Insights, tips, and guidance for your medical career journey
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <section className="py-8 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Medical Education">Medical Education</SelectItem>
                  <SelectItem value="Career Advice">Career Advice</SelectItem>
                  <SelectItem value="Clinical Skills">Clinical Skills</SelectItem>
                  <SelectItem value="Student Life">Student Life</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="mt-4 text-gray-600">Loading blog posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No blog posts found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery 
                      ? "Try adjusting your search terms or filters"
                      : "Check back soon for new content"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Featured Post */}
                {featuredPost && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Featured Post
                    </h2>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featuredPost.featuredImage && (
                          <div className="h-64 md:h-full">
                            <img 
                              src={featuredPost.featuredImage} 
                              alt={featuredPost.featuredImageAlt || featuredPost.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={featuredPost.featuredImage ? "" : "md:col-span-2"}>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{featuredPost.category}</Badge>
                              {featuredPost.tags?.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            <CardTitle className="text-2xl">{featuredPost.title}</CardTitle>
                            <CardDescription className="text-base mt-2">
                              {featuredPost.excerpt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {featuredPost.author || "MEDILY Team"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {featuredPost.readTime || calculateReadTime(featuredPost.content)}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/blog/${featuredPost.slug}`}>
                              <Button className="group">
                                Read More
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </CardFooter>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Regular Posts Grid */}
                {regularPosts.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Recent Posts
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularPosts.map((post) => (
                        <Card key={post.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                          {post.featuredImage && (
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={post.featuredImage} 
                                alt={post.featuredImageAlt || post.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">
                              {post.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3 mt-2">
                              {post.excerpt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.author || "MEDILY Team"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.publishedAt || post.createdAt)}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/blog/${post.slug}`} className="w-full">
                              <Button variant="outline" className="w-full group">
                                Read Article
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Section */}
                <div className="mt-12 pt-12 border-t">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Browse by Category
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {["Medical Education", "Career Advice", "Clinical Skills", "Student Life", "Research", "Technology"].map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category)}
                        className="flex items-center gap-2"
                      >
                        <Tag className="h-4 w-4" />
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}