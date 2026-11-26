import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="center-page">
      <div>
        <div className="big">404</div>
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for does not exist or has moved.</p>
        <Link className="btn btn-primary" to="/">
          Back to the start
        </Link>
      </div>
    </main>
  );
}
