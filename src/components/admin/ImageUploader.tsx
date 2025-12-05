'use client';

import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader = ({ images, onChange, maxImages = 10 }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange([...images, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const changeImage = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const newImages = [...images];
          newImages[index] = result;
          onChange(newImages);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all cursor-pointer',
          dragActive 
            ? 'border-teal-500 bg-teal-50' 
            : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50',
          images.length >= maxImages && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={images.length >= maxImages}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-teal-500 flex items-center justify-center">
            <Upload className="w-7 h-7 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              Drop images here or <span className="text-teal-600">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium">
          i
        </div>
        <span>
          Add at least 1 image ({images.length}/{maxImages})
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-rose-500 text-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  changeImage(index);
                }}
                className="absolute bottom-1 left-1 right-1 text-xs text-slate-700 font-medium bg-white border-2 border-slate-300 px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-center"
              >
                Change
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
