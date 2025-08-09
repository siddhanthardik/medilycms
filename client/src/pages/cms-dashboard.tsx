import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  Save,
  Trash2,
  Settings
} from 'lucide-react';
import { AdminNavbar } from '@/components/admin-navbar';
import { BlogManagement } from '@/components/cms/blog-management';

interface CmsPage {
  id: string;
  pageName: string;
  displayName: string;
  slug: string;
  title: string;
  metaDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CmsContentSection {
  id: string;
  pageId: string;
  sectionKey: string;
  sectionType: 'text' | 'image' | 'html' | 'json';
  content: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CmsMediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export default function CmsDashboard() {
  const [, navigate] = useLocation();
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const [showEditPageDialog, setShowEditPageDialog] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<CmsContentSection | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'sections' | 'media' | 'blog'>('pages');
  
  const [newPageData, setNewPageData] = useState({
    pageName: '',
    displayName: '',
    slug: '',
    title: '',
    metaDescription: ''
  });

  const [newSectionData, setNewSectionData] = useState({
    sectionKey: '',
    sectionType: 'text' as const,
    content: '',
    sortOrder: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch CMS pages
  const { data: pages, isLoading: loadingPages } = useQuery<CmsPage[]>({
    queryKey: ['/api/cms/pages'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch content sections for selected page
  const { data: sections, isLoading: loadingSections } = useQuery<CmsContentSection[]>({
    queryKey: ['/api/cms/pages', selectedPage?.id, 'sections'],
    enabled: !!selectedPage?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch media assets
  const { data: mediaAssets, isLoading: loadingMedia } = useQuery<CmsMediaAsset[]>({
    queryKey: ['/api/cms/media-assets'],
    staleTime: 5 * 60 * 1000,
  });

  // Create new page mutation
  const createPageMutation = useMutation({
    mutationFn: async (pageData: typeof newPageData) => {
      const response = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      });
      if (!response.ok) throw new Error('Failed to create page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages'] });
      setShowAddPageDialog(false);
      setNewPageData({ pageName: '', displayName: '', slug: '', title: '', metaDescription: '' });
      toast({ title: "Success", description: "Page created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CmsPage> }) => {
      const response = await fetch(`/api/cms/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages'] });
      setShowEditPageDialog(false);
      toast({ title: "Success", description: "Page updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Create content section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (sectionData: typeof newSectionData & { pageId: string }) => {
      const response = await fetch('/api/cms/content-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      });
      if (!response.ok) throw new Error('Failed to create section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages', selectedPage?.id, 'sections'] });
      setShowAddSectionDialog(false);
      setNewSectionData({ sectionKey: '', sectionType: 'text', content: '', sortOrder: 0 });
      toast({ title: "Success", description: "Content section created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update content section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CmsContentSection> }) => {
      const response = await fetch(`/api/cms/content-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages', selectedPage?.id, 'sections'] });
      setEditingSection(null);
      toast({ title: "Success", description: "Content section updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete content section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cms/content-sections/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/pages', selectedPage?.id, 'sections'] });
      toast({ title: "Success", description: "Content section deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    createPageMutation.mutate(newPageData);
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    createSectionMutation.mutate({ ...newSectionData, pageId: selectedPage.id });
  };

  const handleUpdateSection = (section: CmsContentSection) => {
    updateSectionMutation.mutate({ 
      id: section.id, 
      data: { 
        content: section.content,
        sectionKey: section.sectionKey,
        sectionType: section.sectionType,
        sortOrder: section.sortOrder
      } 
    });
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this content section?')) {
      deleteSectionMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Content Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage website pages, content sections, and media assets
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pages'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Website Pages ({pages?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Content Sections {selectedPage ? `(${sections?.length || 0})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'media'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Media Assets ({mediaAssets?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blog'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Blog Management
            </button>
          </nav>
        </div>

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Website Pages
              </h2>
              <Dialog open={showAddPageDialog} onOpenChange={setShowAddPageDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Page</DialogTitle>
                    <DialogDescription>
                      Create a new website page for content management.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePage} className="space-y-4">
                    <div>
                      <Label htmlFor="pageName">Page Name</Label>
                      <Input
                        id="pageName"
                        value={newPageData.pageName}
                        onChange={(e) => setNewPageData(prev => ({ ...prev, pageName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={newPageData.displayName}
                        onChange={(e) => setNewPageData(prev => ({ ...prev, displayName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={newPageData.slug}
                        onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Page Title</Label>
                      <Input
                        id="title"
                        value={newPageData.title}
                        onChange={(e) => setNewPageData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={newPageData.metaDescription}
                        onChange={(e) => setNewPageData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createPageMutation.isPending}
                    >
                      {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingPages ? (
              <div className="text-center py-8">Loading pages...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pages?.map((page) => (
                  <Card key={page.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{page.displayName}</CardTitle>
                        <Badge variant={page.isActive ? 'default' : 'secondary'}>
                          {page.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>/{page.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {page.metaDescription}
                      </p>
                      <div className="flex space-x-2">
                        <Link href={`/cms-editor?pageId=${page.id}`}>
                          <Button
                            size="sm"
                            variant="default"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Content
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPage(page);
                            setActiveTab('sections');
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Advanced
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPage(page);
                            setShowEditPageDialog(true);
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {!selectedPage ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Page Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please select a page from the Pages tab to manage its content sections.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setActiveTab('pages')}
                >
                  Go to Pages
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Content Sections for "{selectedPage.displayName}"
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage text, images, and other content sections
                    </p>
                  </div>
                  <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Content Section</DialogTitle>
                        <DialogDescription>
                          Add a new content section to this page.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateSection} className="space-y-4">
                        <div>
                          <Label htmlFor="sectionKey">Section Key</Label>
                          <Input
                            id="sectionKey"
                            placeholder="e.g., hero_title, about_description"
                            value={newSectionData.sectionKey}
                            onChange={(e) => setNewSectionData(prev => ({ ...prev, sectionKey: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="sectionType">Section Type</Label>
                          <Select 
                            value={newSectionData.sectionType}
                            onValueChange={(value: 'text' | 'image' | 'html' | 'json') => 
                              setNewSectionData(prev => ({ ...prev, sectionType: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={newSectionData.content}
                            onChange={(e) => setNewSectionData(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="sortOrder">Sort Order</Label>
                          <Input
                            id="sortOrder"
                            type="number"
                            value={newSectionData.sortOrder}
                            onChange={(e) => setNewSectionData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={createSectionMutation.isPending}
                        >
                          {createSectionMutation.isPending ? 'Creating...' : 'Create Section'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loadingSections ? (
                  <div className="text-center py-8">Loading content sections...</div>
                ) : (
                  <div className="space-y-4">
                    {sections?.map((section) => (
                      <Card key={section.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{section.sectionKey}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">{section.sectionType}</Badge>
                                <Badge variant="secondary">Order: {section.sortOrder}</Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSection(section)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSection(section.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {editingSection?.id === section.id ? (
                            <div className="space-y-3">
                              <div>
                                <Label>Section Key</Label>
                                <Input
                                  value={editingSection.sectionKey}
                                  onChange={(e) => setEditingSection(prev => prev ? { ...prev, sectionKey: e.target.value } : null)}
                                />
                              </div>
                              <div>
                                <Label>Content</Label>
                                <Textarea
                                  value={editingSection.content}
                                  onChange={(e) => setEditingSection(prev => prev ? { ...prev, content: e.target.value } : null)}
                                  rows={4}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateSection(editingSection)}
                                  disabled={updateSectionMutation.isPending}
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSection(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded max-h-32 overflow-y-auto">
                                {section.content}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {sections?.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Content Sections
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Start by adding content sections to this page.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Media Assets Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Media Assets
              </h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>

            {loadingMedia ? (
              <div className="text-center py-8">Loading media assets...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mediaAssets?.map((asset) => (
                  <Card key={asset.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {asset.fileType.startsWith('image/') ? (
                        <img 
                          src={asset.fileUrl} 
                          alt={asset.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm truncate" title={asset.originalName}>
                        {asset.originalName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(asset.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                {mediaAssets?.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Media Assets
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Upload images and other media files to get started.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'blog' && (
          <BlogManagement />
        )}

        {/* Edit Page Dialog */}
        <Dialog open={showEditPageDialog} onOpenChange={setShowEditPageDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Page Settings</DialogTitle>
              <DialogDescription>
                Update page metadata and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedPage && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updatePageMutation.mutate({ 
                    id: selectedPage.id, 
                    data: { 
                      displayName: selectedPage.displayName,
                      title: selectedPage.title,
                      metaDescription: selectedPage.metaDescription
                    } 
                  });
                }} 
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="editDisplayName">Display Name</Label>
                  <Input
                    id="editDisplayName"
                    value={selectedPage.displayName}
                    onChange={(e) => setSelectedPage(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editTitle">Page Title</Label>
                  <Input
                    id="editTitle"
                    value={selectedPage.title}
                    onChange={(e) => setSelectedPage(prev => prev ? { ...prev, title: e.target.value } : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editMetaDescription">Meta Description</Label>
                  <Textarea
                    id="editMetaDescription"
                    value={selectedPage.metaDescription}
                    onChange={(e) => setSelectedPage(prev => prev ? { ...prev, metaDescription: e.target.value } : null)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updatePageMutation.isPending}
                >
                  {updatePageMutation.isPending ? 'Updating...' : 'Update Page'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}