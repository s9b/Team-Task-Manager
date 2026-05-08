import './InlineForm.css';

export default function InlineForm({ title, open, onToggle, children }) {
  return (
    <div className="inline-form-container">
      <button className="btn-secondary" onClick={onToggle}>
        {open ? 'Cancel' : title}
      </button>
      {open && (
        <div className="inline-form-body card" style={{ marginTop: '12px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
