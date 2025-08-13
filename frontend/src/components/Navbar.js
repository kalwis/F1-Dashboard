import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-8 py-4 w-full">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
        <div className="font-bold text-xl">F1 Dashboard</div>
        <div className="flex gap-8 justify-center w-full md:w-auto mt-4 md:mt-0">
          <Link className="hover:underline" to="/">Dashboard</Link>
          <Link className="hover:underline" to="/rankings">Rankings</Link>
          <Link className="hover:underline" to="/predictions">Predictions</Link>
          <Link className="hover:underline" to="/compare">Compare</Link>
        </div>
      </div>
    </nav>
  );
}
