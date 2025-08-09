import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Link, Image, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Eye, Save, Upload, X, Plus, Search, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
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
}

interface BlogEditorProps {
  postId?: string;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

export function BlogEditor({ postId, onSave, onCancel }: BlogEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("content");
  const [selectedText, setSelectedText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  
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
    category: "medical-education",
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
  const { data: existingPost } = useQuery({
    queryKey: [`/api/cms/blog/${postId}`],
    enabled: !!postId,
  });

  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
    }
  }, [existingPost]);

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

    // Meta description analysis
    if (!post.metaDescription) {
      issues.push("Meta description is missing");
      score -= 15;
    } else if (post.metaDescription.length > 160) {
      issues.push("Meta description is too long (max 160 characters)");
      score -= 10;
    } else if (post.metaDescription.length < 120) {
      issues.push("Meta description is too short (min 120 characters)");
      score -= 5;
    }

    // Focus keyword analysis
    if (!post.focusKeyword) {
      issues.push("Focus keyword is missing");
      score -= 15;
    } else {
      // Check if focus keyword appears in title
      if (!post.title.toLowerCase().includes(post.focusKeyword.toLowerCase())) {
        suggestions.push("Include focus keyword in the title");
        score -= 10;
      }
      // Check if focus keyword appears in content
      if (!post.content.toLowerCase().includes(post.focusKeyword.toLowerCase())) {
        issues.push("Focus keyword not found in content");
        score -= 10;
      }
      // Check keyword density
      const keywordCount = (post.content.toLowerCase().match(new RegExp(post.focusKeyword.toLowerCase(), "g")) || []).length;
      const wordCount = post.content.split(/\s+/).length;
      const density = (keywordCount / wordCount) * 100;
      
      if (density < 0.5) {
        suggestions.push("Keyword density is low (< 0.5%)");
        score -= 5;
      } else if (density > 3) {
        issues.push("Keyword density is too high (> 3%)");
        score -= 10;
      }
    }

    // Content length analysis
    const wordCount = post.content.split(/\s+/).length;
    if (wordCount < 300) {
      issues.push("Content is too short (min 300 words)");
      score -= 20;
    } else if (wordCount < 600) {
      suggestions.push("Consider adding more content (600+ words recommended)");
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

  // Format toolbar functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(`h${level}`);
      heading.textContent = selection.toString() || `Heading ${level}`;
      range.deleteContents();
      range.insertNode(heading);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      formatText("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      const img = `<img src="${url}" alt="" class="max-w-full h-auto rounded-lg my-4" />`;
      document.execCommand("insertHTML", false, img);
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
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Failed to save blog post");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Blog post ${postId ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      if (onSave) onSave(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Get content from contenteditable div
    const contentDiv = document.getElementById("blog-content-editor");
    if (contentDiv) {
      setPost(prev => ({ ...prev, content: contentDiv.innerHTML }));
    }
    
    saveMutation.mutate(post);
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
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
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
              {/* Title and Slug */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter blog post title"
                      className="text-xl font-semibold"
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

              {/* Rich Text Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Editor</CardTitle>
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("bold")}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("italic")}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("underline")}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertHeading(2)}
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertHeading(3)}
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("insertUnorderedList")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("insertOrderedList")}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("formatBlock", "<blockquote>")}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("justifyLeft")}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("justifyCenter")}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => formatText("justifyRight")}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-gray-300" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={insertLink}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={insertImage}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    id="blog-content-editor"
                    contentEditable
                    className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    onInput={(e) => {
                      const target = e.target as HTMLDivElement;
                      setPost(prev => ({ ...prev, content: target.innerHTML }));
                    }}
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
                        onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddKeyword}
                      >
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
                      placeholder="https://example.com/blog/post"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Open Graph */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media (Open Graph)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="og-title">OG Title</Label>
                    <Input
                      id="og-title"
                      value={post.ogTitle}
                      onChange={(e) => setPost(prev => ({ ...prev, ogTitle: e.target.value }))}
                      placeholder="Title for social media sharing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="og-description">OG Description</Label>
                    <Textarea
                      id="og-description"
                      value={post.ogDescription}
                      onChange={(e) => setPost(prev => ({ ...prev, ogDescription: e.target.value }))}
                      placeholder="Description for social media sharing"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="og-image">OG Image URL</Label>
                    <Input
                      id="og-image"
                      value={post.ogImage}
                      onChange={(e) => setPost(prev => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="Image URL for social media sharing"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <article className="prose prose-lg max-w-none">
                    <h1 className="text-3xl font-bold mb-4">{post.title || "Untitled Post"}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                      <span>By {post.author || "Unknown Author"}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{Math.ceil(post.content.split(/\s+/).length / 200)} min read</span>
                    </div>
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.featuredImageAlt || post.title}
                        className="w-full rounded-lg mb-6"
                      />
                    )}
                    <div dangerouslySetInnerHTML={{ __html: post.content || "<p>No content yet...</p>" }} />
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
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical-education">Medical Education</SelectItem>
                    <SelectItem value="clinical-rotations">Clinical Rotations</SelectItem>
                    <SelectItem value="career-advice">Career Advice</SelectItem>
                    <SelectItem value="medical-news">Medical News</SelectItem>
                    <SelectItem value="study-tips">Study Tips</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
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
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                  >
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
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featured-image">Image URL</Label>
                <Input
                  id="featured-image"
                  value={post.featuredImage}
                  onChange={(e) => setPost(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="featured-image-alt">Alt Text</Label>
                <Input
                  id="featured-image-alt"
                  value={post.featuredImageAlt}
                  onChange={(e) => setPost(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                  placeholder="Describe the image for SEO"
                />
              </div>

              {post.featuredImage && (
                <div>
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}