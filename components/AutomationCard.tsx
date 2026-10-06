"use client";

import React, { useState } from "react";
import { Trash2, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AutomationCardProps {
  automation: {
    id: string;
    name: string;
    cronExpression: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    form: {
      title: string;
      originalUrl: string;
    };
  };
}

export default function AutomationCard({ automation }: AutomationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/automations/${automation.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShowConfirm(false);
        router.refresh(); // Tells Next.js to safely refresh the server data
      } else {
        alert("Failed to delete automation.");
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting automation.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full animate-pulse">
            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" /> Running
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
            {automation.name || "Untitled Automation"}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{automation.form?.title || "Google Form"}</p>
        </div>
        {getStatusBadge(automation.status)}
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-6 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{new Date(automation.cronExpression).toLocaleString()}</span>
        </div>
        <a
          href={automation.form?.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-600 hover:underline font-medium ml-auto"
        >
          View Form <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
        <span className="text-xs text-slate-400 font-mono">ID: {automation.id.slice(-8)}</span>
        
        {showConfirm ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Confirm Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}