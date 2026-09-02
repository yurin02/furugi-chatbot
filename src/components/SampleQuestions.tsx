import { Sparkles } from 'lucide-react';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';

type SampleQuestionsProps = {
  onSelect: (question: string) => void;
  disabled: boolean;
};

function SampleQuestions({ onSelect, disabled }: SampleQuestionsProps) {
  return (
    <div className="mt-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-sky-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <Sparkles className="h-3.5 w-3.5" />
        <span>こんな質問はいかがですか？</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SAMPLE_QUESTIONS.map((question) => (
          <button
            key={question}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:shadow-amber-200/40 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SampleQuestions;
