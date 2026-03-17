import { useEffect, useState } from 'react';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../services/api';

const DEFAULT_EMPLOYEE = {
  name: '',
  email: '',
  department: '',
  role: 'employee',
  status: 'active',
  password: 'welcome123',
};

const apiErrorMessage = (err) => err?.response?.data?.error || 'Request failed';

export default function EmployeeManagement({ canManage }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [form, setForm] = useState(DEFAULT_EMPLOYEE);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const res = await getEmployees(filters);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(apiErrorMessage(err));
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, [filters.search, filters.role, filters.status]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEmployee(editingId, form);
      } else {
        await createEmployee(form);
      }
      setForm(DEFAULT_EMPLOYEE);
      setEditingId(null);
      load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  const edit = (employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      role: employee.role || 'employee',
      status: employee.status || 'active',
      password: '',
    });
  };

  const remove = async (id) => {
    try {
      await deleteEmployee(id);
      load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  return (
    <section className="card">
      <h2>Employee Management</h2>
      <div className="toolbar">
        <input placeholder="Search name/email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {canManage && (
        <form className="form-grid" onSubmit={submit}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit">{editingId ? 'Update Employee' : 'Add Employee'}</button>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.role}</td>
                <td>{emp.status}</td>
                {canManage && (
                  <td>
                    <button type="button" onClick={() => edit(emp)}>Edit</button>
                    <button type="button" className="danger" onClick={() => remove(emp.id)}>Delete</button>
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
