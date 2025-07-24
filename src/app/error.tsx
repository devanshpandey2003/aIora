"use client";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">Something went wrong!</h1>
      <p className="mt-4 text-lg text-gray-700">
        We encountered an error while processing your request. Please try again
        later.
      </p>
    </div>
  );
};
