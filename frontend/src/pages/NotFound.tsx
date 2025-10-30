import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="p-8 md:w-1/2 flex flex-col items-start justify-center">
            <h1 className="text-6xl font-extrabold text-green-700 leading-none">404</h1>
            <h2 className="mt-3 text-2xl font-semibold text-gray-800">Page not found</h2>
            <p className="mt-3 text-gray-600">
              The page you're looking for doesn't exist or was moved. Check the URL or try one of the actions below.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-block px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
              >
                Go to Home
              </Link>

              <Link
                to="/login"
                className="inline-block px-5 py-2 rounded-lg border border-green-600 text-green-600 font-medium hover:bg-green-50 transition"
              >
                Sign in to search
              </Link>

              <Link
                to="/pharmacy-dashboard"
                className="inline-block px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
              >
                Pharmacy dashboard
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-tr from-green-50 to-white p-8">
            {/* Simple decorative SVG illustration */}
            <svg
              viewBox="0 0 600 400"
              className="w-full h-64 max-h-72"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#10B981" stopOpacity="0.12" />
                  <stop offset="1" stopColor="#34D399" stopOpacity="0.06" />
                </linearGradient>
              </defs>
              <rect rx="24" width="100%" height="100%" fill="url(#g)" />
              <g transform="translate(60,40)" fill="none" stroke="#10B981" strokeWidth="3">
                <rect x="20" y="12" width="320" height="220" rx="14" strokeOpacity="0.18" />
                <path d="M40 70c40-24 120-24 160 0s120 24 160 0" strokeOpacity="0.12" />
                <circle cx="60" cy="160" r="20" strokeOpacity="0.14" />
                <circle cx="140" cy="120" r="18" strokeOpacity="0.14" />
                <circle cx="220" cy="150" r="12" strokeOpacity="0.14" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}