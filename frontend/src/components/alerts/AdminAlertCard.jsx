const AdminAlertCard = ({ issue, onClick }) => {
  const now = Date.now();
  const created = new Date(issue.createdAt).getTime();
  const deadline = new Date(issue.slaDeadline).getTime();

  const total = deadline - created;
  const elapsed = Math.max(0, now - created);
  const remaining = Math.max(0, deadline - now);

  const progress =
    total > 0 ? Math.min(100, Math.floor((elapsed / total) * 100)) : 100;

  const expired = remaining <= 0;

  return (
    <div className="alert-card admin-alert" onClick={onClick}>
      <div className="alert-main">
        <h3>{issue.title}</h3>
        <p>{issue.category} • {issue.locality}</p>
      </div>

      <div className="alert-sla">
        <div className="sla-track">
          <div
            className={`sla-fill ${expired ? "expired" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="sla-text">
          {expired
            ? "SLA EXPIRED"
            : `${Math.floor(remaining / 36e5)}h ${Math.floor(
                (remaining / 60000) % 60
              )}m left`}
        </span>
      </div>
    </div>
  );
};

export default AdminAlertCard;
