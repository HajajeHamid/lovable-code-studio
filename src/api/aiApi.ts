import axios from 'axios';

export const executeGoal = async (goal: string, userId: string, projectPath: string) => {
  const res = await axios.post('http://localhost:3333/ai/execute', { goal, userId, projectPath });
  return res.data;
};

export const voteDiff = async (file: string, approve: boolean, userId: string) => {
  return axios.post('http://localhost:3333/collaboration/vote', { file, approve, userId });
};
