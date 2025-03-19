import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUpdateServices, Update } from '../../services/api';

const AdminUpdateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: 'news' | 'announcement' | 'reminder';
    importance: number;
    activeUntil: string;
  }>({
    title: '',
    content: '',
    type: 'news',
    importance: 5,
    activeUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load update data if in edit mode
  useEffect(() => {
    const fetchUpdate = async () => {
      if (!id) return;
      
      try {
        const data = await adminUpdateServices.getUpdate(id);
        setFormData({
          title: data.title,
          content: data.content,
          type: data.type as 'news' | 'announcement' | 'reminder',
          importance: data.importance,
          activeUntil: new Date(data.activeUntil).toISOString().split('T')[0]
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching update:', err);
        setError('Failed to load update data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isEditMode) {
      fetchUpdate();
    }
  }, [id, isEditMode]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle rich text editor changes if using react-quill
  const handleEditorChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      if (isEditMode && id) {
        await adminUpdateServices.updateUpdate(id, {
          ...formData,
          activeUntil: new Date(formData.activeUntil).toISOString()
        });
      } else {
        await adminUpdateServices.createUpdate({
          ...formData,
          activeUntil: new Date(formData.activeUntil)
        });
      }
      
      // Navigate back to updates list
      navigate('/admin/updates');
    } catch (err) {
      console.error('Error saving update:', err);
      setError('Failed to save update. Please try again.');
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Update' : 'Create New Update'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* Content */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[200px]"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            HTML formatting is supported.
          </p>
        </div>
        
        {/* Type */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="news">News</option>
            <option value="announcement">Announcement</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>
        
        {/* Importance */}
        <div className="mb-4">
          <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
            Importance (0-10)
          </label>
          <div className="flex items-center">
            <input
              type="range"
              id="importance"
              name="importance"
              min="0"
              max="10"
              value={formData.importance}
              onChange={handleChange}
              className="w-full mr-4"
            />
            <span className="text-sm font-bold">{formData.importance}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Higher values will show the update more prominently.
          </p>
        </div>
        
        {/* Active Until */}
        <div className="mb-6">
          <label htmlFor="activeUntil" className="block text-sm font-medium text-gray-700 mb-1">
            Active Until
          </label>
          <input
            type="date"
            id="activeUntil"
            name="activeUntil"
            value={formData.activeUntil}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The update will not be shown to users after this date.
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/updates')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateForm;