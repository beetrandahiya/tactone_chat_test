import Link from "next/link";
import { Navigation, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
        <Navigation className="w-9 h-9 text-primary-600" />
      </div>

      <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        Looks like you took a wrong turn! This page doesn&apos;t exist in the building.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Navigator
      </Link>
    </div>
  );
}
