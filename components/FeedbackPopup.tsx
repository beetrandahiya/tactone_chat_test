"use client";

import { useState } from "react";
import { X, Star, Send } from "lucide-react";

interface FeedbackPopupProps {
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  messageId: string;
}

export interface FeedbackData {
  messageId: string;
  ratings: {
    accuracy: number;
    clarity: number;
    helpfulness: number;
  };
  customFeedback: string;
}

const questions = [
  { key: "accuracy" as const, label: "How accurate were the directions?" },
  { key: "clarity" as const, label: "How clear were the instructions?" },
  { key: "helpfulness" as const, label: "How helpful was the response?" },
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className="p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
        >
          <Star
            className={`w-6 h-6 transition-colors duration-150 ${
              star <= (hover || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPopup({
  onClose,
  onSubmit,
  messageId,
}: FeedbackPopupProps) {
  const [ratings, setRatings] = useState({
    accuracy: 0,
    clarity: 0,
    helpfulness: 0,
  });
  const [customFeedback, setCustomFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const hasAnyRating = ratings.accuracy > 0 || ratings.clarity > 0 || ratings.helpfulness > 0;

  const handleSubmit = () => {
    if (!hasAnyRating) return;

    onSubmit({
      messageId,
      ratings,
      customFeedback: customFeedback.trim(),
    });
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };

  if (submitted) {
    return (
      <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-2xl shadow-soft animate-in fade-in duration-200">
        <p className="text-sm text-green-700 text-center font-medium">
          Thank you for your feedback! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-primary-100">
        <h3 className="text-sm font-semibold text-primary-800">
          Rate this response
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback"
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Questions */}
      <div className="px-4 py-3 space-y-3">
        {questions.map((q) => (
          <div key={q.key} className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-700 flex-1">{q.label}</label>
            <StarRating
              value={ratings[q.key]}
              onChange={(val) =>
                setRatings((prev) => ({ ...prev, [q.key]: val }))
              }
            />
          </div>
        ))}

        {/* Custom input */}
        <div className="pt-2 border-t border-gray-100">
          <label
            htmlFor="custom-feedback"
            className="text-sm text-gray-700 block mb-1.5"
          >
            Anything else you&apos;d like to share? (optional)
          </label>
          <textarea
            id="custom-feedback"
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            placeholder="Your feedback helps us improve..."
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       resize-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasAnyRating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 
                     disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full 
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Send className="w-4 h-4" />
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
