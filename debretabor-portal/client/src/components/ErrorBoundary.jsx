// components/ErrorBoundary.jsx
// Catches render-time errors so one broken component can't leave the visitor with a blank page.
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Something went wrong · የሆነ ችግር ተፈጥሯል</h1>
          <p className="mt-2 text-sm text-gray-600">Please reload the page. · እባክዎ ገጹን እንደገና ይጫኑ።</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#004280] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003366]"
          >
            Reload · እንደገና ጫን
          </button>
        </div>
      </div>
    );
  }
}
