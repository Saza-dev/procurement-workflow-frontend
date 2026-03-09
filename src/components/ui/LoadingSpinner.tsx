export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="animate-spin h-4 w-4 border-t-2 rounded-full border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
}
