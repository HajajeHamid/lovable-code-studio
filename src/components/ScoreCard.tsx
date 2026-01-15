import React from 'react';

export default function ScoreCard({ score }) {
  if (!score) return null;
  return (
    <div className="bg-white p-2 rounded shadow">
      <h3 className="font-bold mb-2">Scoring Multidimensionnel</h3>
      <ul>
        {Object.entries(score).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {value}</li>
        ))}
      </ul>
    </div>
  );
}
