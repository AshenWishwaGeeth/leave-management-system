import './App.css';
import EmployeeList from './components/EmployeeList';
import LeaveRequestForm from './components/LeaveRequestForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Leave Management System</h1>
        <p>Manage employees and leave requests from one page.</p>
      </header>

      <main className="app-grid">
        <section className="panel">
          <h2>Request Leave</h2>
          <LeaveRequestForm />
        </section>

        <section className="panel">
          <EmployeeList />
        </section>

        <section className="panel panel-wide">
          <Dashboard />
        </section>
      </main>
    </div>
  );
}

export default App;
