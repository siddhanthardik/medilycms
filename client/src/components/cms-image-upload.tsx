import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { UniversalImageUpload } from './universal-image-upload';

interface CMSImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  altText?: string;
  className?: string;
}

export function CMSImageUpload({ onImageUploaded, currentImage, altText = '', className = '' }: CMSImageUploadProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const removeImage = () => {
    onImageUploaded('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt={altText}
            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              Replace Image
            </Button>
          </div>
        </div>
      ) : null}
      
      {(showAdvanced || !currentImage) && (
        <UniversalImageUpload
          onImageUploaded={(url) => {
            onImageUploaded(url);
            setShowAdvanced(false);
          }}
          currentImage={showAdvanced ? undefined : currentImage}
          label="CMS Image"
          showPreview={false}
          className={className}
        />
      )}
    </div>
  );
}