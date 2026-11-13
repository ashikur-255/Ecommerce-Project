import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiTag } from "react-icons/fi";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { categoryService } from "../services/api";
import Button from "../components/ui/Button";
import { getImageUrl } from "../utils/image";
import type { Category } from "../types";

const EMPTY_FORM = {
  name: "",
  description: "",
  imageFile: null as File | null,
  isActive: true,
  displayOrder: 0,
  removeImage: false,
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll(true);
      setCategories(res.data.data);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (c: Category) => {
    setForm({
      name: c.name,
      description: c.description ?? "",
      imageFile: null,
      isActive: c.isActive,
      displayOrder: c.displayOrder,
      removeImage: false,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, {
          name: form.name.trim(),
          description: form.description.trim(),
          imageFile: form.imageFile,
          isActive: form.isActive,
          displayOrder: form.displayOrder,
          removeImage: form.removeImage,
        });
        toast.success("Category updated.");
      } else {
        await categoryService.create({
          name: form.name.trim(),
          description: form.description.trim(),
          imageFile: form.imageFile,
          isActive: form.isActive,
          displayOrder: form.displayOrder,
        });
        toast.success("Category created.");
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    const result = await Swal.fire({
      title: `Delete "${c.name}"?`,
      text:
        c.productCount > 0
          ? `This category has ${c.productCount} product(s) assigned. Reassign or remove them first.`
          : "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;

    try {
      await categoryService.delete(c.id);
      toast.success("Category deleted.");
      loadCategories();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to delete category.");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="relative max-w-md w-full">
          <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <Button onClick={openCreateForm}>
          <FiPlus className="mr-2" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-light text-left text-gray-500 font-semibold">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Loading categories...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img
                            src={getImageUrl(c.image)}
                            alt={c.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                            <FiTag />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-dark">{c.name}</h3>
                          {c.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                              {c.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{c.slug}</td>
                    <td className="px-4 py-4 text-gray-600">{c.productCount}</td>
                    <td className="px-4 py-4 text-gray-600">{c.displayOrder}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditForm(c)}
                        className="p-2 text-gray-400 hover:text-primary transition"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-dark text-lg">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-dark">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="accent-primary w-4 h-4"
                    />
                    Active (visible on site)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                />
                {form.imageFile && (
                  <img
                    src={URL.createObjectURL(form.imageFile)}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 mt-3"
                  />
                )}
                {editingId && !form.imageFile && (
                  <label className="flex items-center gap-2 text-sm mt-3 cursor-pointer text-gray-500">
                    <input
                      type="checkbox"
                      checked={form.removeImage}
                      onChange={(e) => setForm((f) => ({ ...f, removeImage: e.target.checked }))}
                      className="accent-primary w-4 h-4"
                    />
                    Remove current image
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving} className="flex-1">
                  {editingId ? "Update Category" : "Create Category"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}