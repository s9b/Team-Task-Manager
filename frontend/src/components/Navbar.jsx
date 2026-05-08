import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">Team Task Manager</span>
        <nav className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Projects</NavLink>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Tasks</NavLink>
        </nav>
        <div className="navbar-user">
          <span className="navbar-username">{user.name}</span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}
