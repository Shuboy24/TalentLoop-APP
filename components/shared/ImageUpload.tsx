"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

type ImageUploadProps = {
  currentImageUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
};

export function ImageUpload({ currentImageUrl, onUploadSuccess, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "talentloop_preset"); // User must configure this
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      onUploadSuccess(data.secure_url);
    } catch (err: any) {
      setError(err.message || "An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-variant bg-neutral">
            <img src={currentImageUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-0 right-0 p-1.5 bg-error text-error-on-error rounded-full hover:bg-error/90 shadow-tl-sm transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-neutral-variant bg-neutral-main flex flex-col items-center justify-center text-neutral-variant-on">
          <Upload className="w-6 h-6 mb-2 text-primary" />
          <span className="text-label-sm font-medium">Upload</span>
        </div>
      )}

      <div>
        <input
          type="file"
          id="avatar-upload"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label htmlFor="avatar-upload">
          <Button type="button" variant="outline" size="sm" asChild disabled={isUploading}>
            <span>{isUploading ? "Uploading..." : currentImageUrl ? "Change Avatar" : "Upload Avatar"}</span>
          </Button>
        </label>
      </div>
      
      {error && <p className="text-label-sm text-error">{error}</p>}
      <p className="text-xs text-neutral-variant-on">JPG, PNG, or WEBP up to 5MB</p>
    </div>
  );
}
