import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center px-4">
        <p className="text-7xl font-black text-primary mb-2">404</p>
        <h1 className="text-2xl font-black text-dark mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button size="lg">Back to Home</Button></Link>
      </div>
    </main>
  );
}