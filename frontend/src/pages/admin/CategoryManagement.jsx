import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    // Drag-and-drop state
    const [draggingId, setDraggingId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const dragNodeRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await adminAPI.getCategories();
            setCategories(res.data.data);
        } catch {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setSaving(true);
        try {
            const res = await adminAPI.createCategory(formData);
            setCategories((prev) => [...prev, res.data.data]);
            setFormData({ name: '', description: '' });
            setShowForm(false);
            toast.success('Category created!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category? Products with this category will not be deleted.')) return;
        try {
            await adminAPI.deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            toast.success('Category deleted');
        } catch {
            toast.error('Failed to delete category');
        }
    };

    // ── Drag handlers ──────────────────────────────────────────────
    const handleDragStart = (e, id) => {
        setDraggingId(id);
        dragNodeRef.current = e.target;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e, id) => {
        e.preventDefault();
        if (id !== draggingId) setDragOverId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetId) => {
        e.preventDefault();
        if (!draggingId || draggingId === targetId) {
            setDraggingId(null);
            setDragOverId(null);
            return;
        }

        const updated = [...categories];
        const fromIdx = updated.findIndex((c) => c.id === draggingId);
        const toIdx = updated.findIndex((c) => c.id === targetId);
        const [moved] = updated.splice(fromIdx, 1);
        updated.splice(toIdx, 0, moved);

        setCategories(updated);
        setDraggingId(null);
        setDragOverId(null);

        try {
            await adminAPI.reorderCategories(updated.map((c) => c.id));
            toast.success('Order saved');
        } catch {
            toast.error('Failed to save order');
            fetchCategories(); // revert
        }
    };

    const handleDragEnd = () => {
        setDraggingId(null);
        setDragOverId(null);
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-500 mt-1">Drag rows to reorder · categories appear as a dropdown when adding products</p>
                    </div>
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="btn-primary"
                    >
                        {showForm ? '✕ Cancel' : '+ Add Category'}
                    </button>
                </div>

                {/* Create form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="bg-white rounded-xl shadow-md p-6 mb-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">New Category</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="e.g. Electronics"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Optional short description"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary disabled:opacity-60"
                                    >
                                        {saving ? 'Creating…' : 'Create Category'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setFormData({ name: '', description: '' }); }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category list */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-16 rounded-xl" />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-5xl mb-4">🏷️</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No categories yet</h3>
                        <p className="text-gray-500">Click "+ Add Category" to create your first one.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        {/* Table head */}
                        <div className="grid grid-cols-[2rem_1fr_2fr_6rem] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                            <span></span>
                            <span>Name</span>
                            <span>Description</span>
                            <span className="text-right">Actions</span>
                        </div>

                        {/* Rows */}
                        <div>
                            {categories.map((cat) => (
                                <motion.div
                                    key={cat.id}
                                    layout
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, cat.id)}
                                    onDragEnter={(e) => handleDragEnter(e, cat.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, cat.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`grid grid-cols-[2rem_1fr_2fr_6rem] gap-4 px-6 py-4 border-b border-gray-100 items-center cursor-grab active:cursor-grabbing transition-colors
                                        ${draggingId === cat.id ? 'opacity-40 bg-primary-50' : ''}
                                        ${dragOverId === cat.id && draggingId !== cat.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''}
                                        hover:bg-gray-50
                                    `}
                                >
                                    {/* Drag handle icon */}
                                    <span className="text-gray-300 select-none text-lg leading-none" title="Drag to reorder">
                                        ⠿
                                    </span>

                                    {/* Name */}
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-700 font-bold text-sm">
                                            {cat.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="font-semibold text-gray-900">{cat.name}</span>
                                    </div>

                                    {/* Description */}
                                    <span className="text-gray-500 text-sm truncate">
                                        {cat.description || <span className="italic text-gray-300">No description</span>}
                                    </span>

                                    {/* Delete */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="px-6 py-3 bg-gray-50 text-xs text-gray-400">
                            {categories.length} {categories.length === 1 ? 'category' : 'categories'} · drag rows to reorder
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};
