import React, { useEffect, useState } from "react";
import { getLeaves } from "../services/api";

export default function Dashboard() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    getLeaves()
      .then((res) => {
        setLeaves(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setLeaves([]);
      });
  }, []);

  return (
    <div>
      <h2>Leave Dashboard</h2>
      <ul>
        {leaves.map(lv => (
          <li key={lv.id}>{lv.EmployeeID} | {lv.leave_type} | {lv.status}</li>
        ))}
      </ul>
    </div>
  );
}