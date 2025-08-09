import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bold, Italic, Underline, List, ListOrdered, Quote, 
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, 
  Eye, Save, Upload, X, Plus, AlertCircle, CheckCircle, XCircle,
  Link, Image as ImageIcon, Code, Undo, Redo
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorId?: string;
  category: string;
  tags: string[];
  featuredImage: string;
  featuredImageAlt: string;
  status: "draft" | "published" | "archived";
  
  // SEO Fields
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  structuredData?: any;
  
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogEditorProps {
  postId?: string;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

export function BlogEditorImproved({ postId, onSave, onCancel }: BlogEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  
  // SEO Analysis states
  const [seoScore, setSeoScore] = useState(0);
  const [seoIssues, setSeoIssues] = useState<string[]>([]);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  
  const [post, setPost] = useState<BlogPost>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    category: "Medical Education",
    tags: [],
    featuredImage: "",
    featuredImageAlt: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  // Fetch existing post if editing
  const { data: existingPost } = useQuery<BlogPost>({
    queryKey: [`/api/cms/blog/${postId}`],
    enabled: !!postId,
  });

  // Fetch blog categories
  const { data: categories = [] } = useQuery<Array<{id: string, name: string}>>({
    queryKey: ['/api/cms/blog-categories'],
  });

  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
      // Initialize editor content when editing existing post
      if (editorRef.current && existingPost.content) {
        editorRef.current.innerHTML = existingPost.content;
        setIsEditorInitialized(true);
      }
    }
  }, [existingPost]);

  // Initialize empty editor content
  useEffect(() => {
    if (editorRef.current && !isEditorInitialized && !postId) {
      editorRef.current.innerHTML = post.content || "<div><br></div>";
      setIsEditorInitialized(true);
    }
  }, [isEditorInitialized, post.content, postId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (post.title && !postId) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setPost(prev => ({ ...prev, slug }));
    }
  }, [post.title, postId]);

  // SEO Analysis
  useEffect(() => {
    analyzeSEO();
  }, [post]);

  const analyzeSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Title analysis
    if (!post.metaTitle) {
      issues.push("Meta title is missing");
      score -= 15;
    } else if (post.metaTitle.length > 60) {
      issues.push("Meta title is too long (max 60 characters)");
      score -= 10;
    } else if (post.metaTitle.length < 30) {
      issues.push("Meta title is too short (min 30 characters)");
      score -= 5;
    }

    // Description analysis
    if (!post.metaDescription) {
      issues.push("Meta description is missing");
      score -= 15;
    } else if (post.metaDescription.length > 160) {
      issues.push("Meta description is too long (max 160 characters)");
      score -= 10;
    } else if (post.metaDescription.length < 120) {
      suggestions.push("Meta description could be longer (120-160 characters)");
      score -= 5;
    }

    // Focus keyword
    if (!post.focusKeyword) {
      issues.push("Focus keyword is missing");
      score -= 10;
    } else {
      // Check if focus keyword appears in title
      if (!post.title.toLowerCase().includes(post.focusKeyword.toLowerCase())) {
        suggestions.push("Include focus keyword in the title");
        score -= 5;
      }
      // Check if focus keyword appears in meta description
      if (!post.metaDescription.toLowerCase().includes(post.focusKeyword.toLowerCase())) {
        suggestions.push("Include focus keyword in the meta description");
        score -= 5;
      }
    }

    // Keywords
    if (post.keywords.length === 0) {
      suggestions.push("Add relevant keywords for better SEO");
      score -= 5;
    }

    // Content length
    const contentLength = post.content.replace(/<[^>]*>/g, "").length;
    if (contentLength < 300) {
      issues.push("Content is too short (min 300 words)");
      score -= 15;
    } else if (contentLength < 600) {
      suggestions.push("Longer content tends to rank better (600+ words)");
      score -= 5;
    }

    // Image alt text
    if (post.featuredImage && !post.featuredImageAlt) {
      issues.push("Featured image alt text is missing");
      score -= 10;
    }

    // Headings check
    if (!post.content.includes("<h2") && !post.content.includes("<h3")) {
      suggestions.push("Add subheadings (H2, H3) to structure your content");
      score -= 5;
    }

    setSeoScore(Math.max(0, score));
    setSeoIssues(issues);
    setSeoSuggestions(suggestions);
  };

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand(command, false, value);
    
    // Update content state
    setTimeout(() => {
      if (editorRef.current) {
        setPost(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
      }
    }, 100);
  };

  const insertHeading = (level: number) => {
    execCommand("formatBlock", `<h${level}>`);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "blog");

      const response = await fetch("/api/cms/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImage = async (url: string, alt: string) => {
    if (editorRef.current) {
      const img = `<img src="${url}" alt="${alt}" class="max-w-full h-auto rounded-lg my-4" />`;
      execCommand("insertHTML", img);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file);
    if (url) {
      insertImage(url, imageAlt || file.name);
      setShowImageDialog(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file);
    if (url) {
      setPost(prev => ({ 
        ...prev, 
        featuredImage: url,
        featuredImageAlt: prev.featuredImageAlt || file.name
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !post.keywords.includes(keywordInput.trim())) {
      setPost(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setPost(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: BlogPost) => {
      const url = postId ? `/api/cms/blog/${postId}` : "/api/cms/blog";
      const method = postId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data: BlogPost) => {
      toast({
        title: "Success",
        description: `Blog post ${postId ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      if (onSave) onSave(data);
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (status?: "draft" | "published") => {
    // Validate required fields
    if (!post.title) {
      toast({
        title: "Error",
        description: "Please enter a title for the blog post",
        variant: "destructive",
      });
      return;
    }

    // For drafts, allow empty content
    if (status !== "draft" && (!post.content || post.content === "<div><br></div>" || post.content === "")) {
      toast({
        title: "Error",
        description: "Please add some content to the blog post",
        variant: "destructive",
      });
      return;
    }

    // Set default author if not set
    const saveData = {
      ...post,
      status: status || post.status,
      author: post.author || "Admin",
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt,
      ogTitle: post.ogTitle || post.title,
      ogDescription: post.ogDescription || post.excerpt,
      ogImage: post.ogImage || post.featuredImage,
    };

    saveMutation.mutate(saveData);
  };

  const getSeoScoreColor = () => {
    if (seoScore >= 80) return "text-green-600";
    if (seoScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeoScoreIcon = () => {
    if (seoScore >= 80) return <CheckCircle className="h-5 w-5" />;
    if (seoScore >= 60) return <AlertCircle className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {postId ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => handleSave()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Title and Basic Info */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter blog post title"
                      className="text-xl font-semibold"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={post.slug}
                      onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="blog-post-url-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of the blog post"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.featuredImage && (
                    <div className="relative">
                      <img 
                        src={post.featuredImage} 
                        alt={post.featuredImageAlt}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setPost(prev => ({ ...prev, featuredImage: "", featuredImageAlt: "" }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("featured-image-upload")?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? "Uploading..." : "Upload from Computer"}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={post.featuredImage}
                        onChange={(e) => setPost(prev => ({ ...prev, featuredImage: e.target.value }))}
                        placeholder="Or paste image URL"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="featured-alt">Alt Text</Label>
                    <Input
                      id="featured-alt"
                      value={post.featuredImageAlt}
                      onChange={(e) => setPost(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                      placeholder="Describe the image for SEO"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rich Text Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Editor</CardTitle>
                  <div className="flex flex-wrap gap-1 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("bold")}
                      type="button"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("italic")}
                      type="button"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("underline")}
                      type="button"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertHeading(2)}
                      type="button"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertHeading(3)}
                      type="button"
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("insertUnorderedList")}
                      type="button"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("insertOrderedList")}
                      type="button"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("formatBlock", "<blockquote>")}
                      type="button"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("justifyLeft")}
                      type="button"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("justifyCenter")}
                      type="button"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("justifyRight")}
                      type="button"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={insertLink}
                      type="button"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" type="button">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Insert Image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Upload from Computer</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              ref={fileInputRef}
                            />
                          </div>
                          <div className="text-center text-gray-500">OR</div>
                          <div>
                            <Label>Image URL</Label>
                            <Input
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <Label>Alt Text</Label>
                            <Input
                              value={imageAlt}
                              onChange={(e) => setImageAlt(e.target.value)}
                              placeholder="Describe the image"
                            />
                          </div>
                          <Button
                            onClick={() => {
                              if (imageUrl) {
                                insertImage(imageUrl, imageAlt);
                                setShowImageDialog(false);
                                setImageUrl("");
                                setImageAlt("");
                              }
                            }}
                            disabled={!imageUrl || uploadingImage}
                          >
                            {uploadingImage ? "Uploading..." : "Insert Image"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("undo")}
                      type="button"
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => execCommand("redo")}
                      type="button"
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 prose prose-sm max-w-none"
                    style={{ 
                      fontSize: "14px", 
                      lineHeight: "1.6",
                      direction: "ltr",
                      textAlign: "left",
                      unicodeBidi: "normal"
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLDivElement;
                      const content = target.innerHTML;
                      // Only update if content actually changed to prevent unnecessary re-renders
                      if (content !== post.content) {
                        setPost(prev => ({ ...prev, content }));
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData("text/plain");
                      document.execCommand("insertText", false, text);
                    }}
                    onFocus={(e) => {
                      // Initialize content on first focus if not already initialized
                      if (!isEditorInitialized && editorRef.current) {
                        editorRef.current.innerHTML = post.content || "<div><br></div>";
                        setIsEditorInitialized(true);
                      }
                    }}
                    suppressContentEditableWarning={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              {/* SEO Score */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>SEO Score</CardTitle>
                    <div className={`flex items-center gap-2 ${getSeoScoreColor()}`}>
                      {getSeoScoreIcon()}
                      <span className="text-2xl font-bold">{seoScore}/100</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seoIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Issues to fix:</h4>
                      <ul className="space-y-1">
                        {seoIssues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {seoSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-600 mb-2">Suggestions:</h4>
                      <ul className="space-y-1">
                        {seoSuggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {seoScore >= 80 && seoIssues.length === 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Great! Your SEO is well optimized.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="focus-keyword">Focus Keyword</Label>
                    <Input
                      id="focus-keyword"
                      value={post.focusKeyword}
                      onChange={(e) => setPost(prev => ({ ...prev, focusKeyword: e.target.value }))}
                      placeholder="Main keyword to rank for"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <div className="space-y-1">
                      <Input
                        id="meta-title"
                        value={post.metaTitle}
                        onChange={(e) => setPost(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="SEO optimized title (max 60 chars)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500">
                        {post.metaTitle.length}/60 characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <div className="space-y-1">
                      <Textarea
                        id="meta-description"
                        value={post.metaDescription}
                        onChange={(e) => setPost(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="SEO optimized description (max 160 chars)"
                        maxLength={160}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500">
                        {post.metaDescription.length}/160 characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add keyword"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleAddKeyword} type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary">
                          {keyword}
                          <button
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-2"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="canonical-url">Canonical URL</Label>
                    <Input
                      id="canonical-url"
                      value={post.canonicalUrl}
                      onChange={(e) => setPost(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                      placeholder="https://example.com/blog/post-slug"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <article className="prose prose-lg max-w-none">
                    {post.featuredImage && (
                      <img 
                        src={post.featuredImage} 
                        alt={post.featuredImageAlt}
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h1 className="text-3xl font-bold mb-4">{post.title || "Untitled Post"}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                      <span>By {post.author || "Author"}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.category}</span>
                    </div>
                    {post.excerpt && (
                      <p className="text-lg text-gray-600 mb-6">{post.excerpt}</p>
                    )}
                    <div 
                      dangerouslySetInnerHTML={{ __html: post.content || "<p>No content yet...</p>" }}
                      className="prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed"
                    />
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </article>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={post.status}
                  onValueChange={(value: "draft" | "published" | "archived") => 
                    setPost(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={post.author}
                  onChange={(e) => setPost(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={post.category}
                  onValueChange={(value) => setPost(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button size="sm" onClick={handleAddTag} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveTab("preview")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Post
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSave("draft")}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              {post.status === "draft" && (
                <Button
                  className="w-full"
                  onClick={() => handleSave("published")}
                  disabled={saveMutation.isPending}
                >
                  Publish Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}