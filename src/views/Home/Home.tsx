import './Home.css';

export const Home = () => {
  return (
    <div className="home-container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Welcome</h3>
          <p>This is the home dashboard. You can add your widgets and metrics here.</p>
        </div>
        <div className="dashboard-card">
          <h3>Statistics</h3>
          <p>Placeholder for statistics and charts.</p>
        </div>
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>Placeholder for recent activity feed.</p>
        </div>
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <p>Placeholder for quick action buttons.</p>
        </div>
      </div>
    </div>
  );
};

