import React from 'react';
import { voteDiff } from '../api/aiApi';

export default function VoteButtons({ diffs }) {
  const handleVote = (file, approve) => {
    voteDiff(file, approve, 'user1');
  };

  return (
    <div className="flex space-x-2 flex-wrap">
      {diffs.map(d => (
        <div key={d.file} className="flex items-center space-x-1 p-1 border rounded m-1">
          <span className="font-medium">{d.file}</span>
          <button className="bg-green-500 text-white px-2 rounded" onClick={() => handleVote(d.file, true)}>Approve</button>
          <button className="bg-red-500 text-white px-2 rounded" onClick={() => handleVote(d.file, false)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
