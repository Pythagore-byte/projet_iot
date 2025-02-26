'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Error {
  id: number;
  device: string;
  error: string;
  handled: boolean;
  recorded_at: string;
}

async function getErrors() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/errors`);
  return res.data;
}

async function toggleError(id: number) {
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/errors/${id}/toggle`);
  return res.data;
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchErrors();
  }, []); 

  async function fetchErrors() {
    try {
      const data = await getErrors();
      setErrors(data);
    } finally {
      setIsLoading(false);
    }
  }

  const unhandledErrors = errors.filter(error => !error.handled);
  const handledErrors = errors.filter(error => error.handled);

  async function handleToggle(error: Error) {
    try {
      setErrors(currentErrors => 
        currentErrors.map(err => 
          err.id === error.id ? { ...err, handled: !err.handled } : err
        )
      );

      const updatedError = await toggleError(error.id);

      setErrors(currentErrors => 
        currentErrors.map(err => 
          err.id === updatedError.id ? updatedError : err
        )
      );
    } catch (error) {
      console.error('Failed to toggle error:', error);
      await fetchErrors();
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">System Errors</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-3 text-red-600">Active Errors</h2>
          <ErrorTable errors={unhandledErrors} onToggle={handleToggle} />
        </div>

        {handledErrors.length > 0 && (
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-green-600">Resolved Errors</h2>
            <ErrorTable errors={handledErrors} onToggle={handleToggle} />
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorTable({ errors, onToggle }: { errors: Error[], onToggle: (error: Error) => Promise<void> }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full min-w-[400px] divide-y divide-gray-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-3 text-left text-sm font-medium text-gray-700 w-[120px] sm:w-[180px]">Device</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">Error</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell w-[160px]">Date</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700 w-[120px] sm:w-[160px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {errors.map((error) => (
            <tr key={error.id}>
              <td className="p-3 text-sm text-gray-900 whitespace-nowrap">{error.device}</td>
              <td className="p-3 text-sm text-gray-900 whitespace-pre-wrap break-words">
                <div className="flex flex-col">
                  <span>{error.error}</span>
                  <span className="text-xs text-gray-500 sm:hidden mt-1">
                    {new Date(error.recorded_at).toLocaleString()}
                  </span>
                </div>
              </td>
              <td className="p-3 text-sm text-gray-900 whitespace-nowrap hidden sm:table-cell">
                {new Date(error.recorded_at).toLocaleString()}
              </td>
              <td className="p-3 text-sm whitespace-nowrap">
                <button 
                  onClick={() => onToggle(error)}
                  className={`w-full text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md font-medium transition-colors ${
                    error.handled 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {error.handled ? 'Unmark' : 'Resolve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}