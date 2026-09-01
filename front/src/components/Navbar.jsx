import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Zap, History } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  // Função para saber se a aba está selecionada
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.bottomNav}>
      <Link to="/" style={styles.navItem(isActive('/'))}>
        <Home size={22} />
        <span style={styles.label}>Início</span>
      </Link>

      <Link to="/registro" style={styles.navItem(isActive('/registro'))}>
        <Zap size={22} />
        <span style={styles.label}>Luz</span>
      </Link>

      <Link to="/inquilinos" style={styles.navItem(isActive('/inquilinos'))}>
        <Users size={22} />
        <span style={styles.label}>Inquilinos</span>
      </Link>

      <Link to="/consulta" style={styles.navItem(isActive('/consulta'))}>
        <History size={22} />
        <span style={styles.label}>Histórico</span>
      </Link>
    </nav>
  );
}

const styles = {
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
  },
  navItem: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: active ? '#1e3a8a' : '#64748b',
    fontWeight: active ? 'bold' : 'normal',
    width: '25%',
    height: '100%'
  }),
  label: {
    fontSize: '11px',
    marginTop: '3px'
  }
};