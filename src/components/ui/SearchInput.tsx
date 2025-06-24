import React, { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  loading?: boolean;
}

export function SearchInput({ onClear, loading = false, className = '', value, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type="text"
        value={value || ''}
        className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
      {(value || loading) && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600" />
          ) : (
            onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}