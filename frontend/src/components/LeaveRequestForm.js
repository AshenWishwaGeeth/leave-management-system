import React, { useState } from "react";
import { requestLeave } from "../services/api";

export default function LeaveRequestForm() {
  const [form, setForm] = useState({ employee_id: "", leave_type: "", start_date: "", end_date: "", reason: "" });

  const handleSubmit = (e) => {
    e.preventDefault();

    const employeeId = Number(form.employee_id);
    if (!employeeId || !form.start_date || !form.end_date) {
      alert("Please fill Employee ID, Start Date, and End Date correctly.");
      return;
    }

    const payload = {
      ...form,
      employee_id: employeeId,
      start_date: `${form.start_date}T00:00:00Z`,
      end_date: `${form.end_date}T00:00:00Z`,
    };

    requestLeave(payload)
      .then(() => alert("Leave requested!"))
      .catch((error) => {
        const message = error?.response?.data?.error || "Request failed";
        alert(message);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Employee ID" onChange={e => setForm({ ...form, employee_id: e.target.value })} />
      <input placeholder="Leave Type" onChange={e => setForm({ ...form, leave_type: e.target.value })} />
      <input type="date" placeholder="Start Date" onChange={e => setForm({ ...form, start_date: e.target.value })} />
      <input type="date" placeholder="End Date" onChange={e => setForm({ ...form, end_date: e.target.value })} />
      <input placeholder="Reason" onChange={e => setForm({ ...form, reason: e.target.value })} />
      <button type="submit">Request Leave</button>
    </form>
  );
}