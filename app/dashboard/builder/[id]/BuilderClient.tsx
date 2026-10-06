"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuilderClient({ form }: { form: any }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [time, setTime] = useState("10:00");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const questions = form.structure as any[];

  const handleSave = async () => {
    setLoading(true);
    
    // Automatically detect the user's local timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          formTitle: form.title,
          answers: answers,
          time: time,
          timezone: userTimezone
        }),
      });

      if (res.ok) {
        alert("Automation saved successfully!");
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EBF8] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        
        <div className="bg-white p-8 rounded-xl border-t-8 border-t-[#673AB7] shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
          {form.description && <p className="mt-3 text-sm text-gray-600">{form.description}</p>}
        </div>

        {questions.map((q) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="text-base font-medium text-gray-900 mb-4 block">
              {q.title} {q.required && <span className="text-red-500">*</span>}
            </label>

            {(q.type === 0 || q.type === 1) && (
              <input
                type="text"
                className="w-full border-b border-gray-300 focus:border-[#673AB7] outline-none py-2 bg-transparent text-black"
                placeholder="Your answer"
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              />
            )}

            {(q.type === 2 || q.type === 3) && (
              <div className="space-y-3">
                {q.options.map((opt: string) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      className="h-4 w-4 text-[#673AB7]"
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 4 && (
              <div className="space-y-3">
                {q.options.map((opt: string) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={opt}
                      className="h-4 w-4 text-[#673AB7] rounded"
                      onChange={(e) => {
                        const current = answers[q.id] || [];
                        if (e.target.checked) {
                          setAnswers({ ...answers, [q.id]: [...current, opt] });
                        } else {
                          setAnswers({ ...answers, [q.id]: current.filter((item: string) => item !== opt) });
                        }
                      }}
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 7 && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th className="p-3 border-b border-gray-200"></th>
                      {q.options.map((opt: string) => (
                        <th key={opt} className="p-3 border-b border-gray-200 text-sm font-medium text-gray-700 text-center">
                          {opt}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {q.rows.map((row: any) => (
                      <tr key={row.rowId} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-b border-gray-100 text-sm font-medium text-gray-800">
                          {row.label}
                        </td>
                        {q.options.map((opt: string) => (
                          <td key={opt} className="p-3 border-b border-gray-100 text-center">
                            <input
                              type="radio"
                              name={`q-${row.rowId}`}
                              value={opt}
                              className="h-4 w-4 text-[#673AB7] cursor-pointer"
                              onChange={(e) => setAnswers({ ...answers, [row.rowId]: e.target.value })}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Daily Execution Time</h3>
            <p className="text-xs text-gray-500 mb-2">When should this form submit every day?</p>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-[#673AB7] outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto bg-[#673AB7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5E35B1] transition-colors disabled:bg-[#9b7cd4]"
          >
            {loading ? "Saving..." : "Save Automation"}
          </button>
        </div>

      </div>
    </div>
  );
}