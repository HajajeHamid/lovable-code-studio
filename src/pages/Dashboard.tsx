import React, { useState } from 'react';
import ChatBox from '../components/ChatBox';
import DiffViewer from '../components/DiffViewer';
import ScoreCard from '../components/ScoreCard';
import AuditTrail from '../components/AuditTrail';
import VoteButtons from '../components/VoteButtons';
import { executeGoal } from '../api/aiApi';

export default function Dashboard() {
  const [goal, setGoal] = useState('');
  const [diffs, setDiffs] = useState([]);
  const [score, setScore] = useState(null);
  const [audit, setAudit] = useState([]);

  const handleSubmit = async () => {
    const res = await executeGoal(goal, 'user1');
    setDiffs(res.diffs);
    setScore(res.score);
    setAudit(res.audit);
  };

  return (
    <div className="p-4 space-y-6">
      <ChatBox goal={goal} setGoal={setGoal} onSubmit={handleSubmit} />
      <DiffViewer diffs={diffs} />
      <VoteButtons diffs={diffs} />
      <ScoreCard score={score} />
      <AuditTrail audit={audit} />
    </div>
  );
}
