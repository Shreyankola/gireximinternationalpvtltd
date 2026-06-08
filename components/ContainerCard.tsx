"use client";

import { ContainerRecord } from "@/types";
import Toast from "./Toast";
import { useState, useMemo } from "react";
import { PencilEdit02Icon } from "hugeicons-react";

interface ContainerCardProps {
  record: ContainerRecord;
  onEdit: (record: ContainerRecord) => void;
  onDelete: (id: string) => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ContainerCard({ record, onEdit, onDelete }: ContainerCardProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const trackLabel = useMemo(() => {
    const title = record.title.trim();
    if (!title) return "Track Container";
    return `Track ${title}`;
  }, [record.title]);

  const handleTrack = async () => {
    try {
      await navigator.clipboard.writeText(record.blNo);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = record.blNo;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setToast("BL Number copied. Paste it in Maersk Tracking.");
    window.open("https://www.maersk.com/tracking", "_blank", "noopener,noreferrer");
  };

  const handleDelete = () => {
    onDelete(record.id);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{record.title}</h3>
              <p className="text-sm text-gray-400 font-mono mt-0.5">BL No: {record.blNo}</p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {record.containerCount && (
            <p className="mt-2 text-sm text-gray-400 font-mono">
              Containers: {record.containerCount}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {record.description || "No description provided."}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {(() => { const d = Date.now() - record.createdAt; const m = Math.floor(d / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const dy = Math.floor(h / 24); if (dy < 30) return `${dy}d ago`; return `${Math.floor(dy / 30)}mo ago`; })()}
            </span>
            {record.updatedAt !== record.createdAt && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-[11px] text-orange-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                updated {(() => { const d = Date.now() - record.updatedAt; const m = Math.floor(d / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const dy = Math.floor(h / 24); if (dy < 30) return `${dy}d ago`; return `${Math.floor(dy / 30)}mo ago`; })()}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onEdit(record)}
              className="flex items-center justify-center px-1.5 py-1 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-100 transition-colors"
              title="Edit Info"
            >
              <PencilEdit02Icon className="w-5 h-5" />
            </button>
            <button
              onClick={handleTrack}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-300 hover:bg-orange-400 rounded-lg transition-colors"
            >
              {trackLabel}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Container?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </>
  );
}
