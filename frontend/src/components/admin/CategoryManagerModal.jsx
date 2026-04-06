import React, { useState, useEffect } from "react";
import { X, Edit2, Trash2, Plus } from "lucide-react";

export function CategoryManagerModal({
  open,
  onOpenChange,
  categories = [],
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNewName("");
      setEditingId(null);
      setEditName("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ name: newName.trim() });
      setNewName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onUpdate(editingId, { name: editName.trim() });
      setEditingId(null);
      setEditName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    setSubmitting(true);
    setError(null);
    try {
      await onDelete(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sea-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-sea-800">Quản lý danh mục</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sea-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Thêm danh mục mới */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError(null);
              }}
              placeholder="Tên danh mục mới..."
              className="flex-1 px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Danh sách */}
          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-center text-sea-400 text-sm py-4">
                Chưa có danh mục nào
              </p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-3 bg-sea-50 rounded-lg"
              >
                {editingId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setError(null);
                      }}
                      className="flex-1 px-2 py-1.5 border border-sea-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={submitting}
                      className="px-3 py-1.5 bg-sea-500 text-white rounded text-sm hover:bg-sea-600 disabled:opacity-50"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-sea-100 text-sea-600 rounded text-sm hover:bg-sea-200"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-sea-800">
                      {cat.name}
                    </span>
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 hover:bg-sea-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-sea-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 hover:bg-crimson-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-crimson-500" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sea-100">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagerModal;
