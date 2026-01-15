import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';

export default function DiffViewer({ diffs }) {
  return (
    <div className="bg-white p-2 rounded shadow">
      {diffs.map((d) => (
        <div key={d.file} className="mb-4">
          <h3 className="font-bold">{d.file}</h3>
          <ReactDiffViewer
            oldValue={d.original}
            newValue={d.modified}
            splitView={true}
          />
        </div>
      ))}
    </div>
  );
}
