import { useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { resolveAssetUrl, uploadImages } from '../services/api';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}

export const ImageUploader = ({ value, onChange, multiple = true }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadImages,
    onSuccess: (urls) => {
      if (multiple) {
        onChange([...value, ...urls]);
      } else {
        onChange(urls.slice(0, 1));
      }
    },
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    uploadMutation.mutate(multiple ? files : files.slice(0, 1));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-slate-600">
          <ImagePlus className="w-5 h-5" />
          <span className="text-sm font-medium">
            Drag images here or click to upload {multiple ? '(multiple allowed)' : '(single image)'}
          </span>
        </div>
        {uploadMutation.isPending && (
          <div className="mt-2 flex items-center gap-2 text-sm text-brand-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </div>
        )}
        {uploadMutation.error && (
          <p className="mt-2 text-sm text-red-600">
            {(uploadMutation.error as Error).message}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {value.map((url, idx) => (
            <div key={`${url}-${idx}`} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img src={resolveAssetUrl(url)} alt={`Uploaded ${idx + 1}`} className="w-full h-24 object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, index) => index !== idx))}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
