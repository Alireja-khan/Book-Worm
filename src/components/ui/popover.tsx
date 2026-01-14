import React from 'react';

export default function Popover({
  label = 'Details',
  children
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details className="relative inline-block">
      <summary className="list-none cursor-pointer underline text-xs focus:outline-none" aria-haspopup="dialog">
        {label}
      </summary>
      <div
        role="dialog"
        aria-label={typeof label === 'string' ? label : 'Details'}
        className="absolute z-50 mt-2 w-64 max-w-xs p-2 bg-popover border rounded shadow-lg text-xs"
      >
        {children}
      </div>
      <style jsx>{`
        summary::-webkit-details-marker { display: none; }
        details[open] summary { text-decoration: none; }
      `}</style>
    </details>
  );
}
