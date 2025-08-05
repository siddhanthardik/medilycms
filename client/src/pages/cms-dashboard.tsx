import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  FileText, 
  BookOpen, 
  Image, 
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  Eye,
  Upload,
  User
} from "lucide-react";

// Schema for forms
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  featuredImage: z.string().optional(),
  readTime: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  price: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  duration: z.string().optional(),
  featuredImage: z.string().optional(),
  instructor: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export default function CMSDashboard() {
  const { adminUser, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Form setup
  const blogForm = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      status: "draft",
    },
  });

  const courseForm = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      status: "draft",
      difficulty: "beginner",
    },
  });

  // Data queries
  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<any[]>({
    queryKey: ['/api/cms/blog-posts'],
    retry: false,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ['/api/cms/courses'],
    retry: false,
  });

  const { data: contentPages = [], isLoading: pagesLoading } = useQuery<any[]>({
    queryKey: ['/api/cms/content-pages'],
    retry: false,
  });

  const { data: mediaAssets = [], isLoading: mediaLoading } = useQuery<any[]>({
    queryKey: ['/api/cms/media-assets'],
    retry: false,
  });

  // Mutations
  const createBlogPost = useMutation({
    mutationFn: async (data: z.infer<typeof blogPostSchema>) => {
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      const payload = { ...data, tags: tagsArray };
      return apiRequest("POST", "/api/cms/blog-posts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/blog-posts'] });
      setBlogDialogOpen(false);
      blogForm.reset();
      toast({ title: "Success", description: "Blog post created successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/admin-login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create blog post", variant: "destructive" });
    },
  });

  const createCourse = useMutation({
    mutationFn: async (data: z.infer<typeof courseSchema>) => {
      return apiRequest("POST", "/api/cms/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/courses'] });
      setCourseDialogOpen(false);
      courseForm.reset();
      toast({ title: "Success", description: "Course created successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/admin-login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    },
  });

  const updateBlogPost = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof blogPostSchema> }) => {
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      const payload = { ...data, tags: tagsArray };
      return apiRequest("PUT", `/api/cms/blog-posts/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/blog-posts'] });
      setBlogDialogOpen(false);
      setSelectedBlogPost(null);
      blogForm.reset();
      toast({ title: "Success", description: "Blog post updated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/admin-login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update blog post", variant: "destructive" });
    },
  });

  const deleteBlogPost = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cms/blog-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/blog-posts'] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof courseSchema> }) => {
      return apiRequest("PUT", `/api/cms/courses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/courses'] });
      setCourseDialogOpen(false);
      setSelectedCourse(null);
      courseForm.reset();
      toast({ title: "Success", description: "Course updated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/admin-login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cms/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/courses'] });
      toast({ title: "Success", description: "Course deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
    },
  });

  // Helper functions
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleEditBlogPost = (post: any) => {
    setSelectedBlogPost(post);
    blogForm.reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      author: post.author,
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
      featuredImage: post.featuredImage || '',
      readTime: post.readTime || '',
      status: post.status,
    });
    setBlogDialogOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    courseForm.reset({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      fullDescription: course.fullDescription || '',
      price: course.price || '',
      category: course.category || '',
      difficulty: course.difficulty || 'beginner',
      duration: course.duration || '',
      featuredImage: course.featuredImage || '',
      instructor: course.instructor || '',
      status: course.status,
    });
    setCourseDialogOpen(true);
  };

  const handleNewBlogPost = () => {
    setSelectedBlogPost(null);
    blogForm.reset({
      status: "draft",
    });
    setBlogDialogOpen(true);
  };

  const handleNewCourse = () => {
    setSelectedCourse(null);
    courseForm.reset({
      status: "draft",
    });
    setCourseDialogOpen(true);
  };

  // Check if user is admin - AFTER all hooks are declared
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!isAuthenticated || !adminUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the CMS Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management System</h1>
            <p className="text-gray-600 mt-2">Manage your website content, courses, and media</p>
          </div>
          <Badge variant="secondary" className="px-4 py-2">
            <User className="h-4 w-4 mr-2" />
            {adminUser?.firstName} {adminUser?.lastName}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Blog Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{blogPosts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {blogPosts.filter((post: any) => post.status === 'published').length} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {courses.filter((course: any) => course.status === 'published').length} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content Pages</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentPages.length}</div>
                  <p className="text-xs text-muted-foreground">Site pages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mediaAssets.length}</div>
                  <p className="text-xs text-muted-foreground">Images & files</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Blog Posts</h2>
              <Button onClick={handleNewBlogPost}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
            
            <div className="grid gap-4">
              {blogPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600">{post.excerpt}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                          <span className="text-sm text-gray-500">by {post.author}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditBlogPost(post)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteBlogPost.mutate(post.id)}
                          disabled={deleteBlogPost.isPending}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Courses</h2>
              <Button onClick={handleNewCourse}>
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </div>
            
            <div className="grid gap-4">
              {courses.map((course: any) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                          {course.difficulty && (
                            <Badge variant="outline">{course.difficulty}</Badge>
                          )}
                          {course.price && (
                            <span className="text-sm font-medium">${course.price}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteCourse.mutate(course.id)}
                          disabled={deleteCourse.isPending}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Content Pages</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Content pages management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Media Assets</h2>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Media management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
