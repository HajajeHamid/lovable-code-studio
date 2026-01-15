import React from 'react';

export default function AuditTrail({ audit }) {
  return (
    <div className="bg-white p-2 rounded shadow">
      <h3 className="font-bold mb-2">Audit Trail</h3>
      <ul>
        {audit.map((a, i) => (
          <li key={i}>
            [{new Date(a.timestamp).toLocaleTimeString()}] {a.userId}: {a.action}
          </li>
        ))}
      </ul>
    </div>
  );
}
