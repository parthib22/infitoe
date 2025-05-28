"use client"
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className='text-7xl text-blue-950 font-bold mb-4'>infitoe</h1>

        <button
          onClick={() => router.push("/play")}
          className="px-4 py-2 bg-blue-200 text-blue-950 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
        >
          Start {`>`}
        </button>
      </div>
    </>
  );
}