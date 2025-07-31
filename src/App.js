import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- ÍCONES SVG ---
const IconePainel = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>;
const IconeLancamentos = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const IconeMetas = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconeLixeira = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconeEditar = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconeDownload = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

// --- DADOS E CONFIGURAÇÕES ---
const CATEGORIAS = [
  { value: 'moradia', label: 'Moradia' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'dividas', label: 'Dívidas e Financiamentos' },
  { value: 'outros', label: 'Outros' },
];

const CORES_GRAFICO_CATEGORIA = ['#3b82f6', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6', '#ec4899', '#f59e0b', '#6b7280'];

// --- COMPONENTES ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button></div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const CardInfo = ({ title, value, color = 'text-gray-800' }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className={`text-3xl font-bold mt-1 ${color}`}>R$ {value.toFixed(2)}</p>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [dados, setDados] = useState({ salario: 0, gastos: [], metas: [] });
  const [activeTab, setActiveTab] = useState('painel');
  const [modal, setModal] = useState({ type: null, data: null });
  const [formGasto, setFormGasto] = useState({ descricao: '', valor: '', tipo: 'Variável', categoria: 'outros' });
  const [formMeta, setFormMeta] = useState({ nome: '', valor: '' });
  const [formContribuicao, setFormContribuicao] = useState('');
  const [formSalario, setFormSalario] = useState('');

  // Carrega os dados do localStorage ao iniciar
  useEffect(() => {
    try {
      const dadosSalvos = localStorage.getItem('granaVerdeDados');
      if (dadosSalvos) {
        setDados(JSON.parse(dadosSalvos));
      } else {
        setModal({ type: 'salario' });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
      setModal({ type: 'salario' });
    }
  }, []);

  // Salva os dados no localStorage sempre que eles mudarem
  useEffect(() => {
    try {
      localStorage.setItem('granaVerdeDados', JSON.stringify(dados));
    } catch (error) {
      console.error("Erro ao salvar dados no localStorage:", error);
    }
  }, [dados]);

  const handleAdicionarGasto = (e) => {
    e.preventDefault();
    const novoGasto = {
      id: Date.now(),
      descricao: formGasto.descricao,
      valor: parseFloat(formGasto.valor),
      tipo: formGasto.tipo,
      categoria: formGasto.categoria,
      data: new Date().toISOString(),
    };
    setDados(dadosAtuais => ({ ...dadosAtuais, gastos: [...dadosAtuais.gastos, novoGasto] }));
    setFormGasto({ descricao: '', valor: '', tipo: 'Variável', categoria: 'outros' });
  };
  
  const handleExcluirGasto = (idGasto) => {
    setDados(dadosAtuais => ({ ...dadosAtuais, gastos: dadosAtuais.gastos.filter(g => g.id !== idGasto) }));
  };

  const handleCRUDMeta = (action, payload) => {
    let novasMetas = [...dados.metas];
    if (action === 'add') novasMetas.push({ id: Date.now(), nome: payload.nome, valor: parseFloat(payload.valor), guardado: 0, status: 'ativa' });
    else if (action === 'edit') novasMetas = novasMetas.map(m => m.id === payload.id ? { ...m, nome: payload.nome, valor: parseFloat(payload.valor) } : m);
    else if (action === 'delete') novasMetas = novasMetas.filter(m => m.id !== payload.id);
    else if (action === 'contribute') {
      novasMetas = novasMetas.map(m => {
        if (m.id === payload.id) {
          const novoGuardado = m.guardado + parseFloat(payload.valor);
          const status = novoGuardado >= m.valor ? 'concluida' : 'ativa';
          return { ...m, guardado: novoGuardado, status };
        }
        return m;
      });
    }
    setDados(dadosAtuais => ({ ...dadosAtuais, metas: novasMetas }));
    setModal({ type: null });
  };
  
  const handleExportarCSV = () => {
    const headers = "Descricao,Valor,Tipo,Categoria,Data\n";
    const rows = dados.gastos.map(g => `"${g.descricao}",${g.valor},${g.tipo},${CATEGORIAS.find(c => c.value === g.categoria)?.label || g.categoria},${new Date(g.data).toLocaleDateString('pt-BR')}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "meus_gastos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const financeiro = useMemo(() => {
    const gastos = dados.gastos || [];
    const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
    const gastosFixos = gastos.filter(g => g.tipo === 'Fixo').reduce((acc, g) => acc + g.valor, 0);
    const gastosVariaveis = gastos.filter(g => g.tipo === 'Variável').reduce((acc, g) => acc + g.valor, 0);
    const saldo = dados.salario - totalGastos;
    return { saldo, totalGastos, gastosFixos, gastosVariaveis };
  }, [dados]);

  const dadosGraficoPizza = useMemo(() => {
    const gastosPorCategoria = dados.gastos.reduce((acc, gasto) => {
      const categoriaLabel = CATEGORIAS.find(c => c.value === gasto.categoria)?.label || 'Outros';
      acc[categoriaLabel] = (acc[categoriaLabel] || 0) + gasto.valor;
      return acc;
    }, {});
    return Object.keys(gastosPorCategoria).map(key => ({ name: key, value: gastosPorCategoria[key] }));
  }, [dados.gastos]);
  
  const dadosGraficoBarra = [{ name: 'Tipo de Gasto', Fixo: financeiro.gastosFixos, Variável: financeiro.gastosVariaveis }];

  const dadosGraficoLinha = useMemo(() => {
    const gastosPorDia = dados.gastos.reduce((acc, g) => {
      const dia = new Date(g.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      acc[dia] = acc[dia] || { dia, Fixo: 0, Variável: 0 };
      acc[dia][g.tipo] += g.valor;
      return acc;
    }, {});
    return Object.values(gastosPorDia).sort((a,b) => a.dia.localeCompare(b.dia, 'pt-BR'));
  }, [dados.gastos]);

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <style>{`.tab-content { animation: fadeIn 0.5s ease; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Grana Verde</h1>
          <nav className="bg-gray-200 p-1 rounded-full flex items-center space-x-1">
            {[{id: 'painel', label: 'Painel', icon: IconePainel}, {id: 'lancamentos', label: 'Lançamentos', icon: IconeLancamentos}, {id: 'metas', label: 'Metas', icon: IconeMetas}].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center transition-colors ${activeTab === tab.id ? 'bg-white text-green-600 shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}>
                <tab.icon className="w-5 h-5 mr-2" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {activeTab === 'painel' && (
          <div className="tab-content space-y-6">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <CardInfo title="Salário" value={dados.salario} color="text-blue-600" />
                <CardInfo title="Gastos Fixos" value={financeiro.gastosFixos} color="text-gray-800" />
                <CardInfo title="Gastos Variáveis" value={financeiro.gastosVariaveis} color="text-gray-800" />
                <CardInfo title="Saldo Disponível" value={financeiro.saldo} color={financeiro.saldo >= 0 ? "text-green-600" : "text-red-500"} />
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm"><h2 className="text-lg font-bold mb-4">Comparativo Fixo vs. Variável</h2><ResponsiveContainer width="100%" height={300}><BarChart data={dadosGraficoBarra}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} /><Legend /><Bar dataKey="Fixo" fill="#3b82f6" /><Bar dataKey="Variável" fill="#22c55e" /></BarChart></ResponsiveContainer></div>
              <div className="bg-white p-6 rounded-xl shadow-sm"><h2 className="text-lg font-bold mb-4">Gastos por Categoria</h2><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={dadosGraficoPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} >{dadosGraficoPizza.map((entry, index) => (<Cell key={`cell-${index}`} fill={CORES_GRAFICO_CATEGORIA[index % CORES_GRAFICO_CATEGORIA.length]} />))}</Pie><Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} /><Legend /></PieChart></ResponsiveContainer></div>
            </section>
            <section className="bg-white p-6 rounded-xl shadow-sm"><h2 className="text-lg font-bold mb-4">Evolução de Gastos</h2><ResponsiveContainer width="100%" height={300}><LineChart data={dadosGraficoLinha}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dia" /><YAxis /><Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} /><Legend /><Line type="monotone" dataKey="Fixo" stroke="#3b82f6" strokeWidth={2} /><Line type="monotone" dataKey="Variável" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer></section>
          </div>
        )}

        {activeTab === 'lancamentos' && (
          <div className="tab-content space-y-6">
            <CardInfo title="Saldo Disponível" value={financeiro.saldo} color={financeiro.saldo >= 0 ? "text-green-600" : "text-red-500"} />
            <section className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold mb-4">Adicionar Gasto</h2>
              <form onSubmit={handleAdicionarGasto} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <input value={formGasto.descricao} onChange={(e) => setFormGasto({...formGasto, descricao: e.target.value})} type="text" placeholder="Descrição do Gasto" className="md:col-span-2 w-full p-3 border-gray-200 border rounded-lg" required />
                <input value={formGasto.valor} onChange={(e) => setFormGasto({...formGasto, valor: e.target.value})} type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-3 border-gray-200 border rounded-lg" required />
                <select value={formGasto.tipo} onChange={(e) => setFormGasto({...formGasto, tipo: e.target.value})} className="w-full p-3 border-gray-200 border rounded-lg bg-white"><option value="Variável">Variável</option><option value="Fixo">Fixo</option></select>
                <select value={formGasto.categoria} onChange={(e) => setFormGasto({...formGasto, categoria: e.target.value})} className="w-full p-3 border-gray-200 border rounded-lg bg-white">{CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
                <button type="submit" className="bg-green-500 text-white font-bold p-3 rounded-lg hover:bg-green-600 col-span-full">Adicionar</button>
              </form>
            </section>
            <div className="flex justify-end"><button onClick={handleExportarCSV} className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"><IconeDownload className="w-5 h-5" /> Baixar Planilha</button></div>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><h3 className="font-bold mb-3">Gastos Fixos</h3><ul className="space-y-2">{dados.gastos.filter(g => g.tipo === 'Fixo').map(g => <li key={g.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"><span>{g.descricao} <span className="text-xs text-gray-500">({CATEGORIAS.find(c => c.value === g.categoria)?.label})</span></span><div className="flex items-center gap-3"><span className="font-bold text-blue-600">R$ {g.valor.toFixed(2)}</span><button onClick={() => handleExcluirGasto(g.id)} className="text-gray-400 hover:text-red-500"><IconeLixeira /></button></div></li>)}</ul></div>
              <div><h3 className="font-bold mb-3">Gastos Variáveis</h3><ul className="space-y-2">{dados.gastos.filter(g => g.tipo === 'Variável').map(g => <li key={g.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"><span>{g.descricao} <span className="text-xs text-gray-500">({CATEGORIAS.find(c => c.value === g.categoria)?.label})</span></span><div className="flex items-center gap-3"><span className="font-bold text-green-600">R$ {g.valor.toFixed(2)}</span><button onClick={() => handleExcluirGasto(g.id)} className="text-gray-400 hover:text-red-500"><IconeLixeira /></button></div></li>)}</ul></div>
            </section>
          </div>
        )}

        {activeTab === 'metas' && (
          <div className="tab-content">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Metas Ativas</h2><button onClick={() => setModal({ type: 'meta' })} className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600">Nova Meta</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{dados.metas.filter(m => m.status === 'ativa').map(meta => <div key={meta.id} className="bg-white p-6 rounded-xl shadow-sm flex flex-col"><div className="flex-grow"><h3 className="text-lg font-bold">{meta.nome}</h3><p className="text-sm text-gray-500">Meta: R$ {meta.valor.toFixed(2)}</p><div className="w-full bg-gray-200 rounded-full h-4 my-3"><div className="bg-green-500 h-4 rounded-full" style={{ width: `${(meta.guardado / meta.valor) * 100}%` }}></div></div><div className="flex justify-between text-sm"><p>Progresso: {((meta.guardado / meta.valor) * 100).toFixed(1)}%</p><p>R$ {meta.guardado.toFixed(2)}</p></div></div><div className="flex items-center gap-2 mt-4"><button onClick={() => setModal({ type: 'contribuir', data: meta })} className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300">Contribuir</button><button onClick={() => setModal({ type: 'editarMeta', data: meta })} className="p-2 text-gray-500 hover:text-blue-600"><IconeEditar /></button><button onClick={() => handleCRUDMeta('delete', meta)} className="p-2 text-gray-500 hover:text-red-600"><IconeLixeira /></button></div></div>)}</div>
            <div className="mt-8"><h2 className="text-xl font-bold mb-4">Metas Concluídas</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{dados.metas.filter(m => m.status === 'concluida').map(meta => <div key={meta.id} className="bg-green-50 p-6 rounded-xl border border-green-200"><h3 className="text-lg font-bold text-green-800">{meta.nome}</h3><p className="text-sm text-green-700">Concluída! (R$ {meta.valor.toFixed(2)})</p></div>)}</div></div>
          </div>
        )}
      </main>

      <Modal isOpen={modal.type === 'salario'} onClose={() => {}} title="Qual sua renda mensal?"><input type="number" onChange={(e) => setFormSalario(e.target.value)} className="w-full p-3 border-gray-200 border rounded-lg" /><button onClick={() => {const v = parseFloat(formSalario); if (v > 0) { setDados({...dados, salario: v}); setModal({ type: null }); }}} className="mt-4 w-full bg-green-500 text-white font-bold p-3 rounded-lg">Salvar</button></Modal>
      <Modal isOpen={modal.type === 'meta'} onClose={() => setModal({ type: null })} title="Nova Meta"><input type="text" onChange={(e) => setFormMeta({...formMeta, nome: e.target.value})} placeholder="Nome da Meta" className="w-full p-3 border-gray-200 border rounded-lg mb-4"/><input type="number" onChange={(e) => setFormMeta({...formMeta, valor: e.target.value})} placeholder="Valor (R$)" className="w-full p-3 border-gray-200 border rounded-lg"/><button onClick={() => handleCRUDMeta('add', formMeta)} className="mt-4 w-full bg-green-500 text-white font-bold p-3 rounded-lg">Adicionar</button></Modal>
      <Modal isOpen={modal.type === 'editarMeta'} onClose={() => setModal({ type: null })} title="Editar Meta"><input type="text" defaultValue={modal.data?.nome} onChange={(e) => setModal({...modal, data: {...modal.data, nome: e.target.value}})} className="w-full p-3 border-gray-200 border rounded-lg mb-4"/><input type="number" defaultValue={modal.data?.valor} onChange={(e) => setModal({...modal, data: {...modal.data, valor: e.target.value}})} className="w-full p-3 border-gray-200 border rounded-lg"/><button onClick={() => handleCRUDMeta('edit', modal.data)} className="mt-4 w-full bg-green-500 text-white font-bold p-3 rounded-lg">Salvar</button></Modal>
      <Modal isOpen={modal.type === 'contribuir'} onClose={() => setModal({ type: null })} title={`Contribuir para ${modal.data?.nome}`}><input type="number" onChange={(e) => setFormContribuicao(e.target.value)} placeholder="Valor" className="w-full p-3 border-gray-200 border rounded-lg"/><button onClick={() => handleCRUDMeta('contribute', { id: modal.data.id, valor: formContribuicao })} className="mt-4 w-full bg-green-500 text-white font-bold p-3 rounded-lg">Contribuir</button></Modal>
    </div>
  );
}
