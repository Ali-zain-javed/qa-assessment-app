import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import QuestionCard from "../components/QuestionCard";

export default function Assessment() {
  const { token, logout, user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listQuestions(token)
      .then(setQuestions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleOption(questionId, optionIndex, isMultiple) {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        const next = current.includes(optionIndex)
          ? current.filter((i) => i !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionIndex] };
    });
  }

  async function handleNext() {
    const isLast = currentIndex === questions.length - 1;
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        selected_options: answers[q.id] || [],
      }));
      const data = await api.submitAttempt(token, payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Centered>Loading assessment...</Centered>;
  }

  if (error && !result) {
    return <Centered>{error}</Centered>;
  }

  if (questions.length === 0) {
    return <Centered>No questions available yet. Check back later.</Centered>;
  }

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);
    return (
      <Centered>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-sm text-slate-400 mb-2">Assessment complete</p>
          <p className="text-5xl font-bold text-indigo-600 mb-2">{percent}%</p>
          <p className="text-slate-600 mb-6">
            You scored {result.score} out of {result.total}
          </p>
          <button
            onClick={logout}
            className="rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 px-6 hover:bg-indigo-700 transition"
          >
            Log out
          </button>
        </div>
      </Centered>
    );
  }

  const question = questions[currentIndex];
  const isMultiple = question.question_type === "multiple";
  const selected = answers[question.id] || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl flex justify-between items-center mb-4 text-sm text-slate-500">
        <span>Signed in as {user?.full_name}</span>
        <button onClick={logout} className="hover:text-slate-700 underline">
          Log out
        </button>
      </div>
      <QuestionCard
        question={question}
        index={currentIndex}
        total={questions.length}
        selected={selected}
        onToggleOption={(optionIndex) => toggleOption(question.id, optionIndex, isMultiple)}
        onNext={handleNext}
        isLast={currentIndex === questions.length - 1}
      />
      {submitting && <p className="mt-4 text-sm text-slate-400">Submitting...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-slate-600 text-center">
      {children}
    </div>
  );
}
