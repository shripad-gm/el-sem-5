import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";
import AdminAlertCard from "../components/alerts/AdminAlertCard";
import CitizenAlertCard from "../components/alerts/CitizenAlertCard";
import "../components/alerts/Alerts.css";

const AlertsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

const fetchAlerts = async () => {
  try {
    setLoading(true);

    /* ================= ADMIN ALERTS ================= */
    if (user?.isAdmin) {
      const { data } = await api.get("/admin/issues");

      if (!Array.isArray(data)) {
        setAlerts([]);
        return;
      }

      const criticalIssues = data.filter(issue => {
        if (!issue.slaDeadline) return false;

        const now = Date.now();
        const deadline = new Date(issue.slaDeadline).getTime();
        const hoursLeft = (deadline - now) / 36e5;

        return hoursLeft > 0 && hoursLeft <= 6;
      });

      setAlerts(criticalIssues);
      return;
    }

    /* ================= CITIZEN ALERTS ================= */
    const { data } = await api.get("/issues/explore");

    if (!Array.isArray(data)) {
      setAlerts([]);
      return;
    }

    const myIssues = data.filter(
      issue => issue.postedBy?.id === user?.id
    );

    const pendingVerification = myIssues.filter(
      issue => issue.status === "RESOLVED_PENDING_USER"
    );

    setAlerts(pendingVerification);
  } catch (err) {
    console.error("Failed to fetch alerts", err);
    setAlerts([]);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <Loader />;

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts</h1>

      {alerts.length === 0 && (
        <div className="alerts-empty">No alerts at the moment</div>
      )}

      <div className="alerts-list">
        {alerts.map(issue =>
          user.isAdmin ? (
            <AdminAlertCard
              key={issue.id}
              issue={issue}
              onClick={() => navigate(`/admin/issues/${issue.id}`)}
            />
          ) : (
            <CitizenAlertCard
              key={issue.id}
              issue={issue}
              onClick={() => navigate(`/issues/${issue.id}`)}
            />
          )
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
