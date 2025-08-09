import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Calendar, User, Clock, Tag, Share2, 
  Facebook, Twitter, Linkedin, ChevronRight 
} from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/blog-posts/post/${slug}`],
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ['/api/blog-posts/All'],
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main>
        {/* Hero Section with Featured Image */}
        {post.featuredImage && (
          <div className="relative h-96 w-full overflow-hidden bg-gray-200">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="container mx-auto max-w-4xl">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {post.category}
                  </Badge>
                  {post.tags?.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {/* Article Header (if no featured image) */}
          {!post.featuredImage && (
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>{post.category}</Badge>
                {post.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              {post.excerpt && (
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </header>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 dark:text-gray-400 pb-8 border-b">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author || "MEDILY Team"}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {estimateReadTime(post.content)}
            </span>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Section */}
          <div className="flex items-center justify-between py-8 border-t border-b mb-12">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 font-medium">Share this article:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Author Bio (if available) */}
          {post.author && (
            <Card className="mb-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">About the Author</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {post.author} is a contributor to the MEDILY blog, sharing insights and expertise
                  about medical education and clinical rotations.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts
                  .filter((p: any) => p.id !== post.id)
                  .slice(0, 2)
                  .map((relatedPost: any) => (
                    <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Badge className="mb-3">{relatedPost.category}</Badge>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                          {relatedPost.excerpt}
                        </p>
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <Button variant="ghost" size="sm" className="group">
                            Read More
                            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}