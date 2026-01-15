import React from 'react';

export default function ChatBox({ goal, setGoal, onSubmit }) {
  return (
    <div className="flex space-x-2">
      <input
        type="text"
        className="flex-1 border p-2 rounded"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Entrez votre objectif"
      />
      <button
        className="bg-blue-600 text-white px-4 rounded"
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
}
