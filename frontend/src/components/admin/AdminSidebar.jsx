import "./AdminSidebar.css";

const STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"];

const AdminSidebar = ({ issues, activeStatus, setActiveStatus }) => {
  const counts = STATUSES.reduce((acc, status) => {
    acc[status] = issues.filter(
      (i) => i.status === status
    ).length;
    return acc;
  }, {});

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3 className="admin-sidebar-title">My Work</h3>
      </div>

      <div className="admin-sidebar-content">
        {STATUSES.map((status) => (
          <div
            key={status}
            className={`admin-sidebar-item ${
              activeStatus === status ? "active" : ""
            }`}
            onClick={() =>
              setActiveStatus(
                activeStatus === status ? null : status
              )
            }
          >
            <span>{status.replace("_", " ")}</span>
            <span className="count">{counts[status]}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
