import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Check, Image as ImageIcon, Sparkles, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { productService, resolveImageUrl } from '../services/api';

const FASHION_PRESETS = [
  {
    name: 'Silk Evening Gown',
    category: 'Dresses',
    url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Blue Floral Midi',
    category: 'Dresses',
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Crimson Party Dress',
    category: 'Dresses',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Boho White Sun Dress',
    category: 'Dresses',
    url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Emerald Silk Slip',
    category: 'Dresses',
    url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Vintage Denim Jacket',
    category: 'Tops',
    url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ribbed Crop Top',
    category: 'Tops',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Classic White Tee',
    category: 'Tops',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Italian Leather Derbies',
    category: 'Shoes',
    url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Designer White Sneakers',
    category: 'Shoes',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Champagne Gold Heels',
    category: 'Shoes',
    url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cognac Leather Tote Bag',
    category: 'Accessories',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  },
];

export default function ImageUploadModal({
  isOpen,
  onClose,
  product = null,
  onSuccess,
}) {
  const [tab, setTab] = useState('upload');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [previewUrl, setPreviewUrl] = useState(product?.image_url || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || 'Dresses');
  const [price, setPrice] = useState(product?.price || 1999);
  const [inventory, setInventory] = useState(product?.inventory || 20);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isEditing = Boolean(product);

  const handleFileChange = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid image format. Supported formats: JPEG, PNG, WEBP, GIF, SVG.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setImageUrl(preset.url);
    setPreviewUrl(preset.url);
    setSelectedFile(null);
    if (!isEditing && !name) {
      setName(preset.name);
      setCategory(preset.category);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        const uploadRes = await productService.uploadImage(selectedFile);
        if (uploadRes.data?.url) {
          finalImageUrl = uploadRes.data.url;
        } else {
          throw new Error('Upload failed to return a valid URL');
        }
      }

      if (!finalImageUrl) {
        throw new Error('Please select, upload, or enter a picture URL.');
      }

      if (isEditing) {
        await productService.update(product.id, {
          name: name.trim() || product.name,
          description: description.trim() || product.description,
          category,
          price: Number(price) || product.price,
          inventory: Number(inventory) || product.inventory,
          image_url: finalImageUrl,
        });
      } else {
        if (!name.trim()) {
          throw new Error('Product name is required');
        }
        await productService.create({
          name: name.trim(),
          description: description.trim() || 'Premium fashion curated item for online storefront.',
          category,
          price: Number(price) || 999,
          inventory: Number(inventory) || 20,
          image_url: finalImageUrl,
          rating: 4.8,
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? `Update Image & Details: ${product.name}` : 'Add New Product & Upload Picture'}
              </h2>
              <p className="text-xs text-slate-400">
                Upload custom photos, enter an image URL, or pick from high-definition fashion presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'upload'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload size={14} />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'url'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon size={14} />
              <span>Image URL</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('presets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'presets'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={14} />
              <span>Fashion Presets</span>
            </button>
          </div>

          {/* Tab 1: File Dropzone */}
          {tab === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                  : 'border-slate-700 bg-slate-950/50 hover:border-purple-500/50 hover:bg-slate-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Upload size={22} />
              </div>
              <p className="text-sm font-bold text-slate-200">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop picture'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, WEBP, GIF, SVG up to 10MB
              </p>
              {selectedFile && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Check size={12} />
                  <span>Ready for upload ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: URL Input */}
          {tab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Web Image URL (HTTPS)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full input-field text-xs pl-3 pr-10 py-2.5"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setPreviewUrl('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Paste any direct image link from Unsplash, Shopify, AWS S3, or CDN.
              </p>
            </div>
          )}

          {/* Tab 3: Presets */}
          {tab === 'presets' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                Choose from high-resolution, relevant fashion photography:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {FASHION_PRESETS.map((preset, idx) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20 ring-1 ring-purple-500'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{preset.name}</p>
                        <span className="text-[9px] text-purple-400">{preset.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Preview Bar */}
          {previewUrl && (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-4">
              <img
                src={resolveImageUrl(previewUrl)}
                alt="Preview"
                className="w-16 h-16 rounded-xl object-cover border border-purple-500/30 flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-purple-400" />
                  <span>Image Preview Active</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {selectedFile ? `File: ${selectedFile.name}` : previewUrl}
                </p>
              </div>
            </div>
          )}

          {/* Product Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Luxury Velvet Midi Dress"
                className="w-full input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full input-field text-xs py-2"
              >
                <option value="Dresses">Dresses</option>
                <option value="Tops">Tops</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Price (INR ₹)
              </label>
              <input
                type="number"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Initial Inventory
              </label>
              <input
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full input-field text-xs py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the product style, fabric, and sizing..."
                className="w-full input-field text-xs py-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!previewUrl && !selectedFile)}
              className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isEditing ? <Check size={14} /> : <Plus size={14} />}
                  <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
