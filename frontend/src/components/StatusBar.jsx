import './StatusBar.css';

export default function StatusBar({ todo, inProgress, done }) {
  const total = todo + inProgress + done;
  if (total === 0) {
    return <div className="status-bar-empty">No tasks yet</div>;
  }

  const todoPct = (todo / total) * 100;
  const inProgressPct = (inProgress / total) * 100;
  const donePct = (done / total) * 100;

  return (
    <div>
      <div className="status-bar">
        {todoPct > 0 && (
          <div
            className="status-segment segment-todo"
            style={{ width: `${todoPct}%` }}
            title={`To Do: ${todo}`}
          />
        )}
        {inProgressPct > 0 && (
          <div
            className="status-segment segment-in-progress"
            style={{ width: `${inProgressPct}%` }}
            title={`In Progress: ${inProgress}`}
          />
        )}
        {donePct > 0 && (
          <div
            className="status-segment segment-done"
            style={{ width: `${donePct}%` }}
            title={`Done: ${done}`}
          />
        )}
      </div>
      <div className="status-bar-legend">
        <span className="legend-item"><span className="legend-dot dot-todo" />To Do ({todo})</span>
        <span className="legend-item"><span className="legend-dot dot-in-progress" />In Progress ({inProgress})</span>
        <span className="legend-item"><span className="legend-dot dot-done" />Done ({done})</span>
      </div>
    </div>
  );
}
