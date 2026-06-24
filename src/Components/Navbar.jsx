import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">

        <Link className="navbar-brand" to="/">
          🍽️ Macro Meals
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <Link className="nav-link" to="/Home">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/About">
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/Profile">
                Profile
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/Favourites">
                Favourites
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/Search">
                Search
              </Link>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  )
}

export default Navbar