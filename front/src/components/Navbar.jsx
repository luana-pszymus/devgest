import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

import homeIcon from "../assets/icons/home.png";
import luzIcon from "../assets/icons/luz.png";
import inquilinoIcon from "../assets/icons/inquilino.png";
import historicoIcon from "../assets/icons/historico.png";

function Navbar() {
  const location = useLocation();

  const items = [
    {
      path: "/",
      label: "Início",
      icon: homeIcon,
    },
    {
      path: "/registro",
      label: "Energia",
      icon: luzIcon,
    },
    {
      path: "/inquilinos",
      label: "Inquilinos",
      icon: inquilinoIcon,
    },
    {
      path: "/consulta",
      label: "Histórico",
      icon: historicoIcon,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map((item) => {
        const active = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <span className="nav-icon-wrapper">
              <img
                src={item.icon}
                alt=""
                className="nav-icon"
              />
            </span>

            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default Navbar;