import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, createProject } from '../api/projects';
import InlineForm from '../components/InlineForm';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormErrors((err) => ({ ...err, [e.target.name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createProject(form);
      setProjects((prev) => [res.data, ...prev]);
      setForm({ name: '', description: '' });
      setFormOpen(false);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        data.errors.forEach((e) => { map[e.field] = e.message; });
        setFormErrors(map);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page"><p className="text-muted">Loading projects...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <InlineForm title="New Project" open={formOpen} onToggle={() => setFormOpen(!formOpen)}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Project name</label>
            <input name="name" value={form.name} onChange={handleChange} maxLength={100} />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label>Description <span className="text-muted">(optional)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create project'}
          </button>
        </form>
      </InlineForm>

      {projects.length === 0 ? (
        <p className="empty-state">No projects yet. Create one to get started.</p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="project-card card">
              <div className="project-card-name">{p.name}</div>
              {p.description && <p className="project-card-desc">{p.description}</p>}
              <div className="project-card-meta">
                <span>{p._count.members} member{p._count.members !== 1 ? 's' : ''}</span>
                <span>{p._count.tasks} task{p._count.tasks !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
