"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, FileText, Check } from "lucide-react";

const TERMS_ACCEPTED_KEY = "tactone_terms_accepted";
const TERMS_VERSION = "2026-02"; // Update this when terms change

interface TermsAcceptProps {
  children: React.ReactNode;
}

export default function TermsAccept({ children }: TermsAcceptProps) {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  useEffect(() => {
    // Check if user has already accepted terms
    const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (accepted === TERMS_VERSION) {
      setHasAccepted(true);
    } else {
      setHasAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, TERMS_VERSION);
    setHasAccepted(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setIsScrolledToBottom(isAtBottom);
  };

  // Show nothing while checking localStorage (prevents flash)
  if (hasAccepted === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show the app if terms are accepted
  if (hasAccepted) {
    return <>{children}</>;
  }

  // Show terms acceptance screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Welcome to TACTONE</h1>
              <p className="text-sm text-gray-500">HSLU Building Information Chatbot</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Before using the chatbot, please review and accept our Terms and Conditions and
            Privacy Policy.
          </p>
        </div>

        {/* Scrollable Terms Summary */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• This is an experimental student/research project</li>
              <li>• This is NOT an official HSLU service</li>
              <li>• Information may be inaccurate or outdated</li>
              <li>• Do not use for emergencies or critical decisions</li>
            </ul>
          </div>

          {/* Key Terms Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Key Points</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gray-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">No Guarantee of Accuracy</p>
                  <p className="text-sm text-gray-600">
                    The Chatbot may provide incorrect or misleading information. Always verify
                    with official HSLU sources.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gray-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Data Collection</p>
                  <p className="text-sm text-gray-600">
                    We log your questions and timestamps for research and improvement purposes.
                    No personal identification is collected.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gray-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Use at Your Own Risk</p>
                  <p className="text-sm text-gray-600">
                    The operator is not liable for any loss or damage arising from use of the Chatbot.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gray-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Age Requirement</p>
                  <p className="text-sm text-gray-600">
                    You must be at least 18 years old or have parental permission to use this service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Links to Full Documents */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">Read the full documents:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/terms"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Terms and Conditions
              </Link>
              <Link
                href="/privacy"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          {!isScrolledToBottom && (
            <div className="text-center text-sm text-gray-400 animate-bounce">
              ↓ Scroll to continue
            </div>
          )}
        </div>

        {/* Footer with Accept Button */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleAccept}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            I Accept the Terms and Privacy Policy
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            By clicking accept, you confirm you have read and agree to our Terms and Conditions
            and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
