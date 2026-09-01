import Navbar from '../components/Navbar';

export default function Dashboard() {
  return (
    <div>
      {/* Coloca o menu no topo */}
      <Navbar />

      <div style={{ padding: '20px' }}>
        <h1>Painel das Kitnets</h1>
        <p>Aqui você vê todas as suas kitnets!</p>
      </div>
    </div>
  );
}