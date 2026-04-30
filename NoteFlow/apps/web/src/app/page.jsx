import React from "react";
import {
  ChevronRight,
  Zap,
  Shield,
  Layout as LayoutIcon,
  Github,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
            N
          </div>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">
            NoteFlow
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/notes"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Product
          </a>
          <a
            href="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Pricing
          </a>
          <a
            href="/notes"
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Go to App
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5 mb-8">
          <Zap size={14} />
          Now with AI-powered organization
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 tracking-tight mb-6">
          Think clearly.
          <br />
          Write faster.
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl">
          The high-fidelity workspace for your thoughts. Organize your ideas
          with a clean, ghost-structured interface designed for focus.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/notes"
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            Start Writing Free <ChevronRight size={18} />
          </a>
          <a
            href="#"
            className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <Github size={18} /> View on GitHub
          </a>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-gray-50 py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <LayoutIcon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ghost Structure
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Minimalist design that stays out of your way. Focus on content,
                not clutter.
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 inline-flex items-center">
                  <span className="text-gray-400 mr-2">-</span> 1px ghost
                  borders
                </li>
                <li className="text-sm text-gray-600 inline-flex items-center">
                  <span className="text-gray-400 mr-2">-</span> High-contrast
                  type
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                End-to-End Secure
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Your data is yours. We use enterprise-grade encryption for all
                your notes.
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 inline-flex items-center">
                  <span className="text-gray-400 mr-2">-</span> AES-256
                  Encryption
                </li>
                <li className="text-sm text-gray-600 inline-flex items-center">
                  <span className="text-gray-400 mr-2">-</span> SOC2 Compliant
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Blazing Fast
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Instant sync across all your devices. No loading spinners, just
                speed.
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 inline-flex items-center">
                  <span className="text-gray-400 mr-2">-</span> Under 100ms
                  latency
                </li>
                <li className="text-sm text-gray-600 inline-flex items-center">
                  <span className="text-gray-400 mr-2">-</span> Offline support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            N
          </div>
          <span className="text-base font-semibold text-gray-900 tracking-tight">
            NoteFlow
          </span>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          &copy; 2026 NoteFlow Inc. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
