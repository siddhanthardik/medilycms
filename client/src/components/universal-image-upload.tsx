import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Link, Image, FileImage } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UniversalImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
  label?: string;
  showPreview?: boolean;
}

export function UniversalImageUpload({ 
  onImageUploaded, 
  currentImage, 
  className = "", 
  label = "Profile Image",
  showPreview = true 
}: UniversalImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("local");
  const { toast } = useToast();

  // Convert Google Drive URLs to proper format
  const processImageUrl = (url: string): string => {
    if (!url) return url;
    
    // Check if it's a Google Drive sharing URL
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }
    
    return url;
  };

  // Handle local file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPEG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onImageUploaded(result.url);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been processed and is ready to use",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle URL input (Google Drive or public URL)
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(urlInput.trim());
    } catch {
      toast({
        title: "Invalid URL format",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const processedUrl = processImageUrl(urlInput.trim());
      
      // Test if the URL is accessible
      const testImage = document.createElement('img');
      testImage.onload = () => {
        onImageUploaded(processedUrl);
        setUrlInput("");
        toast({
          title: "Image URL updated successfully",
          description: "Your image has been updated and is ready to use",
        });
        setUploading(false);
      };
      
      testImage.onerror = () => {
        toast({
          title: "Image failed to load",
          description: "The URL doesn't appear to contain a valid image. Please verify the URL and try again. For Freepik images, ensure you're using the direct image URL, not the page URL.",
          variant: "destructive",
        });
        setUploading(false);
      };
      
      testImage.src = processedUrl;
    } catch (error) {
      console.error('URL processing error:', error);
      toast({
        title: "URL processing failed", 
        description: "There was an error processing your image URL. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Current Image Preview */}
      {showPreview && currentImage && (
        <div className="mb-4">
          <img
            src={currentImage}
            alt="Current image"
            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
            onError={(e) => {
              e.currentTarget.src = "/api/placeholder/400/400";
            }}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Local File
          </TabsTrigger>
          <TabsTrigger value="drive" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Google Drive
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Public URL
          </TabsTrigger>
        </TabsList>

        {/* Local File Upload */}
        <TabsContent value="local" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <Label htmlFor="file-upload">
                  <Button variant="outline" disabled={uploading} className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supports PNG, JPEG, WebP (max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Drive URL */}
        <TabsContent value="drive" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Image className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">
                    Paste your Google Drive sharing link
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    disabled={uploading}
                  />
                  <Button 
                    onClick={handleUrlSubmit} 
                    disabled={uploading || !urlInput.trim()}
                    className="w-full"
                  >
                    {uploading ? 'Processing...' : 'Add Google Drive Image'}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Make sure your Google Drive file is publicly accessible</p>
                  <p>• Copy the sharing link from Google Drive</p>
                  <p>• Link format: https://drive.google.com/file/d/FILE_ID/...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public URL */}
        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Link className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p className="text-sm text-gray-600">
                    Enter a direct image URL
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={uploading}
                  />
                  <Button 
                    onClick={handleUrlSubmit} 
                    disabled={uploading || !urlInput.trim()}
                    className="w-full"
                  >
                    {uploading ? 'Processing...' : 'Add Image URL'}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Use direct links to images (ending in .jpg, .png, .webp)</p>
                  <p>• Make sure the image is publicly accessible</p>
                  <p>• Unsplash, Imgur, and other image hosts work well</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}