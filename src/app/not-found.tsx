import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-950 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Looks like this page took a wrong turn. Let&apos;s get you back to the
          game!
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-200 text-blue-950 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300 ease-in-out text-lg font-semibold"
        >
          {"<"} Back to Home
        </Link>
      </div>
    </main>
  );
}
