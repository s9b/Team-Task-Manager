import Badge from './Badge';
import { updateTask } from '../api/tasks';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskRow({ task, currentUserRole, currentUserId, onUpdated, onDelete, showProject }) {
  const canChangeStatus =
    currentUserRole === 'ADMIN' ||
    (currentUserRole === 'MEMBER' && task.assigneeId === currentUserId);

  const canDelete = currentUserRole === 'ADMIN';

  async function handleStatusChange(e) {
    try {
      const res = await updateTask(task.id, { status: e.target.value });
      onUpdated(res.data);
    } catch {
      // revert handled by re-render
    }
  }

  return (
    <tr>
      <td>{task.title}</td>
      {showProject && <td className="text-muted">{task.project?.name || '-'}</td>}
      <td>{task.assignee ? task.assignee.name : <span className="text-muted">Unassigned</span>}</td>
      <td><Badge type="priority" value={task.priority} /></td>
      <td>
        {canChangeStatus ? (
          <select value={task.status} onChange={handleStatusChange} style={{ width: 'auto', minWidth: '120px' }}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        ) : (
          <Badge type="status" value={task.status} />
        )}
      </td>
      <td>{formatDate(task.dueDate)}</td>
      <td>
        {canDelete && (
          <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => onDelete(task.id)}>
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
