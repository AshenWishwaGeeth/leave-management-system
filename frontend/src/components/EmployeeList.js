import React, { useEffect, useState } from "react";
import { getEmployees } from "../services/api";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    getEmployees()
      .then((res) => {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setEmployees([]);
      });
  }, []);

  return (
    <div>
      <h2>Employees</h2>
      <ul>
        {employees.map(emp => (
          <li key={emp.id}>{emp.name} ({emp.role})</li>
        ))}
      </ul>
    </div>
  );
}