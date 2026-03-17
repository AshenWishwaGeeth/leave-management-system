import { useState } from 'react';
import { requestLeave } from '../services/api';

const DEFAULT_LEAVE = {
  leave_type: 'Sick',
  start_date: '',
  end_date: '',
  reason: '',
};

const apiErrorMessage = (err) => err?.response?.data?.error || 'Request failed';

export default function LeaveRequestPanel({ user }) {
  const [form, setForm] = useState(DEFAULT_LEAVE);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await requestLeave({
        employee_id: user.id,
        leave_type: form.leave_type,
        start_date: `${form.start_date}T00:00:00Z`,
        end_date: `${form.end_date}T00:00:00Z`,
        reason: form.reason,
      });
      alert('Leave request submitted');
      setForm(DEFAULT_LEAVE);
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  return (
    <section className="card">
      <h2>Request Leave</h2>
      <form className="form-grid" onSubmit={submit}>
        <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })}>
          <option>Sick</option>
          <option>Casual</option>
          <option>Annual</option>
          <option>Emergency</option>
        </select>
        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
        <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
        <input placeholder="Reason / Notes" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
