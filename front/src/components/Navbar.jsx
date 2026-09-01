import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.menu}>
      <Link to="/" style={styles.botao}>🏠 Início</Link>
      <Link to="/inquilinos" style={styles.botao}>👤 Inquilinos</Link>
      <Link to="/registro" style={styles.botao}>⚡ Registrar Luz</Link>
      <Link to="/consulta" style={styles.botao}>📊 Historico</Link>
    </nav>
  );
}

const styles = {
  menu: {
    backgroundColor: '#1e3a8a',
    padding: '10px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  botao: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 12px',
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px'
  }
};