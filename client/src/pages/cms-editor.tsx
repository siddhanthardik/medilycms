import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Save,
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminNavbar } from '@/components/admin-navbar';

interface ContentSection {
  id?: string;
  pageId: string;
  sectionName: 'hero' | 'main' | 'sidebar' | 'footer' | 'header' | 'banner' | 'testimonials' | 'features' | 'pricing' | 'gallery' | 'custom';
  sectionKey: string;
  sectionTitle: string;
  contentType: 'text' | 'html' | 'image' | 'video';
  content?: string;
  imageUrl?: string;
  altText?: string;
  sortOrder: number;
  isActive: boolean;
}

interface CmsPage {
  id: string;
  pageName: string;
  displayName: string;
  slug: string;
  title: string;
  metaDescription: string;
  isActive: boolean;
}

export default function CmsEditor() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get('pageId');

  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch page data
  const { data: page, isLoading: pageLoading, error: pageError } = useQuery<CmsPage>({
    queryKey: ['/api/cms/pages', pageId],
    enabled: !!pageId,
  });

  // Fetch page sections
  const { data: pageSections, isLoading: sectionsLoading, error: sectionsError } = useQuery<ContentSection[]>({
    queryKey: ['/api/cms/pages', pageId, 'sections'],
    enabled: !!pageId,
  });

  useEffect(() => {
    if (pageSections && Array.isArray(pageSections)) {
      setSections(pageSections);
    }
  }, [pageSections]);

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentSection> }) => {
      const response = await fetch(`/api/cms/content-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update section');
      return response.json();
    },
    onSuccess: (updatedSection) => {
      setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
      setShowEditDialog(false);
      setEditingSection(null);
      toast({ title: "Success", description: "Content updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages', pageId, 'sections'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (sectionData: Omit<ContentSection, 'id'>) => {
      const response = await fetch('/api/cms/content-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionData,
          sectionName: sectionData.sectionName || 'main',
          sectionTitle: sectionData.sectionTitle || 'New Content'
        })
      });
      if (!response.ok) throw new Error('Failed to create section');
      return response.json();
    },
    onSuccess: (newSection) => {
      setSections(prev => [...prev, newSection].sort((a, b) => a.sortOrder - b.sortOrder));
      setShowEditDialog(false);
      setEditingSection(null);
      toast({ title: "Success", description: "Content section created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages', pageId, 'sections'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleEditSection = (section: ContentSection) => {
    setEditingSection({ ...section });
    setShowEditDialog(true);
  };

  const handleCreateNewSection = (type: 'text' | 'image' | 'html' = 'text') => {
    if (!page) return;
    
    const newSection: ContentSection = {
      pageId: page.id,
      sectionName: 'main',
      sectionKey: `section_${Date.now()}`,
      sectionTitle: 'New Content',
      contentType: type,
      content: type === 'text' ? 'Click to edit this text...' : '',
      imageUrl: type === 'image' ? '' : undefined,
      altText: type === 'image' ? 'Image description' : undefined,
      sortOrder: sections.length,
      isActive: true
    };
    
    setEditingSection(newSection);
    setShowEditDialog(true);
  };

  const handleSaveSection = () => {
    if (!editingSection) return;
    
    if (editingSection.id) {
      // Update existing section
      updateSectionMutation.mutate({
        id: editingSection.id,
        data: editingSection
      });
    } else {
      // Create new section
      createSectionMutation.mutate(editingSection);
    }
  };

  const renderEditableContent = (section: ContentSection) => {
    if (previewMode) {
      // Preview mode - no edit controls
      if (section.contentType === 'image') {
        return (
          <div className="relative">
            {section.imageUrl ? (
              <img 
                src={section.imageUrl} 
                alt={section.altText || 'Content image'}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No image uploaded</p>
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: section.content || '' }}
        />
      );
    }

    // Edit mode - clickable elements with edit controls
    if (section.contentType === 'image') {
      return (
        <div 
          className="relative group cursor-pointer border-2 border-transparent hover:border-blue-300 rounded-lg transition-all"
          onClick={() => handleEditSection(section)}
        >
          {section.imageUrl ? (
            <img 
              src={section.imageUrl} 
              alt={section.altText || 'Content image'}
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Click to upload image</p>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit Image
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="relative group cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 rounded-lg p-4 transition-all duration-200 min-h-[2rem] mb-4"
        onClick={() => handleEditSection(section)}
      >
        <div 
          className="prose max-w-none [&_*]:pointer-events-none"
          dangerouslySetInnerHTML={{ __html: section.content || '<p class="text-gray-500">Click to add content...</p>' }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
            <Type className="h-3 w-3 mr-1" />
            Click to Edit
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {section.sectionTitle} ({section.contentType})
          </span>
        </div>
      </div>
    );
  };

  if (!pageId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No page selected</h1>
          <p className="text-gray-600 mb-4">Please select a page to edit from the CMS dashboard.</p>
          <Button onClick={() => navigate('/cms-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CMS Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page data...</p>
        </div>
      </div>
    );
  }

  if (pageError || !page) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page not found</h1>
          <p className="text-gray-600 mb-4">
            The page with ID "{pageId}" could not be found or you don't have permission to access it.
          </p>
          {pageError && (
            <p className="text-red-600 mb-4 text-sm">
              Error: {pageError.message || 'Unknown error occurred'}
            </p>
          )}
          <Button onClick={() => navigate('/cms-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CMS Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar />
      
      <div className="border-b bg-white dark:bg-gray-800 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/cms-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Edit: {page.displayName}</h1>
              <p className="text-sm text-gray-500">/{page.slug}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Mode
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Mode
                </>
              )}
            </Button>
            
            {!previewMode && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleCreateNewSection('text')}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateNewSection('image')}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!previewMode && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              WordPress-Style Editing Active
            </h3>
            <p className="text-sm text-blue-800">
              ✏️ <strong>Click on any text or image</strong> to edit it directly<br/>
              👀 <strong>Hover over content</strong> to see edit buttons<br/>
              ➕ <strong>Use "Add Text/Image"</strong> buttons to create new sections<br/>
              👁️ <strong>Toggle Preview</strong> to see how it looks to visitors
            </p>
            <div className="mt-3 flex items-center text-xs text-blue-600">
              <span className="bg-blue-100 px-2 py-1 rounded mr-2">
                {sections.length} content section{sections.length !== 1 ? 's' : ''} loaded
              </span>
            </div>
          </div>
        )}

        {sectionsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading page content...</p>
          </div>
        ) : (
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <div className="border-b pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{page.title}</h1>
              {page.metaDescription && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{page.metaDescription}</p>
              )}
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Type className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No content sections yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start building your page by adding text and images.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => handleCreateNewSection('text')}>
                    <Type className="h-4 w-4 mr-2" />
                    Add Text Content
                  </Button>
                  <Button variant="outline" onClick={() => handleCreateNewSection('image')}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {sections
                  .filter(section => section.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => (
                    <div key={section.id || section.sectionKey}>
                      {renderEditableContent(section)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.id ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              {editingSection?.contentType === 'image' 
                ? 'Update the image and its properties'
                : 'Edit the text content for this section'}
            </DialogDescription>
          </DialogHeader>
          
          {editingSection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sectionTitle">Section Title</Label>
                  <Input
                    id="sectionTitle"
                    value={editingSection.sectionTitle}
                    onChange={(e) => setEditingSection(prev => 
                      prev ? { ...prev, sectionTitle: e.target.value } : null
                    )}
                    placeholder="e.g., Main Heading, Hero Text"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionKey">Section Key</Label>
                  <Input
                    id="sectionKey"
                    value={editingSection.sectionKey}
                    onChange={(e) => setEditingSection(prev => 
                      prev ? { ...prev, sectionKey: e.target.value } : null
                    )}
                    placeholder="e.g., hero_title, main_content"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sectionName">Section Type</Label>
                  <Select 
                    value={editingSection.sectionName}
                    onValueChange={(value: any) => 
                      setEditingSection(prev => prev ? { ...prev, sectionName: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero Section</SelectItem>
                      <SelectItem value="main">Main Content</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="testimonials">Testimonials</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="gallery">Gallery</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select 
                    value={editingSection.contentType}
                    onValueChange={(value: any) => 
                      setEditingSection(prev => prev ? { ...prev, contentType: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingSection.contentType === 'image' ? (
                <>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={editingSection.imageUrl || ''}
                      onChange={(e) => setEditingSection(prev => 
                        prev ? { ...prev, imageUrl: e.target.value } : null
                      )}
                      placeholder="Enter image URL or upload image"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altText">Image Description (Alt Text)</Label>
                    <Input
                      id="altText"
                      value={editingSection.altText || ''}
                      onChange={(e) => setEditingSection(prev => 
                        prev ? { ...prev, altText: e.target.value } : null
                      )}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={editingSection.content || ''}
                    onChange={(e) => setEditingSection(prev => 
                      prev ? { ...prev, content: e.target.value } : null
                    )}
                    rows={editingSection.contentType === 'html' ? 8 : 4}
                    placeholder={
                      editingSection.contentType === 'html' 
                        ? 'Enter HTML content...' 
                        : 'Enter your text content...'
                    }
                  />
                  {editingSection.contentType === 'html' && (
                    <p className="text-xs text-gray-500 mt-1">
                      You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;p&gt;)
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="sortOrder">Display Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={editingSection.sortOrder}
                  onChange={(e) => setEditingSection(prev => 
                    prev ? { ...prev, sortOrder: parseInt(e.target.value) || 0 } : null
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first (0, 1, 2, etc.)
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingSection(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSection}
                  disabled={updateSectionMutation.isPending || createSectionMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateSectionMutation.isPending || createSectionMutation.isPending 
                    ? 'Saving...' 
                    : 'Save Changes'
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}