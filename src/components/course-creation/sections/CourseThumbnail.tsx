
import React, { useState } from 'react';
import { FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/course-creation/FileUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from 'lucide-react';

interface CourseThumbnailProps {
  form: any;
  onThumbnailChange: (file: File | null) => void;
  existingThumbnail?: string | null;
}

export const CourseThumbnail = ({ form, onThumbnailChange, existingThumbnail }: CourseThumbnailProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingThumbnail || null);

  const handleFileChange = (file: File | null) => {
    onThumbnailChange(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(existingThumbnail || null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Course Thumbnail</h3>
        <p className="text-sm text-slate-400">
          Add an image that represents your course. It will be displayed in the course catalog.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Label>Upload Thumbnail</Label>
                <FileUploader
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                  onChange={(file) => {
                    handleFileChange(file);
                  }}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Recommended size: 1280x720 pixels (16:9 ratio). Max 5MB.
                </p>
              </div>
              
              <div className="flex-1">
                <Label>Preview</Label>
                <Card className="border border-slate-700 overflow-hidden">
                  <CardContent className="p-0">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Thumbnail Preview" 
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
                        <Image className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};
