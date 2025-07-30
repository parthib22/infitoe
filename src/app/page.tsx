"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <header className="text-center mb-8">
        <h1 className="text-7xl text-blue-950 font-bold mb-4">infitoe</h1>
        <p className="text-lg text-gray-700 max-w-md mx-auto px-4">
          We fixed tic-tac-toe. No more boring ties, just pure strategy.
        </p>
      </header>

      <nav>
        <button
          onClick={() => router.push("/play")}
          className="px-6 py-3 bg-blue-200 text-blue-950 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300 ease-in-out cursor-pointer text-lg font-semibold"
          aria-label="Start playing infitoe game"
        >
          Start {`>`}
        </button>
      </nav>

      <section className="invisible mt-12 max-w-2xl mx-auto px-4 text-center text-xs">
        <h2 className="text-sm font-semibold text-blue-950 mb-4">
          Why infitoe?
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">Infinite Possibilities</h3>
            <p>
              Unlike traditional tic-tac-toe, infitoe offers endless gameplay
              with no draws.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Strategic Depth</h3>
            <p>
              Every move matters in this evolved version of the classic game.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
