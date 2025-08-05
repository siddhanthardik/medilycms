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

  // Check if user is admin
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
        setTimeout(() => window.location.href = "/api/login", 500);
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
        setTimeout(() => window.location.href = "/api/login", 500);
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
        setTimeout(() => window.location.href = "/api/login", 500);
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
        setTimeout(() => window.location.href = "/api/login", 500);
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
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
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

  const handleBlogSubmit = (data: z.infer<typeof blogPostSchema>) => {
    if (selectedBlogPost) {
      updateBlogPost.mutate({ id: selectedBlogPost.id, data });
    } else {
      createBlogPost.mutate(data);
    }
  };

  const handleCourseSubmit = (data: z.infer<typeof courseSchema>) => {
    if (selectedCourse) {
      updateCourse.mutate({ id: selectedCourse.id, data });
    } else {
      createCourse.mutate(data);
    }
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blogPosts.slice(0, 5).map((post: any) => (
                      <div key={post.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-muted-foreground">{post.author}</p>
                        </div>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course: any) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.instructor}</p>
                        </div>
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Blog Posts</h2>
              <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewBlogPost}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedBlogPost ? 'Update the blog post details below.' : 'Fill in the details to create a new blog post.'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...blogForm}>
                    <form onSubmit={blogForm.handleSubmit(handleBlogSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={blogForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter blog post title"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (!selectedBlogPost) {
                                      blogForm.setValue('slug', generateSlug(e.target.value));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="url-friendly-slug" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={blogForm.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Excerpt</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Brief description or excerpt" rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={blogForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Blog post content (HTML supported)" rows={12} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={blogForm.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Author name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Blog category" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={blogForm.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="tag1, tag2, tag3" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="readTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Read Time</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="5 min read" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={blogForm.control}
                        name="featuredImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Image URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/image.jpg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={blogForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setBlogDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createBlogPost.isPending || updateBlogPost.isPending}>
                          {createBlogPost.isPending || updateBlogPost.isPending ? 'Saving...' : selectedBlogPost ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="p-6">
                {blogLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map((post: any) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-foreground">By {post.author}</span>
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                            {post.category && (
                              <Badge variant="outline">{post.category}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBlogPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteBlogPost.mutate(post.id)}
                            disabled={deleteBlogPost.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Courses</h2>
              <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedCourse ? 'Edit Course' : 'Create New Course'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedCourse ? 'Update the course details below.' : 'Fill in the details to create a new course.'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...courseForm}>
                    <form onSubmit={courseForm.handleSubmit(handleCourseSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={courseForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter course title"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (!selectedCourse) {
                                      courseForm.setValue('slug', generateSlug(e.target.value));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={courseForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="url-friendly-slug" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={courseForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Brief course description" rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="fullDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Detailed course description (HTML supported)" rows={8} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={courseForm.control}
                          name="instructor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructor</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Instructor name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={courseForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Course category" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={courseForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="$99.00" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={courseForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="4 weeks" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={courseForm.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={courseForm.control}
                        name="featuredImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Image URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/course-image.jpg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setCourseDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCourse.isPending || updateCourse.isPending}>
                          {createCourse.isPending || updateCourse.isPending ? 'Saving...' : selectedCourse ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="p-6">
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course: any) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-foreground">By {course.instructor}</span>
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                            {course.difficulty && (
                              <Badge variant="outline">{course.difficulty}</Badge>
                            )}
                            {course.price && (
                              <Badge variant="outline">{course.price}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteCourse.mutate(course.id)}
                            disabled={deleteCourse.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                {pagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contentPages.map((page: any) => (
                      <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{page.pageName}</h3>
                          <p className="text-sm text-muted-foreground">{page.title}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Updated {new Date(page.updatedAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{page.pageType}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {mediaAssets.map((asset: any) => (
                      <div key={asset.id} className="border rounded-lg p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {asset.mimeType?.startsWith('image/') ? (
                            <img 
                              src={asset.filePath} 
                              alt={asset.altText || asset.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-medium text-sm truncate">{asset.fileName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {(asset.fileSize / 1024).toFixed(1)} KB
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">
                            {asset.mimeType?.split('/')[1]?.toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}