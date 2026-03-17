import { useEffect, useState } from 'react';
import { getLeaves, updateLeaveStatus } from '../services/api';

const apiErrorMessage = (err) => err?.response?.data?.error || 'Request failed';

export default function LeaveHistory({ canApprove }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [commentById, setCommentById] = useState({});

  const load = async () => {
    try {
      const res = await getLeaves(filters);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(apiErrorMessage(err));
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, [filters.status, filters.from, filters.to]);

  const decision = async (id, status) => {
    try {
      await updateLeaveStatus(id, { status, manager_comment: commentById[id] || '' });
      load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  return (
    <section className="card">
      <h2>{canApprove ? 'Pending Approval Requests' : 'Leave Status / History'}</h2>
      <div className="toolbar">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <button type="button" onClick={() => window.print()}>Export/Print</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th>
              {canApprove && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((lv) => (
              <tr key={lv.id}>
                <td>{lv.employee?.name || lv.employee_id}</td>
                <td>{lv.leave_type}</td>
                <td>{String(lv.start_date).slice(0, 10)} to {String(lv.end_date).slice(0, 10)}</td>
                <td>{lv.reason}</td>
                <td>{lv.status}</td>
                {canApprove && (
                  <td>
                    <input
                      placeholder="Comment"
                      value={commentById[lv.id] || ''}
                      onChange={(e) => setCommentById({ ...commentById, [lv.id]: e.target.value })}
                    />
                    <button type="button" onClick={() => decision(lv.id, 'Approved')}>Approve</button>
                    <button type="button" className="danger" onClick={() => decision(lv.id, 'Rejected')}>Reject</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
