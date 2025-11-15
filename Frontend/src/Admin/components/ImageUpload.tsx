import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  images: (File | string)[];
  errors?: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  getImageUrl: (image: File | string) => string;
}

export default function ImageUpload({
  images,
  errors,
  onImageChange,
  onRemoveImage,
  getImageUrl
}: ImageUploadProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <ImageIcon size={18} />
        Product Images (Max 5)
      </label>
      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-700 hover:bg-amber-50 transition-colors"
        >
          <Upload size={32} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Click to upload images</span>
          <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5 images</span>
        </label>
      </div>
      {errors && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {errors}
        </p>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={getImageUrl(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

