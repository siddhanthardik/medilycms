import { useEffect, useRef, ReactNode } from 'react';
import { DynamicCMSEditor } from './dynamic-cms-editor';

interface FullPageCMSWrapperProps {
  children: ReactNode;
  pageId?: string;
  pageName?: string;
  enableCMS?: boolean;
}

export function FullPageCMSWrapper({ children, pageId, pageName, enableCMS = false }: FullPageCMSWrapperProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (enableCMS && contentRef.current) {
      // Wait for CMS editor to be rendered
      const waitForCMSContainer = () => {
        const cmsContainer = document.querySelector('.cms-content-container');
        if (cmsContainer && contentRef.current) {
          cmsContainer.innerHTML = '';
          cmsContainer.appendChild(contentRef.current.cloneNode(true));
        } else {
          // Retry after a short delay
          setTimeout(waitForCMSContainer, 100);
        }
      };
      
      waitForCMSContainer();
    }
  }, [enableCMS, children]);

  if (enableCMS && pageId && pageName) {
    return (
      <div className="full-page-cms-wrapper">
        <DynamicCMSEditor 
          pageId={pageId}
          pageName={pageName}
          onSave={() => {
            // Handle save completion
            console.log('Page content saved successfully');
          }}
        />
        
        {/* Hidden content that gets copied to the CMS container */}
        <div ref={contentRef} style={{ display: 'none' }}>
          {children}
        </div>
        
        {/* Visible content for non-CMS users */}
        <div className="visible-content mt-20">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}