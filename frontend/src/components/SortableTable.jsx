import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const SortableTable = ({
  columns = [],
  data = [],
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = 'No data available',
  isLoading = false
}) => {
  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return;
    const isCurrent = sortBy === col.key;
    const nextOrder = isCurrent && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(col.key, nextOrder);
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700/80 uppercase text-xs tracking-wider font-semibold">
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              return (
                <th
                  key={col.key || col.header}
                  onClick={() => handleHeaderClick(col)}
                  className={`px-6 py-4 whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p>Loading table data...</p>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic font-normal">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-slate-800/40 transition-colors duration-150 group"
              >
                {columns.map((col) => (
                  <td key={col.key || col.header} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
