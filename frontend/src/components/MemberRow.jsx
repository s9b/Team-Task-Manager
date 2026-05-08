import Badge from './Badge';

export default function MemberRow({ member, onRemove, canRemove }) {
  return (
    <tr>
      <td>{member.user.name}</td>
      <td className="text-muted">{member.user.email}</td>
      <td><Badge type="role" value={member.role} /></td>
      <td>
        {canRemove && (
          <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => onRemove(member.user.id)}>
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}
