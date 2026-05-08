import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProject, addMember, removeMember } from '../api/projects';
import { createTask, deleteTask, updateTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import MemberRow from '../components/MemberRow';
import TaskRow from '../components/TaskRow';
import InlineForm from '../components/InlineForm';
import Badge from '../components/Badge';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');

  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [memberErrors, setMemberErrors] = useState({});
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [taskErrors, setTaskErrors] = useState({});
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  useEffect(() => {
    loadProject();
  }, [id]);

  function loadProject() {
    setLoading(true);
    getProject(id)
      .then((res) => setProject(res.data))
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }

  const currentUserRole = project?.currentUserRole;
  const isAdmin = currentUserRole === 'ADMIN';

  async function handleAddMember(e) {
    e.preventDefault();
    setMemberSubmitting(true);
    try {
      await addMember(id, memberForm);
      setMemberForm({ email: '', role: 'MEMBER' });
      setMemberFormOpen(false);
      loadProject();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        data.errors.forEach((e) => { map[e.field] = e.message; });
        setMemberErrors(map);
      } else {
        setMemberErrors({ email: data?.error || 'Failed to add member' });
      }
    } finally {
      setMemberSubmitting(false);
    }
  }

  async function handleRemoveMember(userId) {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await removeMember(id, userId);
      loadProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setTaskSubmitting(true);
    try {
      const payload = {
        ...taskForm,
        projectId: id,
        assigneeId: taskForm.assigneeId || null,
        dueDate: taskForm.dueDate || null,
      };
      const res = await createTask(payload);
      setProject((p) => ({ ...p, tasks: [res.data, ...p.tasks] }));
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      setTaskFormOpen(false);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        data.errors.forEach((e) => { map[e.field] = e.message; });
        setTaskErrors(map);
      }
    } finally {
      setTaskSubmitting(false);
    }
  }

  function handleTaskUpdated(updatedTask) {
    setProject((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    }));
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setProject((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  }

  if (loading) return <div className="page"><p className="text-muted">Loading project...</p></div>;
  if (error) return <div className="page"><div className="error-message">{error}</div></div>;
  if (!project) return null;

  const filteredTasks = (project.tasks || []).filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (assigneeFilter && String(t.assigneeId) !== assigneeFilter) return false;
    return true;
  });

  const memberOptions = (project.members || []).map((m) => ({ id: m.user.id, name: m.user.name }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="text-muted" style={{ marginTop: '4px' }}>{project.description}</p>}
        </div>
        <Badge type="role" value={currentUserRole} />
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Tasks</button>
        <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members ({project.members.length})</button>
      </div>

      {activeTab === 'members' && (
        <div>
          {isAdmin && (
            <InlineForm title="Add Member" open={memberFormOpen} onToggle={() => setMemberFormOpen(!memberFormOpen)}>
              <form onSubmit={handleAddMember} noValidate>
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => { setMemberForm((f) => ({ ...f, email: e.target.value })); setMemberErrors({}); }}
                  />
                  {memberErrors.email && <span className="field-error">{memberErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={memberForm.role} onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value }))}>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={memberSubmitting}>
                  {memberSubmitting ? 'Adding...' : 'Add member'}
                </button>
              </form>
            </InlineForm>
          )}

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {project.members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onRemove={handleRemoveMember}
                  canRemove={isAdmin && m.user.id !== user.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          {isAdmin && (
            <InlineForm title="New Task" open={taskFormOpen} onToggle={() => setTaskFormOpen(!taskFormOpen)}>
              <form onSubmit={handleCreateTask} noValidate>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={taskForm.title}
                    onChange={(e) => { setTaskForm((f) => ({ ...f, title: e.target.value })); setTaskErrors({}); }}
                    maxLength={200}
                  />
                  {taskErrors.title && <span className="field-error">{taskErrors.title}</span>}
                </div>
                <div className="form-group">
                  <label>Description <span className="text-muted">(optional)</span></label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="task-form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due date <span className="text-muted">(optional)</span></label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                    {taskErrors.dueDate && <span className="field-error">{taskErrors.dueDate}</span>}
                  </div>
                  <div className="form-group">
                    <label>Assignee <span className="text-muted">(optional)</span></label>
                    <select value={taskForm.assigneeId} onChange={(e) => setTaskForm((f) => ({ ...f, assigneeId: e.target.value }))}>
                      <option value="">Unassigned</option>
                      {memberOptions.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={taskSubmitting}>
                  {taskSubmitting ? 'Creating...' : 'Create task'}
                </button>
              </form>
            </InlineForm>
          )}

          <div className="filter-bar">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="">All assignees</option>
              {memberOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <p className="empty-state">No tasks match the current filters.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    currentUserRole={currentUserRole}
                    currentUserId={user.id}
                    onUpdated={handleTaskUpdated}
                    onDelete={handleDeleteTask}
                    showProject={false}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
