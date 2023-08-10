import React from "react";

export function Header({
  error,
  onNew,
  showNew,
}: {
  error: string | null;
  onNew: () => void;
  showNew: boolean;
}) {
  return (
    <div className="w-full">
      {error !== null && (
        <div className="bg-red-600 text-white font-bold p-4">
          <div className="flex place-items-center">
            <div className="flex-1 mr-2">Error: {error}</div>
            <div>
              <button
                className="px-4 py-2 bg-white hover:bg-red-100 text-red-600 rounded-md"
                onClick={onNew}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      {error === null && showNew && (
        <div className="absolute p-4 z-10">
          <button
            className="px-4 py-2 bg-blue-300 hover:bg-blue-400 active:bg-blue-500 text-white rounded-md drop-shadow-lg"
            onClick={onNew}
          >
            New chat
          </button>
        </div>
      )}
    </div>
  );
}
