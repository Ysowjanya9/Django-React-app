import { Link } from "react-router-dom";
function Home() {
  return (
    <div className="home">
      <h1>Welcome to Racing Application</h1>
      <nav className="navbar">
        <ol>
          <li>
            <Link to="/teams">Teams</Link>
          </li>
          <li>
            <Link to="/drivers">Drivers</Link>
          </li>
          <li>
            <Link to="/races">Races</Link>
          </li>
        </ol>
      </nav>
    </div>
  );
}

export default Home;
