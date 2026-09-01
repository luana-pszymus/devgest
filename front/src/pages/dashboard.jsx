import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Building2, CheckCircle2, AlertCircle, Zap, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const TARIFA_KWH = 1.00; // Valor por kWh

  // Carrega ou inicializa os dados salvos no celular
  const [kitnets, setKitnets] = useState(() => {
    const salvos = localStorage.getItem('gestao_kitnets');
    return salvos ? JSON.parse(salvos) : [
      { id: 1, nome: 'Kitnet 01', inquilino: 'João Silva', aluguel: 980, status: 'pago', consumoLuz: 60 },
      { id: 2, nome: 'Kitnet 02', inquilino: 'Carlos Souza', aluguel: 980, status: 'pendente', consumoLuz: 45 },
      { id: 3, nome: 'Kitnet 03', inquilino: 'Vazio / Disponível', aluguel: 950, status: 'pago', consumoLuz: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gestao_kitnets', JSON.stringify(kitnets));
  }, [kitnets]);

  // Alterna entre Pago e Pendente com 1 toque
  const alternarStatus = (id) => {
    setKitnets(kitnets.map(k => {
      if (k.id === id) {
        return { ...k, status: k.status === 'pago' ? 'pendente' : 'pago' };
      }
      return k;
    }));
  };

  // Cálculos rápidos do painel
  const totalAluguel = kitnets.reduce((acc, k) => acc + k.aluguel, 0);
  const totalRecebido = kitnets.filter(k => k.status === 'pago').reduce((acc, k) => acc + k.aluguel, 0);
  const pendentesCount = kitnets.filter(k => k.status === 'pendente').length;

  return (
    <div style={styles.container}>
      {/* Topo / Header Mobile */}
      <header style={styles.header}>
        <h1 style={styles.appTitle}>Gestão Kitnets</h1>
        <p style={styles.appSubtitle}>Visão Geral do Mês</p>

        {/* Card de Resumo Financeiro */}
        <div style={styles.resumoCard}>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Recebido</span>
            <strong style={{ color: '#16a34a', fontSize: '18px' }}>R$ {totalRecebido.toFixed(2)}</strong>
          </div>
          <div style={styles.resumoDivider}></div>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Pendentes</span>
            <strong style={{ color: pendentesCount > 0 ? '#dc2626' : '#475569', fontSize: '18px' }}>
              {pendentesCount} {pendentesCount === 1 ? 'imóvel' : 'imóveis'}
            </strong>
          </div>
        </div>
      </header>

      {/* Lista Principal de Imóveis */}
      <main style={styles.content}>
        <h2 style={styles.sectionTitle}>Suas Kitnets</h2>

        <div style={styles.list}>
          {kitnets.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.kitnetNome}>{item.nome}</h3>
                  <p style={styles.inquilinoNome}>👤 {item.inquilino}</p>
                </div>
                <span style={styles.precoText}>R$ {item.aluguel.toFixed(2)}</span>
              </div>

              {/* Informação rápida de luz */}
              <div style={styles.luzBadge}>
                <Zap size={15} color="#0284c7" />
                <span>Luz atual: <strong>R$ {(item.consumoLuz * TARIFA_KWH).toFixed(2)}</strong> ({item.consumoLuz} kWh)</span>
              </div>

              {/* Botão de Ação Direta (Grande para o Polegar) */}
              <button
                onClick={() => alternarStatus(item.id)}
                style={item.status === 'pago' ? styles.btnPago : styles.btnPendente}
              >
                {item.status === 'pago' ? (
                  <> <CheckCircle2 size={20} /> ALUGUEL PAGO </>
                ) : (
                  <> <AlertCircle size={20} /> MARCAR COMO PAGO </>
                )}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Menu Fixo no Rodapé */}
      <Navbar />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    paddingBottom: '90px', // Espaço para não cobrir o conteúdo com a Navbar
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: '20px 16px 40px 16px',
    color: '#ffffff',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px'
  },
  appTitle: { margin: 0, fontSize: '22px', fontWeight: 'bold' },
  appSubtitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#93c5fd' },
  resumoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  resumoItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'center' },
  resumoLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  resumoDivider: { width: '1px', height: '35px', backgroundColor: '#e2e8f0' },
  content: { padding: '0 16px', marginTop: '-15px' },
  sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0'
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  kitnetNome: { margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: 'bold' },
  inquilinoNome: { margin: '4px 0 0 0', fontSize: '14px', color: '#475569' },
  precoText: { fontSize: '17px', fontWeight: 'bold', color: '#1e3a8a' },
  luzBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0f9ff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '12px'
  },
  btnPago: {
    width: '100%',
    height: '48px', // Tamanho ideal para o polegar
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  btnPendente: {
    width: '100%',
    height: '48px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  }
};import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Building2, CheckCircle2, AlertCircle, Zap, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const TARIFA_KWH = 1.00; // Valor por kWh

  // Carrega ou inicializa os dados salvos no celular
  const [kitnets, setKitnets] = useState(() => {
    const salvos = localStorage.getItem('gestao_kitnets');
    return salvos ? JSON.parse(salvos) : [
      { id: 1, nome: 'Kitnet 01', inquilino: 'João Silva', aluguel: 980, status: 'pago', consumoLuz: 60 },
      { id: 2, nome: 'Kitnet 02', inquilino: 'Carlos Souza', aluguel: 980, status: 'pendente', consumoLuz: 45 },
      { id: 3, nome: 'Kitnet 03', inquilino: 'Vazio / Disponível', aluguel: 950, status: 'pago', consumoLuz: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gestao_kitnets', JSON.stringify(kitnets));
  }, [kitnets]);

  // Alterna entre Pago e Pendente com 1 toque
  const alternarStatus = (id) => {
    setKitnets(kitnets.map(k => {
      if (k.id === id) {
        return { ...k, status: k.status === 'pago' ? 'pendente' : 'pago' };
      }
      return k;
    }));
  };

  // Cálculos rápidos do painel
  const totalAluguel = kitnets.reduce((acc, k) => acc + k.aluguel, 0);
  const totalRecebido = kitnets.filter(k => k.status === 'pago').reduce((acc, k) => acc + k.aluguel, 0);
  const pendentesCount = kitnets.filter(k => k.status === 'pendente').length;

  return (
    <div style={styles.container}>
      {/* Topo / Header Mobile */}
      <header style={styles.header}>
        <h1 style={styles.appTitle}>Gestão Kitnets</h1>
        <p style={styles.appSubtitle}>Visão Geral do Mês</p>

        {/* Card de Resumo Financeiro */}
        <div style={styles.resumoCard}>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Recebido</span>
            <strong style={{ color: '#16a34a', fontSize: '18px' }}>R$ {totalRecebido.toFixed(2)}</strong>
          </div>
          <div style={styles.resumoDivider}></div>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Pendentes</span>
            <strong style={{ color: pendentesCount > 0 ? '#dc2626' : '#475569', fontSize: '18px' }}>
              {pendentesCount} {pendentesCount === 1 ? 'imóvel' : 'imóveis'}
            </strong>
          </div>
        </div>
      </header>

      {/* Lista Principal de Imóveis */}
      <main style={styles.content}>
        <h2 style={styles.sectionTitle}>Suas Kitnets</h2>

        <div style={styles.list}>
          {kitnets.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.kitnetNome}>{item.nome}</h3>
                  <p style={styles.inquilinoNome}>👤 {item.inquilino}</p>
                </div>
                <span style={styles.precoText}>R$ {item.aluguel.toFixed(2)}</span>
              </div>

              {/* Informação rápida de luz */}
              <div style={styles.luzBadge}>
                <Zap size={15} color="#0284c7" />
                <span>Luz atual: <strong>R$ {(item.consumoLuz * TARIFA_KWH).toFixed(2)}</strong> ({item.consumoLuz} kWh)</span>
              </div>

              {/* Botão de Ação Direta (Grande para o Polegar) */}
              <button
                onClick={() => alternarStatus(item.id)}
                style={item.status === 'pago' ? styles.btnPago : styles.btnPendente}
              >
                {item.status === 'pago' ? (
                  <> <CheckCircle2 size={20} /> ALUGUEL PAGO </>
                ) : (
                  <> <AlertCircle size={20} /> MARCAR COMO PAGO </>
                )}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Menu Fixo no Rodapé */}
      <Navbar />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    paddingBottom: '90px', // Espaço para não cobrir o conteúdo com a Navbar
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: '20px 16px 40px 16px',
    color: '#ffffff',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px'
  },
  appTitle: { margin: 0, fontSize: '22px', fontWeight: 'bold' },
  appSubtitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#93c5fd' },
  resumoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  resumoItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'center' },
  resumoLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  resumoDivider: { width: '1px', height: '35px', backgroundColor: '#e2e8f0' },
  content: { padding: '0 16px', marginTop: '-15px' },
  sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0'
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  kitnetNome: { margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: 'bold' },
  inquilinoNome: { margin: '4px 0 0 0', fontSize: '14px', color: '#475569' },
  precoText: { fontSize: '17px', fontWeight: 'bold', color: '#1e3a8a' },
  luzBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0f9ff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '12px'
  },
  btnPago: {
    width: '100%',
    height: '48px', // Tamanho ideal para o polegar
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  btnPendente: {
    width: '100%',
    height: '48px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  }
};import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Building2, CheckCircle2, AlertCircle, Zap, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const TARIFA_KWH = 1.00; // Valor por kWh

  // Carrega ou inicializa os dados salvos no celular
  const [kitnets, setKitnets] = useState(() => {
    const salvos = localStorage.getItem('gestao_kitnets');
    return salvos ? JSON.parse(salvos) : [
      { id: 1, nome: 'Kitnet 01', inquilino: 'João Silva', aluguel: 980, status: 'pago', consumoLuz: 60 },
      { id: 2, nome: 'Kitnet 02', inquilino: 'Carlos Souza', aluguel: 980, status: 'pendente', consumoLuz: 45 },
      { id: 3, nome: 'Kitnet 03', inquilino: 'Vazio / Disponível', aluguel: 950, status: 'pago', consumoLuz: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gestao_kitnets', JSON.stringify(kitnets));
  }, [kitnets]);

  // Alterna entre Pago e Pendente com 1 toque
  const alternarStatus = (id) => {
    setKitnets(kitnets.map(k => {
      if (k.id === id) {
        return { ...k, status: k.status === 'pago' ? 'pendente' : 'pago' };
      }
      return k;
    }));
  };

  // Cálculos rápidos do painel
  const totalAluguel = kitnets.reduce((acc, k) => acc + k.aluguel, 0);
  const totalRecebido = kitnets.filter(k => k.status === 'pago').reduce((acc, k) => acc + k.aluguel, 0);
  const pendentesCount = kitnets.filter(k => k.status === 'pendente').length;

  return (
    <div style={styles.container}>
      {/* Topo / Header Mobile */}
      <header style={styles.header}>
        <h1 style={styles.appTitle}>Gestão Kitnets</h1>
        <p style={styles.appSubtitle}>Visão Geral do Mês</p>

        {/* Card de Resumo Financeiro */}
        <div style={styles.resumoCard}>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Recebido</span>
            <strong style={{ color: '#16a34a', fontSize: '18px' }}>R$ {totalRecebido.toFixed(2)}</strong>
          </div>
          <div style={styles.resumoDivider}></div>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Pendentes</span>
            <strong style={{ color: pendentesCount > 0 ? '#dc2626' : '#475569', fontSize: '18px' }}>
              {pendentesCount} {pendentesCount === 1 ? 'imóvel' : 'imóveis'}
            </strong>
          </div>
        </div>
      </header>

      {/* Lista Principal de Imóveis */}
      <main style={styles.content}>
        <h2 style={styles.sectionTitle}>Suas Kitnets</h2>

        <div style={styles.list}>
          {kitnets.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.kitnetNome}>{item.nome}</h3>
                  <p style={styles.inquilinoNome}>👤 {item.inquilino}</p>
                </div>
                <span style={styles.precoText}>R$ {item.aluguel.toFixed(2)}</span>
              </div>

              {/* Informação rápida de luz */}
              <div style={styles.luzBadge}>
                <Zap size={15} color="#0284c7" />
                <span>Luz atual: <strong>R$ {(item.consumoLuz * TARIFA_KWH).toFixed(2)}</strong> ({item.consumoLuz} kWh)</span>
              </div>

              {/* Botão de Ação Direta (Grande para o Polegar) */}
              <button
                onClick={() => alternarStatus(item.id)}
                style={item.status === 'pago' ? styles.btnPago : styles.btnPendente}
              >
                {item.status === 'pago' ? (
                  <> <CheckCircle2 size={20} /> ALUGUEL PAGO </>
                ) : (
                  <> <AlertCircle size={20} /> MARCAR COMO PAGO </>
                )}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Menu Fixo no Rodapé */}
      <Navbar />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    paddingBottom: '90px', // Espaço para não cobrir o conteúdo com a Navbar
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: '20px 16px 40px 16px',
    color: '#ffffff',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px'
  },
  appTitle: { margin: 0, fontSize: '22px', fontWeight: 'bold' },
  appSubtitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#93c5fd' },
  resumoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  resumoItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'center' },
  resumoLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  resumoDivider: { width: '1px', height: '35px', backgroundColor: '#e2e8f0' },
  content: { padding: '0 16px', marginTop: '-15px' },
  sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0'
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  kitnetNome: { margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: 'bold' },
  inquilinoNome: { margin: '4px 0 0 0', fontSize: '14px', color: '#475569' },
  precoText: { fontSize: '17px', fontWeight: 'bold', color: '#1e3a8a' },
  luzBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0f9ff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '12px'
  },
  btnPago: {
    width: '100%',
    height: '48px', // Tamanho ideal para o polegar
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  btnPendente: {
    width: '100%',
    height: '48px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  }
};import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Building2, CheckCircle2, AlertCircle, Zap, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const TARIFA_KWH = 1.00; // Valor por kWh

  // Carrega ou inicializa os dados salvos no celular
  const [kitnets, setKitnets] = useState(() => {
    const salvos = localStorage.getItem('gestao_kitnets');
    return salvos ? JSON.parse(salvos) : [
      { id: 1, nome: 'Kitnet 01', inquilino: 'João Silva', aluguel: 980, status: 'pago', consumoLuz: 60 },
      { id: 2, nome: 'Kitnet 02', inquilino: 'Carlos Souza', aluguel: 980, status: 'pendente', consumoLuz: 45 },
      { id: 3, nome: 'Kitnet 03', inquilino: 'Vazio / Disponível', aluguel: 950, status: 'pago', consumoLuz: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gestao_kitnets', JSON.stringify(kitnets));
  }, [kitnets]);

  // Alterna entre Pago e Pendente com 1 toque
  const alternarStatus = (id) => {
    setKitnets(kitnets.map(k => {
      if (k.id === id) {
        return { ...k, status: k.status === 'pago' ? 'pendente' : 'pago' };
      }
      return k;
    }));
  };

  // Cálculos rápidos do painel
  const totalAluguel = kitnets.reduce((acc, k) => acc + k.aluguel, 0);
  const totalRecebido = kitnets.filter(k => k.status === 'pago').reduce((acc, k) => acc + k.aluguel, 0);
  const pendentesCount = kitnets.filter(k => k.status === 'pendente').length;

  return (
    <div style={styles.container}>
      {/* Topo / Header Mobile */}
      <header style={styles.header}>
        <h1 style={styles.appTitle}>Gestão Kitnets</h1>
        <p style={styles.appSubtitle}>Visão Geral do Mês</p>

        {/* Card de Resumo Financeiro */}
        <div style={styles.resumoCard}>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Recebido</span>
            <strong style={{ color: '#16a34a', fontSize: '18px' }}>R$ {totalRecebido.toFixed(2)}</strong>
          </div>
          <div style={styles.resumoDivider}></div>
          <div style={styles.resumoItem}>
            <span style={styles.resumoLabel}>Pendentes</span>
            <strong style={{ color: pendentesCount > 0 ? '#dc2626' : '#475569', fontSize: '18px' }}>
              {pendentesCount} {pendentesCount === 1 ? 'imóvel' : 'imóveis'}
            </strong>
          </div>
        </div>
      </header>

      {/* Lista Principal de Imóveis */}
      <main style={styles.content}>
        <h2 style={styles.sectionTitle}>Suas Kitnets</h2>

        <div style={styles.list}>
          {kitnets.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.kitnetNome}>{item.nome}</h3>
                  <p style={styles.inquilinoNome}>👤 {item.inquilino}</p>
                </div>
                <span style={styles.precoText}>R$ {item.aluguel.toFixed(2)}</span>
              </div>

              {/* Informação rápida de luz */}
              <div style={styles.luzBadge}>
                <Zap size={15} color="#0284c7" />
                <span>Luz atual: <strong>R$ {(item.consumoLuz * TARIFA_KWH).toFixed(2)}</strong> ({item.consumoLuz} kWh)</span>
              </div>

              {/* Botão de Ação Direta (Grande para o Polegar) */}
              <button
                onClick={() => alternarStatus(item.id)}
                style={item.status === 'pago' ? styles.btnPago : styles.btnPendente}
              >
                {item.status === 'pago' ? (
                  <> <CheckCircle2 size={20} /> ALUGUEL PAGO </>
                ) : (
                  <> <AlertCircle size={20} /> MARCAR COMO PAGO </>
                )}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Menu Fixo no Rodapé */}
      <Navbar />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    paddingBottom: '90px', // Espaço para não cobrir o conteúdo com a Navbar
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: '20px 16px 40px 16px',
    color: '#ffffff',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px'
  },
  appTitle: { margin: 0, fontSize: '22px', fontWeight: 'bold' },
  appSubtitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#93c5fd' },
  resumoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  resumoItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'center' },
  resumoLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  resumoDivider: { width: '1px', height: '35px', backgroundColor: '#e2e8f0' },
  content: { padding: '0 16px', marginTop: '-15px' },
  sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0'
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  kitnetNome: { margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: 'bold' },
  inquilinoNome: { margin: '4px 0 0 0', fontSize: '14px', color: '#475569' },
  precoText: { fontSize: '17px', fontWeight: 'bold', color: '#1e3a8a' },
  luzBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0f9ff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '12px'
  },
  btnPago: {
    width: '100%',
    height: '48px', // Tamanho ideal para o polegar
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  btnPendente: {
    width: '100%',
    height: '48px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer'
  }
};