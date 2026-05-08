import { useState, useEffect } from 'react';
import { getMyTasks, updateTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import './MyTasks.css';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTasks()
      .then((res) => setTasks(res.data))
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(taskId, newStatus) {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch {
      setError('Failed to update task status');
    }
  }

  if (loading) return <div className="page"><p className="text-muted">Loading tasks...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks assigned to you.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'overdue-row' : ''}>
                <td>{task.title}</td>
                <td className="text-muted">{task.project?.name || '-'}</td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    style={{ width: 'auto', minWidth: '120px' }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td><Badge type="priority" value={task.priority} /></td>
                <td className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'overdue-date' : ''}>
                  {formatDate(task.dueDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
