"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFormPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Importing form structure...");

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(`Success! Form "${data.form.title}" added.`);
        // Wait 2 seconds, then go back to the dashboard
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Google Form</h1>
        <p className="text-gray-500 mb-6">Paste a public Google Form URL below to detect its questions and options.</p>

        <form onSubmit={handleAddForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Form URL</label>
            <input
              type="url"
              required
              placeholder="https://docs.google.com/forms/d/e/.../viewform"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? "Importing..." : "Import Form"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 rounded-lg bg-gray-100 text-sm font-medium text-gray-800">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}