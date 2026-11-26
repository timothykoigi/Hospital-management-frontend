import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../utils/navigation";

export default function AccessDenied() {
  const { user } = useAuth();
  return (
    <main className="center-page">
      <div>
        <div className="big">403</div>
        <h1>Access denied</h1>
        <p className="muted">Your account does not have permission to open that page.</p>
        <Link className="btn btn-primary" to={user ? roleHome(user.role) : "/login"}>
          {user ? "Back to my dashboard" : "Go to login"}
        </Link>
      </div>
    </main>
  );
}
