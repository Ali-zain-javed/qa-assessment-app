import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const emptyForm = {
  text: "",
  options: ["", "", "", ""],
  correct_options: [],
  question_type: "single",
};

export default function AdminDashboard() {
  const { token, logout, user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function loadQuestions() {
    setLoading(true);
    api
      .adminListQuestions(token)
      .then(setQuestions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadQuestions, [token]);

  function updateOption(i, value) {
    setForm((f) => {
      const options = [...f.options];
      options[i] = value;
      return { ...f, options };
    });
  }

  function toggleCorrect(i) {
    setForm((f) => {
      if (f.question_type === "single") {
        return { ...f, correct_options: [i] };
      }
      const next = f.correct_options.includes(i)
        ? f.correct_options.filter((x) => x !== i)
        : [...f.correct_options, i];
      return { ...f, correct_options: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const options = form.options.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) {
      setError("Provide at least 2 options.");
      return;
    }
    if (form.correct_options.length === 0) {
      setError("Select at least one correct answer.");
      return;
    }
    setSubmitting(true);
    try {
      await api.adminCreateQuestion(token, {
        text: form.text.trim(),
        options,
        correct_options: form.correct_options,
        question_type: form.question_type,
      });
      setForm(emptyForm);
      loadQuestions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.adminDeleteQuestion(token, id);
      loadQuestions();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Signed in as {user?.full_name}</p>
          </div>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700 underline">
            Log out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Add a question</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question text</label>
            <textarea
              required
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Answer type</label>
            <select
              value={form.question_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, question_type: e.target.value, correct_options: [] }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="single">Single choice</option>
              <option value="multiple">Multiple choice</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Options (check the correct answer{form.question_type === "multiple" ? "s" : ""})
            </label>
            {form.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type={form.question_type === "multiple" ? "checkbox" : "radio"}
                  name="correct"
                  checked={form.correct_options.includes(i)}
                  onChange={() => toggleCorrect(i)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <input
                  type="text"
                  value={option}
                  placeholder={`Option ${i + 1}`}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 px-6 hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {submitting ? "Adding..." : "Add question"}
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Questions ({questions.length})
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-slate-500">No questions yet.</p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q) => (
                <li key={q.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{q.text}</p>
                      <ul className="mt-2 text-sm text-slate-600 space-y-0.5">
                        {q.options.map((opt, i) => (
                          <li key={i} className={q.correct_options.includes(i) ? "text-emerald-600 font-medium" : ""}>
                            {q.correct_options.includes(i) ? "✓ " : "• "}
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-sm text-red-500 hover:text-red-700 shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
