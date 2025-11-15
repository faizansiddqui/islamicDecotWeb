import { useState, useEffect } from 'react';
import { Settings, AlertCircle, Plus, X } from 'lucide-react';

interface FeaturesInputProps {
  features: string[];
  error?: string;
  onChange: (features: string[]) => void;
}

export default function FeaturesInput({ features, error, onChange }: FeaturesInputProps) {
  const [featurePoints, setFeaturePoints] = useState<string[]>(features.length > 0 ? features : ['']);

  useEffect(() => {
    if (features.length > 0) {
      setFeaturePoints(features);
    }
  }, [features]);

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...featurePoints];
    updated[index] = value;
    setFeaturePoints(updated);
    onChange(updated.filter(f => f.trim() !== ''));
  };

  const addFeaturePoint = () => {
    if (featurePoints.length < 5) {
      setFeaturePoints([...featurePoints, '']);
    }
  };

  const removeFeaturePoint = (index: number) => {
    if (featurePoints.length > 1) {
      const updated = featurePoints.filter((_, i) => i !== index);
      setFeaturePoints(updated);
      onChange(updated.filter(f => f.trim() !== ''));
    }
  };

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Settings size={18} />
        Features * (Maximum 5 points)
      </label>
      <div className="space-y-2">
        {featurePoints.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-gray-500 text-sm w-6">{(index + 1)}.</span>
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                placeholder={`Feature point ${index + 1}`}
              />
              {featurePoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeaturePoint(index)}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {featurePoints.length < 5 && (
          <button
            type="button"
            onClick={addFeaturePoint}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 text-sm font-medium mt-2"
          >
            <Plus size={16} />
            Add Feature Point ({featurePoints.length}/5)
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {featurePoints.length >= 5 && (
        <p className="mt-1 text-xs text-gray-500">Maximum 5 feature points reached</p>
      )}
    </div>
  );
}

