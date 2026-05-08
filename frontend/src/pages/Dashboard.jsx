import { useState, useEffect } from 'react';
import { getDashboard } from '../api/dashboard';
import StatCard from '../components/StatCard';
import StatusBar from '../components/StatusBar';
import './Dashboard.css';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="text-muted">Loading dashboard...</p></div>;
  if (error) return <div className="page"><div className="error-message">{error}</div></div>;

  const { totalProjects, totalTasks, tasksByStatus, overdueTasks, recentTasks } = data;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stat-grid">
        <StatCard label="Projects" value={totalProjects} accent="var(--color-primary)" />
        <StatCard label="Total Tasks" value={totalTasks} accent="var(--color-accent)" />
        <StatCard label="Done" value={tasksByStatus.done} accent="#6bcf7f" />
        <StatCard label="Overdue" value={overdueTasks.length} accent="#c0392b" />
      </div>

      <div className="card dashboard-section">
        <h2 className="section-title">Task Status Breakdown</h2>
        <StatusBar
          todo={tasksByStatus.todo}
          inProgress={tasksByStatus.in_progress}
          done={tasksByStatus.done}
        />
      </div>

      <div className="dashboard-split">
        <div className="card dashboard-section">
          <h2 className="section-title">Overdue Tasks</h2>
          {overdueTasks.length === 0 ? (
            <p className="empty-state">No overdue tasks</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td className="text-muted">{task.project?.name}</td>
                    <td style={{ color: '#c0392b' }}>{formatDate(task.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card dashboard-section">
          <h2 className="section-title">Recently Assigned to Me</h2>
          {recentTasks.length === 0 ? (
            <p className="empty-state">No tasks assigned to you</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td className="text-muted">{task.project?.name}</td>
                    <td>{task.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
