import React, { useState, useEffect } from 'react';
import { 
  Wine, 
  ChefHat, 
  LogOut, 
  TrendingUp, 
  Package, 
  History, 
  Plus, 
  Check, 
  X, 
  Download, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  Lock,
  User,
  Search,
  RefreshCw,
  ChevronRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

// Dati iniziali di esempio (Demo)
const DEMO_ITEMS = [
  { id: '1', name: 'Gin Mare', category: 'Gin', quantity: 12, minQuantity: 5, unit: 'Garrafas', sector: 'bar' },
  { id: '2', name: 'Whisky Macallan 12', category: 'Whisky', quantity: 4, minQuantity: 3, unit: 'Garrafas', sector: 'bar' },
  { id: '3', name: 'Vinho Tinto Douro Reserva', category: 'Vinho', quantity: 24, minQuantity: 10, unit: 'Garrafas', sector: 'bar' },
  { id: '4', name: 'Cerveja Artesanal Super Bock', category: 'Cerveja', quantity: 48, minQuantity: 20, unit: 'Garrafas', sector: 'bar' },
  { id: '5', name: 'Água Tónica Premium', category: 'Sem Álcool', quantity: 60, minQuantity: 24, unit: 'Garrafas', sector: 'bar' },
  { id: '6', name: 'Azeite Virgem Extra 5L', category: 'Óleos & Condimentos', quantity: 8, minQuantity: 3, unit: 'Unidades', sector: 'cozinha' },
  { id: '7', name: 'Arroz Carolino 5kg', category: 'Secos', quantity: 15, minQuantity: 5, unit: 'Sacos', sector: 'cozinha' },
  { id: '8', name: 'Presunto Ibérico (Peça)', category: 'Charcutaria', quantity: 2, minQuantity: 1, unit: 'Peças', sector: 'cozinha' },
  { id: '9', name: 'Farinha Tipo 65 1kg', category: 'Secos', quantity: 25, minQuantity: 10, unit: 'Sacos', sector: 'cozinha' }
];

export default function App() {
  // Estado Global
  const [role, setRole] = useState(null); 
  const [activeSector, setActiveSector] = useState('bar'); 
  
  // Login Funcionário
  const [workerStep, setWorkerStep] = useState('name'); 
  const [tempNameInput, setTempNameInput] = useState(''); 
  const [workerName, setWorkerName] = useState('');
  
  // Login Gestor
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Dados do Inventário e Logs
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('bht_inventory');
    return saved ? JSON.parse(saved) : DEMO_ITEMS;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('bht_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Pedidos de Novos Produtos (Aprovação)
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('bht_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado da Interface do Gestor
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history' | 'requests' | 'stats'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Modal Criar/Editar (Gestor)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Geral', quantity: 0, minQuantity: 5, unit: 'Unidades'
  });

  // Estado da Interface do Funcionário
  const [pendingChanges, setPendingChanges] = useState({});
  const [reqData, setReqData] = useState({
    name: '', category: '', quantity: 1, unit: 'Garrafas'
  });

  // Persistência
  useEffect(() => {
    localStorage.setItem('bht_inventory', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('bht_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('bht_requests', JSON.stringify(requests));
  }, [requests]);

  // Ações de Autenticação
  const handleManagerLogin = (e) => {
    e.preventDefault();
    if (pinInput === '0000') {
      setRole('manager'); setPinError(false); setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleWorkerNameSubmit = (e) => {
    e.preventDefault();
    if (tempNameInput.trim()) {
      setWorkerName(tempNameInput.trim());
      setWorkerStep('sector'); 
    }
  };

  const selectSectorAndEnter = (sector) => {
    setActiveSector(sector);
    setRole('worker');
  };

  const handleLogout = () => {
    setRole(null); setWorkerName(''); setTempNameInput(''); setWorkerStep('name'); setPendingChanges({});
  };

  // Operações de Pedidos de Novos Produtos (Funcionário -> Gestor)
  const handleWorkerRequestSubmit = (e) => {
    e.preventDefault();
    if (!reqData.name.trim()) return;

    const newRequest = {
      id: Date.now().toString(),
      name: reqData.name.trim(),
      category: reqData.category.trim() || 'Geral',
      quantity: parseInt(reqData.quantity) || 1,
      minQuantity: 3,
      unit: reqData.unit,
      sector: activeSector,
      requestedBy: workerName,
      timestamp: new Date().toLocaleString('pt-PT'),
      status: 'pending' // 'pending' | 'approved' | 'rejected'
    };

    setRequests(prev => [newRequest, ...prev]);
    addLog('N/A', newRequest.name, 'Solicitação', `Novo produto solicitado (${newRequest.quantity} ${newRequest.unit})`, workerName, activeSector);
    setReqData({ name: '', category: '', quantity: 1, unit: 'Garrafas' });
    alert('Solicitação enviada com sucesso! Aguarda aprovação do Gestor.');
  };

  const handleApproveRequest = (request) => {
    const newItem = {
      id: Date.now().toString(),
      name: request.name,
      category: request.category,
      quantity: request.quantity,
      minQuantity: request.minQuantity,
      unit: request.unit,
      sector: request.sector
    };

    setItems(prev => [...prev, newItem]);
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
    addLog(newItem.id, newItem.name, 'Aprovação', `Aprovado pelo gestor (Solicitado por ${request.requestedBy})`, 'Gestor', request.sector);
  };

  const handleRejectRequest = (requestId, name, sector) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    addLog('N/A', name, 'Rejeição', `Solicitação de produto rejeitada`, 'Gestor', sector);
  };

  // Funções CRUD Gestor
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, category: item.category, quantity: item.quantity, minQuantity: item.minQuantity, unit: item.unit });
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: activeSector === 'bar' ? 'Vinho' : 'Secos', quantity: 0, minQuantity: 5, unit: 'Unidades' });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
      addLog(editingItem.id, editingItem.name, 'Edição', `Modificado pelo gestor`, 'Gestor');
    } else {
      const newItem = { id: Date.now().toString(), ...formData, sector: activeSector };
      setItems([...items, newItem]);
      addLog(newItem.id, newItem.name, 'Criação', `Stock inicial: ${newItem.quantity}`, 'Gestor');
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id, name) => {
    if (window.confirm(`Tem a certeza que deseja eliminar "${name}"?`)) {
      setItems(items.filter(i => i.id !== id));
      addLog(id, name, 'Remoção', `Eliminado pelo gestor`, 'Gestor');
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Isto irá repor os dados iniciais. Continuar?')) {
      setItems(DEMO_ITEMS); setLogs([]); setRequests([]);
      localStorage.removeItem('bht_inventory'); 
      localStorage.removeItem('bht_logs');
      localStorage.removeItem('bht_requests');
    }
  };

  // Funções Ajuste de Quantidade (Funcionário)
  const handlePendingChange = (id, delta) => {
    setPendingChanges(prev => {
      const current = prev[id] || 0;
      const updated = current + delta;
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: updated };
    });
  };

  const handleConfirmWorkerChanges = () => {
    if (Object.keys(pendingChanges).length === 0) return;
    const updatedItems = items.map(item => {
      if (pendingChanges[item.id]) {
        const delta = pendingChanges[item.id];
        const newQty = Math.max(0, item.quantity + delta);
        const actionType = delta > 0 ? 'Entrada' : 'Saída';
        const detailStr = `${delta > 0 ? '+' : ''}${delta} ${item.unit}`;
        addLog(item.id, item.name, actionType, detailStr, workerName, item.sector);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setItems(updatedItems);
    setPendingChanges({});
    alert('Movimentos registados no sistema.');
  };

  const addLog = (itemId, itemName, action, details, user, sector = activeSector) => {
    const newLog = {
      id: Date.now().toString(), timestamp: new Date().toLocaleString('pt-PT'),
      itemId, itemName, action, details, user, sector
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const exportToCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'inventory') {
      csvContent += "ID;Nome;Setor;Categoria;Quantidade;Qtd Minima;Unidade\n";
      items.filter(i => i.sector === activeSector).forEach(i => {
        csvContent += `${i.id};"${i.name}";${i.sector};"${i.category}";${i.quantity};${i.minQuantity};"${i.unit}"\n`;
      });
    } else {
      csvContent += "Data/Hora;Setor;Item;Acao;Detalhes;Utilizador\n";
      logs.filter(l => l.sector === activeSector).forEach(l => {
        csvContent += `"${l.timestamp}";${l.sector};"${l.itemName}";"${l.action}";"${l.details}";"${l.user}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BHT_${type}_${activeSector}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const currentSectorItems = items.filter(i => (i.sector || 'bar') === activeSector);
  const filteredItems = currentSectorItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const categories = ['Todos', ...new Set(currentSectorItems.map(i => i.category))];

  const pendingRequestsCount = requests.filter(r => r.status === 'pending' && r.sector === activeSector).length;

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------
  if (!role) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <img 
              src="/BHT_Gold_400x-100-removebg-preview.jpg" 
              alt="Boutique Hotel Teatro Logo" 
              className="h-24 object-contain mb-4 drop-shadow-md"
            />
            <h1 className="text-xl font-serif text-[#d5b266] tracking-widest font-semibold text-center uppercase">
              Boutique Hotel Teatro
            </h1>
            <div className="h-px w-12 bg-neutral-800 my-3"></div>
            <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-medium">
              Sistema de Inventário
            </p>
          </div>

          {workerStep === 'name' ? (
            <div className="space-y-8">
              <form onSubmit={handleManagerLogin} className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium mb-1">
                  <Lock className="w-4 h-4 text-[#b8923c]" /> Acesso Gestão
                </div>
                <input
                  type="password" placeholder="PIN de Acesso" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-[#b8923c] focus:ring-1 focus:ring-[#b8923c] transition-all"
                />
                {pinError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> PIN Incorreto.</p>}
                <button type="submit" className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-md transition-colors border border-neutral-700">
                  Entrar como Gestor
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-4 text-neutral-600 text-[10px] uppercase tracking-widest">Acesso Operacional</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <form onSubmit={handleWorkerNameSubmit} className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium mb-1">
                  <User className="w-4 h-4 text-[#b8923c]" /> Identificação do Funcionário
                </div>
                <input
                  type="text" placeholder="Nome Completo" value={tempNameInput} onChange={(e) => setTempNameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-[#b8923c] focus:ring-1 focus:ring-[#b8923c] transition-all"
                />
                <button type="submit" disabled={!tempNameInput.trim()} className="w-full py-3 bg-[#b8923c] hover:bg-[#a37f2d] disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 text-sm font-semibold rounded-md transition-colors">
                  Prosseguir
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in text-center">
              <p className="text-sm text-neutral-400 mb-2">Operador: <span className="text-white font-medium">{workerName}</span></p>
              <h2 className="text-lg font-medium text-[#d5b266] mb-8">Selecione o Setor Operacional</h2>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => selectSectorAndEnter('bar')} className="p-6 bg-neutral-950 border border-neutral-800 hover:border-[#b8923c] rounded-lg flex flex-col items-center gap-4 transition-all group">
                  <Wine className="w-8 h-8 text-neutral-400 group-hover:text-[#d5b266] transition-colors" />
                  <span className="font-medium text-neutral-300 group-hover:text-white text-sm tracking-wide">BAR</span>
                </button>
                <button onClick={() => selectSectorAndEnter('cozinha')} className="p-6 bg-neutral-950 border border-neutral-800 hover:border-[#b8923c] rounded-lg flex flex-col items-center gap-4 transition-all group">
                  <ChefHat className="w-8 h-8 text-neutral-400 group-hover:text-[#d5b266] transition-colors" />
                  <span className="font-medium text-neutral-300 group-hover:text-white text-sm tracking-wide">COZINHA</span>
                </button>
              </div>
              <button onClick={() => setWorkerStep('name')} className="mt-8 text-xs text-neutral-500 hover:text-white transition-colors">
                &larr; Alterar Identificação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HEADER AMPLIADO E MAIS VISÍVEL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans">
      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img src="/BHT_Gold_400x-100-removebg-preview.jpg" alt="Logo" className="h-11 object-contain" />
            <div className="hidden sm:block pl-5 border-l border-neutral-800">
              <h1 className="font-serif text-[#d5b266] text-base tracking-widest font-semibold uppercase">Boutique Hotel Teatro</h1>
              <p className="text-[11px] text-neutral-400 uppercase tracking-widest font-medium">
                {role === 'manager' ? 'Painel Executivo de Gestão' : 'Terminal Operacional'}
              </p>
            </div>
          </div>

          {/* Destaque à Direita: Modalidade e Botão Sair */}
          <div className="flex items-center gap-4">
            <div className="bg-neutral-900 border border-neutral-700/60 px-4 py-2 rounded-lg flex items-center gap-3 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                  {role === 'manager' ? 'Perfil: Gestor' : `Op: ${workerName}`}
                </div>
                <div className="text-xs font-bold text-[#d5b266] uppercase tracking-wide">
                  {role === 'manager' ? 'Acesso Total' : `Setor ${activeSector}`}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-neutral-700 hover:border-red-900/60 rounded-lg font-medium text-sm transition-all shadow-sm"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" /> 
              <span className="font-semibold">Sair</span>
            </button>
          </div>
        </div>

        {/* Sub-Header Gestor (Seletor de Setor) */}
        {role === 'manager' && (
          <div className="bg-neutral-900/50 border-t border-neutral-800 px-6">
            <div className="max-w-7xl mx-auto flex gap-6">
              <button onClick={() => setActiveSector('bar')} className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeSector === 'bar' ? 'border-[#b8923c] text-[#d5b266]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                <Wine className="w-4 h-4" /> Operações Bar
              </button>
              <button onClick={() => setActiveSector('cozinha')} className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeSector === 'cozinha' ? 'border-[#b8923c] text-[#d5b266]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                <ChefHat className="w-4 h-4" /> Operações Cozinha
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------
          MODO GESTOR
      ---------------------------------------------------- */}
      {role === 'manager' && (
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex bg-neutral-900 rounded-md p-1 border border-neutral-800">
              <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <Package className="w-4 h-4" /> Inventário
              </button>
              <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <History className="w-4 h-4" /> Movimentos
              </button>
              
              {/* Tab de Pedidos de Produtos Pendentes com Notificação */}
              <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <FileText className="w-4 h-4" /> Solicitações
                {pendingRequestsCount > 0 && (
                  <span className="ml-1 bg-[#b8923c] text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <TrendingUp className="w-4 h-4" /> Relatórios
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="flex items-center gap-3">
                <button onClick={() => exportToCSV('inventory')} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-medium rounded-md border border-neutral-700 transition-colors">
                  <Download className="w-4 h-4" /> Exportar
                </button>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-1.5 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 text-sm font-semibold rounded-md transition-colors">
                  <Plus className="w-4 h-4" /> Novo Registo
                </button>
              </div>
            )}
            {activeTab === 'history' && (
              <button onClick={() => exportToCSV('history')} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-medium rounded-md border border-neutral-700 transition-colors">
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
            )}
          </div>

          {/* TAB 1: INVENTÁRIO */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                  <input type="text" placeholder="Filtrar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c] transition-colors" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap border transition-colors ${categoryFilter === cat ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredItems.map(item => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <div key={item.id} className={`bg-neutral-900 border rounded-lg p-4 flex flex-col justify-between transition-colors ${isLow ? 'border-red-900/50 bg-red-950/10' : 'border-neutral-800 hover:border-neutral-700'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{item.category}</span>
                          {isLow && <span className="flex items-center gap-1 text-[10px] font-medium text-red-400"><AlertTriangle className="w-3 h-3" /> Reposição Necessária</span>}
                        </div>
                        <h3 className="text-sm font-medium text-white mb-2 leading-tight">{item.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className={`text-2xl font-semibold tabular-nums ${isLow ? 'text-red-400' : 'text-[#d5b266]'}`}>{item.quantity}</span>
                          <span className="text-xs text-neutral-500 lowercase">{item.unit}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-neutral-800">
                        <span className="text-[11px] text-neutral-500">Mínimo: {item.minQuantity}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleOpenModal(item)} className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-1.5 text-neutral-400 hover:text-red-400 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HISTÓRICO DE MOVIMENTOS */}
          {activeTab === 'history' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm text-neutral-400">
                <thead className="bg-neutral-950/50 text-xs uppercase font-medium text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Data / Hora</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Operação</th>
                    <th className="px-4 py-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {logs.filter(l => l.sector === activeSector).map(log => (
                    <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-4 py-3 text-xs tabular-nums">{log.timestamp}</td>
                      <td className="px-4 py-3 font-medium text-neutral-200">{log.itemName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase border ${
                          log.action === 'Entrada' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 
                          log.action === 'Saída' ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' : 
                          'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}>
                          {log.details}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{log.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: APROVAÇÃO DE SOLICITAÇÕES (GESTOR) */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-white mb-1">Solicitações de Novos Produtos pelos Funcionários</h3>
                <p className="text-xs text-neutral-400">
                  Os produtos aprovados entram automaticamente no inventário do setor correspondente.
                </p>
              </div>

              {requests.filter(r => r.sector === activeSector).length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-500 rounded-lg text-sm">
                  Nenhuma solicitação registada neste setor.
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.filter(r => r.sector === activeSector).map(req => (
                    <div key={req.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{req.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium">{req.category}</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          Quantidade pedida: <strong className="text-white">{req.quantity} {req.unit}</strong> | Solicitado por: <span className="text-neutral-300">{req.requestedBy}</span> ({req.timestamp})
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {req.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleApproveRequest(req)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Aprovar e Adicionar
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(req.id, req.name, req.sector)}
                              className="px-3 py-2 bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 text-neutral-400 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-4 h-4" /> Rejeitar
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs px-3 py-1 rounded font-semibold border ${
                            req.status === 'approved' 
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
                              : 'bg-red-950/30 text-red-400 border-red-900/50'
                          }`}>
                            {req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RELATÓRIOS */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                <div className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-2">Total Referências</div>
                <div className="text-3xl font-semibold text-white tabular-nums">{currentSectorItems.length}</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                <div className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-2">Alertas de Stock</div>
                <div className="text-3xl font-semibold text-red-400 tabular-nums">{currentSectorItems.filter(i => i.quantity <= i.minQuantity).length}</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                <div className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-2">Solicitações Pendentes</div>
                <div className="text-3xl font-semibold text-[#d5b266] tabular-nums">{pendingRequestsCount}</div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ----------------------------------------------------
          MODO FUNCIONÁRIO (POS + MODULO DE SOLICITAÇÃO)
      ---------------------------------------------------- */}
      {role === 'worker' && (
        <main className="flex-grow max-w-3xl w-full mx-auto p-4 pb-36">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium text-white tracking-wide">Terminal <span className="text-[#d5b266] uppercase">{activeSector}</span></h2>
              <p className="text-sm text-neutral-500">Registo de entradas e saídas de stock.</p>
            </div>
            <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              {activeSector === 'bar' ? <Wine className="w-5 h-5 text-neutral-400" /> : <ChefHat className="w-5 h-5 text-neutral-400" />}
            </div>
          </div>

          {/* Pesquisa */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input type="text" placeholder="Pesquisar referência existente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-[#b8923c] transition-colors" />
          </div>

          {/* Lista de Produtos para Operação */}
          <div className="space-y-2 mb-10">
            {filteredItems.map(item => {
              const pending = pendingChanges[item.id] || 0;
              return (
                <div key={item.id} className={`bg-neutral-900 border rounded-md p-3 flex items-center justify-between transition-colors ${pending !== 0 ? 'border-[#b8923c]/50 bg-[#b8923c]/5' : 'border-neutral-800'}`}>
                  <div className="flex-grow">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium mb-0.5">{item.category}</div>
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-neutral-600">{item.unit}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800">
                    <button onClick={() => handlePendingChange(item.id, -1)} className="w-12 h-10 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-lg flex items-center justify-center active:bg-neutral-700 transition-colors border border-transparent hover:border-neutral-700">-</button>
                    <div className="w-14 text-center flex flex-col justify-center">
                      <span className={`text-lg font-semibold tabular-nums leading-none ${pending > 0 ? 'text-emerald-400' : pending < 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                        {pending > 0 ? `+${pending}` : pending}
                      </span>
                    </div>
                    <button onClick={() => handlePendingChange(item.id, 1)} className="w-12 h-10 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-lg flex items-center justify-center active:bg-neutral-700 transition-colors border border-transparent hover:border-neutral-700">+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOVO MÓDULO: Pedir Novo Produto / Encomenda */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-[#d5b266] font-medium text-sm uppercase tracking-wider">
              <PlusCircle className="w-4 h-4" /> Requisitar Novo Produto / Encomenda
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Não encontra o produto na lista? Preencha os dados para enviar uma solicitação de adição ao Gestor.
            </p>

            <form onSubmit={handleWorkerRequestSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome do Produto (Ex: Tequila Don Julio)"
                  value={reqData.name}
                  onChange={(e) => setReqData({...reqData, name: e.target.value})}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-[#b8923c]"
                />
                <input
                  type="text"
                  placeholder="Categoria (Ex: Tequila, Frescos)"
                  value={reqData.category}
                  onChange={(e) => setReqData({...reqData, category: e.target.value})}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-[#b8923c]"
                />
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Qtd."
                  value={reqData.quantity}
                  onChange={(e) => setReqData({...reqData, quantity: e.target.value})}
                  className="w-24 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-[#b8923c]"
                />
                <select
                  value={reqData.unit}
                  onChange={(e) => setReqData({...reqData, unit: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-[#b8923c]"
                >
                  <option value="Garrafas">Garrafas</option>
                  <option value="Unidades">Unidades</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Caixas">Caixas</option>
                  <option value="Kg">Kg</option>
                  <option value="Litros">Litros</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-800 hover:bg-[#b8923c] hover:text-black text-white text-xs font-semibold rounded border border-neutral-700 transition-colors whitespace-nowrap"
                >
                  Enviar Pedido
                </button>
              </div>
            </form>

            {/* Minhas Solicitações Pendentes */}
            {requests.filter(r => r.sector === activeSector && r.requestedBy === workerName).length > 0 && (
              <div className="mt-5 pt-4 border-t border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> O seu histórico de solicitações neste setor:
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {requests.filter(r => r.sector === activeSector && r.requestedBy === workerName).map(req => (
                    <div key={req.id} className="flex items-center justify-between text-xs bg-neutral-950 px-3 py-2 rounded border border-neutral-800">
                      <span className="text-white font-medium">{req.name} ({req.quantity} {req.unit})</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        req.status === 'pending' ? 'text-amber-400 bg-amber-950/40 border border-amber-900/50' :
                        req.status === 'approved' ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50' :
                        'text-red-400 bg-red-950/40 border border-red-900/50'
                      }`}>
                        {req.status === 'pending' ? 'Aguarda Validação' : req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Movimentos Pendentes */}
          {Object.keys(pendingChanges).length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Movimentos Pendentes</div>
                  <div className="text-lg font-medium text-white">{Object.keys(pendingChanges).length} <span className="text-neutral-400 text-sm">referência(s)</span></div>
                </div>
                <button onClick={handleConfirmWorkerChanges} className="px-6 py-3 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-semibold rounded-md flex items-center gap-2 transition-colors">
                  Registar Sistema <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ----------------------------------------------------
          MODAL GESTOR (CRIAÇÃO/EDIÇÃO DIRECTA)
      ---------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-lg p-6 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-medium text-white mb-6 pb-4 border-b border-neutral-800">
              {editingItem ? 'Editar Referência' : 'Nova Referência'} <span className="text-neutral-500 text-sm font-normal">({activeSector})</span>
            </h2>
            
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Designação</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c]" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Categoria / Família</label>
                <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Stock Atual</label>
                  <input type="number" min="0" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Stock Mínimo</label>
                  <input type="number" min="0" required value={formData.minQuantity} onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c]" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Unidade de Medida</label>
                <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c]">
                  <option value="Garrafas">Garrafas</option><option value="Unidades">Unidades</option><option value="Sacos">Sacos</option><option value="Caixas">Caixas</option><option value="Kg">Kg</option><option value="Litros">Litros</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-neutral-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-semibold text-sm rounded-md transition-colors">Guardar Registo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
