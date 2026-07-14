export default function QuestionCard({
  question,
  index,
  total,
  selected,
  onToggleOption,
  onNext,
  isLast,
}) {
  const isMultiple = question.question_type === "multiple";
  const canProceed = selected.length > 0;

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">
          Question {index + 1} of {total}
        </span>
        <span className="text-xs text-slate-400">
          {isMultiple ? "Select all that apply" : "Select one"}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-6">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const active = selected.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggleOption(i)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition ${
                active
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 mr-3 border text-xs ${
                  isMultiple ? "rounded-md" : "rounded-full"
                } ${
                  active
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 text-transparent"
                }`}
              >
                ✓
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className="mt-8 w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {isLast ? "Submit Assessment" : "Next Question"}
      </button>
    </div>
  );
}
