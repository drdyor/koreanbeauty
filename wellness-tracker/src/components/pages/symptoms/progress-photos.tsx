import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera,
  Upload,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';

interface ProgressPhoto {
  id: string;
  timestamp: Date;
  image: string; // base64 or URL
  category: string;
  notes?: string;
  tags?: string[];
}

const photoCategories = [
  'Face/Skin',
  'Body',
  'Weight',
  'Fitness',
  'Medical',
  'Other'
];

const commonTags = [
  'Acne', 'Scarring', 'Redness', 'Texture', 'Progress',
  'Before', 'After', 'Treatment', 'Flare-up', 'Improvement'
];

export function ProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPhotos(prev => [{
        id: Date.now().toString(),
        timestamp: new Date(),
        image: imageData,
        category: selectedCategory,
        notes: notes.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      }, ...prev]);

      // Reset form
      setSelectedCategory('');
      setNotes('');
      setSelectedTags([]);
      setShowAddForm(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    const category = photo.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-700 mb-4">
            Track physical changes over time with photos. Perfect for monitoring skin conditions,
            fitness progress, or any visible health improvements.
          </p>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Progress Photo'}
          </Button>
        </CardContent>
      </Card>

      {/* Add Photo Form */}
      {showAddForm && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Add New Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <div className="flex flex-wrap gap-2">
                {photoCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-purple-500' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags (optional)</label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you're tracking or any observations..."
                className="border-gray-300"
              />
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex gap-3">
              <Button
                onClick={triggerFileSelect}
                disabled={!selectedCategory}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>

            {!selectedCategory && (
              <p className="text-sm text-amber-600">
                Please select a category before adding a photo.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery */}
      {Object.keys(groupedPhotos).length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No photos yet</h3>
            <p className="text-gray-600">
              Start tracking your progress with photos! 📸
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
            <Card key={category} className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  {category} Progress
                  <Badge variant="secondary" className="ml-2">
                    {categoryPhotos.length} photos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={photo.image}
                          alt={`${category} progress photo`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Overlay with info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                        <div className="text-white text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{formatDate(photo.timestamp)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePhoto(photo.id)}
                              className="h-6 w-6 p-0 text-white hover:bg-white/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          {photo.tags && photo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {photo.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {photo.tags.length > 3 && (
                                <span className="text-xs">+{photo.tags.length - 3} more</span>
                              )}
                            </div>
                          )}

                          {photo.notes && (
                            <p className="text-xs opacity-90 line-clamp-2">
                              {photo.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}