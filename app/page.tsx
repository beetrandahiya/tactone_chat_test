import ChatInterface from "@/components/ChatInterface";
import { Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <nav
          className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                TACTONE
              </h1>
              <p className="text-xs text-gray-500">Floor 5 Navigator</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span
                className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"
                aria-hidden="true"
              ></span>
              Online
            </span>
          </div>
        </nav>
      </header>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}
