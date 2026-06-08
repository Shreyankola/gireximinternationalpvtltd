"use client";

import { useState, useEffect } from "react";
import { ContainerRecord } from "@/types";

interface ContainerModalProps {
  isOpen: boolean;
  record?: ContainerRecord | null;
  onSave: (data: { blNo: string; title: string; description: string; containerCount: string }) => void;
  onClose: () => void;
}

export default function ContainerModal({ isOpen, record, onSave, onClose }: ContainerModalProps) {
  const [blNo, setBlNo] = useState("");
  const [title, setTitle] = useState("");
  const [containerCount, setContainerCount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ blNo?: string; title?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setBlNo(record.blNo);
        setTitle(record.title);
        setContainerCount(record.containerCount);
        setDescription(record.description);
      } else {
        setBlNo("");
        setTitle("");
        setContainerCount("");
        setDescription("");
      }
      setErrors({});
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const validate = () => {
    const e: { blNo?: string; title?: string } = {};
    if (!blNo.trim()) e.blNo = "BL No. is required";
    if (!title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ blNo: blNo.trim(), title: title.trim(), description: description.trim(), containerCount: containerCount.trim() });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 sm:p-8 animate-modal-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? "Edit Container" : "New Container"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">BL No.</label>
            <input
              type="text"
              value={blNo}
              onChange={(e) => setBlNo(e.target.value)}
              placeholder="Enter Bill of Lading number"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.blNo
                  ? "border-red-300 focus:ring-red-200 bg-red-50"
                  : "border-gray-300 focus:ring-orange-200 focus:border-orange-400"
              }`}
            />
            {errors.blNo && <p className="mt-1 text-xs text-red-500">{errors.blNo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter container title"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.title
                  ? "border-red-300 focus:ring-red-200 bg-red-50"
                  : "border-gray-300 focus:ring-orange-200 focus:border-orange-400"
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. of Containers</label>
            <input
              type="text"
              value={containerCount}
              onChange={(e) => setContainerCount(e.target.value)}
              placeholder="Enter number of containers"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter container description"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 transition-colors shadow-sm"
            >
              {record ? "Save Updated Details" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
