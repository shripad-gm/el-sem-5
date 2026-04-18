const CitizenAlertCard = ({ issue, onClick }) => {
  return (
    <div className="alert-card citizen-alert" onClick={onClick}>
      <h3>{issue.title}</h3>
      <p>{issue.category} • {issue.locality}</p>

      <span className="status-pill">
        Verification Pending
      </span>
    </div>
  );
};

export default CitizenAlertCard;
