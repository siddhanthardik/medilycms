import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Edit, 
  Eye, 
  EyeOff, 
  Type, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Trash2,
  Plus
} from 'lucide-react';
import { UniversalImageUpload } from './universal-image-upload';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditableElement {
  id: string;
  tagName: string;
  content: string;
  attributes: Record<string, string>;
  position: { x: number; y: number };
  elementRef: HTMLElement;
}

interface DynamicCMSEditorProps {
  pageId: string;
  pageName: string;
  onSave?: () => void;
}

export function DynamicCMSEditor({ pageId, pageName, onSave }: DynamicCMSEditorProps) {
  const [editMode, setEditMode] = useState(false);
  const [editableElements, setEditableElements] = useState<EditableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Define which elements should be editable
  const editableSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  // Headings
    'p', 'span', 'div[data-editable]',     // Text elements
    'img',                                  // Images
    'a',                                   // Links
    'button',                              // Buttons
    '[role="button"]',                     // Button-like elements
    '.editable-text',                      // Custom editable class
    '[contenteditable]'                    // Already contenteditable elements
  ];

  // Scan DOM for editable elements
  const scanForEditableElements = () => {
    if (!containerRef.current) return;

    const elements: EditableElement[] = [];
    const container = containerRef.current;

    editableSelectors.forEach(selector => {
      const nodeList = container.querySelectorAll(selector);
      nodeList.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        
        // Skip if element is inside another editable element
        const hasEditableParent = htmlElement.closest('[data-cms-editable]');
        if (hasEditableParent && hasEditableParent !== htmlElement) return;

        // Skip navigation, script, style elements
        if (htmlElement.closest('nav, script, style, .cms-toolbar')) return;

        const rect = htmlElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const editableElement: EditableElement = {
          id: htmlElement.id || `cms-element-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${index}`,
          tagName: htmlElement.tagName.toLowerCase(),
          content: htmlElement.tagName.toLowerCase() === 'img' 
            ? htmlElement.getAttribute('src') || ''
            : htmlElement.textContent || htmlElement.innerText || '',
          attributes: {
            class: htmlElement.className,
            href: htmlElement.getAttribute('href') || '',
            src: htmlElement.getAttribute('src') || '',
            alt: htmlElement.getAttribute('alt') || '',
            title: htmlElement.getAttribute('title') || '',
          },
          position: {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          },
          elementRef: htmlElement
        };

        elements.push(editableElement);
      });
    });

    setEditableElements(elements);
  };

  // Add edit mode styles and handlers
  const enableEditMode = () => {
    editableElements.forEach(element => {
      const { elementRef } = element;
      
      // Add visual indicators
      elementRef.style.position = 'relative';
      elementRef.style.outline = '2px dashed transparent';
      elementRef.style.transition = 'outline-color 0.2s ease';
      elementRef.setAttribute('data-cms-editable', 'true');
      elementRef.setAttribute('data-cms-id', element.id);

      // Add hover effects
      const handleMouseEnter = () => {
        elementRef.style.outlineColor = '#3b82f6';
        elementRef.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        
        // Show edit button
        const editButton = document.createElement('button');
        editButton.innerHTML = '✏️';
        editButton.className = 'cms-edit-btn';
        editButton.style.cssText = `
          position: absolute;
          top: -10px;
          right: -10px;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          z-index: 1000;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        editButton.onclick = (e) => {
          e.stopPropagation();
          handleElementClick(element);
        };
        
        elementRef.appendChild(editButton);
      };

      const handleMouseLeave = () => {
        elementRef.style.outlineColor = 'transparent';
        elementRef.style.backgroundColor = 'transparent';
        
        // Remove edit button
        const editButton = elementRef.querySelector('.cms-edit-btn');
        if (editButton) {
          editButton.remove();
        }
      };

      elementRef.addEventListener('mouseenter', handleMouseEnter);
      elementRef.addEventListener('mouseleave', handleMouseLeave);
      
      // Store handlers for cleanup
      (elementRef as any)._cmsHandlers = { handleMouseEnter, handleMouseLeave };
    });
  };

  // Remove edit mode styles and handlers
  const disableEditMode = () => {
    editableElements.forEach(element => {
      const { elementRef } = element;
      
      elementRef.style.outline = '';
      elementRef.style.backgroundColor = '';
      elementRef.removeAttribute('data-cms-editable');
      elementRef.removeAttribute('data-cms-id');
      
      // Remove event listeners
      const handlers = (elementRef as any)._cmsHandlers;
      if (handlers) {
        elementRef.removeEventListener('mouseenter', handlers.handleMouseEnter);
        elementRef.removeEventListener('mouseleave', handlers.handleMouseLeave);
        delete (elementRef as any)._cmsHandlers;
      }
      
      // Remove any edit buttons
      const editButton = elementRef.querySelector('.cms-edit-btn');
      if (editButton) {
        editButton.remove();
      }
    });
  };

  // Handle element click for editing
  const handleElementClick = (element: EditableElement) => {
    setSelectedElement(element);
    setShowEditDialog(true);
  };

  // Save element changes
  const saveElementChanges = (updatedElement: EditableElement) => {
    const { elementRef, content, attributes } = updatedElement;
    
    if (elementRef.tagName.toLowerCase() === 'img') {
      elementRef.setAttribute('src', content);
      if (attributes.alt) elementRef.setAttribute('alt', attributes.alt);
    } else if (elementRef.tagName.toLowerCase() === 'a') {
      elementRef.textContent = content;
      if (attributes.href) elementRef.setAttribute('href', attributes.href);
    } else {
      elementRef.textContent = content;
    }

    // Update attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (value && key !== 'class') {
        elementRef.setAttribute(key, value);
      }
    });

    // Update local state
    setEditableElements(prev => 
      prev.map(el => el.id === updatedElement.id ? updatedElement : el)
    );
  };

  // Save all changes to backend
  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      const pageContent = {
        pageId,
        elements: editableElements.map(element => ({
          id: element.id,
          tagName: element.tagName,
          content: element.content,
          attributes: element.attributes,
          selector: `[data-cms-id="${element.id}"]`
        })),
        fullPageHTML: containerRef.current?.innerHTML || ''
      };

      const response = await fetch('/api/cms/save-page-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(pageContent)
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      toast({
        title: "Changes saved successfully",
        description: "All page content has been updated.",
      });

      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      disableEditMode();
      setEditMode(false);
    } else {
      scanForEditableElements();
      setEditMode(true);
    }
  };

  // Rescan when edit mode is enabled
  useEffect(() => {
    if (editMode && editableElements.length > 0) {
      enableEditMode();
    }
    
    return () => {
      if (editMode) {
        disableEditMode();
      }
    };
  }, [editMode, editableElements]);

  // Initial scan on mount and when container content changes
  useEffect(() => {
    // Delay scan to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      scanForEditableElements();
    }, 1000);

    // Set up a mutation observer to watch for content changes
    const observer = new MutationObserver(() => {
      if (editMode) {
        scanForEditableElements();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: false
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [editMode]);

  return (
    <>
      {/* CMS Toolbar */}
      <div className="cms-toolbar fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Editing: {pageName}</h2>
            <span className="text-sm text-gray-500">
              {editableElements.length} editable elements found
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={toggleEditMode}
              className="flex items-center gap-2"
            >
              {editMode ? <EyeOff className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            </Button>
            
            {editMode && (
              <Button
                onClick={saveAllChanges}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div ref={containerRef} className="cms-content-container">
        {/* This div will wrap the actual page content */}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {selectedElement?.tagName.toUpperCase()} Element
            </DialogTitle>
          </DialogHeader>
          
          {selectedElement && (
            <div className="space-y-4">
              {selectedElement.tagName === 'img' ? (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Upload New Image</Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose from local files, Google Drive, or public URLs. Supports JPG, PNG, GIF formats.
                    </p>
                    <UniversalImageUpload
                      onImageUploaded={(imageUrl) => {
                        console.log('Image uploaded:', imageUrl);
                        setSelectedElement(prev => 
                          prev ? { ...prev, content: imageUrl } : null
                        );
                      }}
                      currentImage={selectedElement.content}
                      label=""
                      showPreview={true}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label htmlFor="alt-text" className="text-base font-semibold">Alt Text (Accessibility)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Describe what's in the image for screen readers and accessibility.
                    </p>
                    <Input
                      id="alt-text"
                      value={selectedElement.attributes.alt || ''}
                      onChange={(e) => setSelectedElement(prev =>
                        prev ? {
                          ...prev,
                          attributes: { ...prev.attributes, alt: e.target.value }
                        } : null
                      )}
                      placeholder="e.g., Doctor examining patient with stethoscope"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold mb-2 block">Current Image URL</Label>
                    <Input
                      value={selectedElement.content}
                      onChange={(e) => setSelectedElement(prev =>
                        prev ? { ...prev, content: e.target.value } : null
                      )}
                      placeholder="https://example.com/image.jpg"
                      className="font-mono text-sm"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will update automatically when you upload a new image above.
                    </p>
                  </div>
                </div>
              ) : selectedElement.tagName === 'a' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="link-text">Link Text</Label>
                    <Input
                      id="link-text"
                      value={selectedElement.content}
                      onChange={(e) => setSelectedElement(prev =>
                        prev ? { ...prev, content: e.target.value } : null
                      )}
                      placeholder="Enter link text"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="link-url">Link URL</Label>
                    <Input
                      id="link-url"
                      value={selectedElement.attributes.href || ''}
                      onChange={(e) => setSelectedElement(prev =>
                        prev ? {
                          ...prev,
                          attributes: { ...prev.attributes, href: e.target.value }
                        } : null
                      )}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="element-content">Content</Label>
                  <Textarea
                    id="element-content"
                    value={selectedElement.content}
                    onChange={(e) => setSelectedElement(prev =>
                      prev ? { ...prev, content: e.target.value } : null
                    )}
                    placeholder="Enter text content"
                    rows={4}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedElement) {
                      saveElementChanges(selectedElement);
                      setShowEditDialog(false);
                    }
                  }}
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}