import React, { useState, useEffect } from 'react';
import { 
  Wine, 
  ChefHat, 
  LogOut, 
  TrendingUp, 
  Package, 
  History, 
  Plus, 
  Minus, 
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
  PlusCircle
} from 'lucide-react';

// Dati iniziali di esempio (Demo)
const DEMO_ITEMS = [
  // BAR
  { id: '1', name: 'Gin Mare', category: 'Gin', quantity: 12, minQuantity: 5, unit: 'Garaffas', sector: 'bar' },
  { id: '2', name: 'Whisky Macallan 12', category: 'Whisky', quantity: 4, minQuantity: 3, unit: 'Garaffas', sector: 'bar' },
  { id: '3', name: 'Vinho Tinto Douro Reserva', category: 'Vinho', quantity: 24, minQuantity: 10, unit: 'Garaffas', sector: 'bar' },
  { id: '4', name: 'Cerveja Artesanal Super Bock', category: 'Cerveja', quantity: 48, minQuantity: 20, unit: 'Garrafas', sector: 'bar' },
  { id: '5', name: 'Água Tónica Premium', category: 'Sem Álcool', quantity: 60, minQuantity: 24, unit: 'Garrafas', sector: 'bar' },
  // COZINHA
  { id: '6', name: 'Azeite Virgem Extra 5L', category: 'Óleos & Condimentos', quantity: 8, minQuantity: 3, unit: 'Unidades', sector: 'cozinha' },
  { id: '7', name: 'Arroz Carolino 5kg', category: 'Secos', quantity: 15, minQuantity: 5, unit: 'Sacos', sector: 'cozinha' },
  { id: '8', name: 'Presunto Ibérico (Peça)', category: 'Charcutaria', quantity: 2, minQuantity: 1, unit: 'Peças', sector: 'cozinha' },
  { id: '9', name: 'Farinha Tipo 65 1kg', category: 'Secos', quantity: 25, minQuantity: 10, unit: 'Sacos', sector: 'cozinha' }
];

export default function App() {
  // Estado Global
  const [role, setRole] = useState(null); // 'manager' | 'worker' | null
  const [activeSector, setActiveSector] = useState('bar'); // 'bar' | 'cozinha'
  const [workerName, setWorkerName] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [tempWorkerName, setTempWorkerName] = useState('');
  
  // Dados da App
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('bht_inventory');
    return saved ? JSON.parse(saved) : DEMO_ITEMS;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('bht_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado da Interface de Gestor
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history' | 'stats'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Estado do Modal (Adicionar/Editar Item)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Geral',
    quantity: 0,
    minQuantity: 5,
    unit: 'Unidades'
  });

  // Estado da Interface de Funcionário (Ações Pendentes)
  const [pendingChanges, setPendingChanges] = useState({}); // { itemId: deltaValue }

  // Guardar no LocalStorage
  useEffect(() => {
    localStorage.setItem('bht_inventory', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('bht_logs', JSON.stringify(logs));
  }, [logs]);

  // Ações de Autenticação
  const handleManagerLogin = (e) => {
    e.preventDefault();
    if (pinInput === '0000') {
      setRole('manager');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleWorkerLogin = (e) => {
    e.preventDefault();
    if (tempWorkerName.trim()) {
      setWorkerName(tempWorkerName.trim());
    }
  };

  const selectSectorAndEnter = (sector) => {
    setActiveSector(sector);
    setRole('worker');
  };

  const handleLogout = () => {
    setRole(null);
    setWorkerName('');
    setPendingChanges({});
    setTempWorkerName('');
  };

  // Funções do Gestor (CRUD)
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        unit: item.unit
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: activeSector === 'bar' ? 'Vinho' : 'Secos',
        quantity: 0,
        minQuantity: 5,
        unit: 'Unidades'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      // Editar
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
      addLog(editingItem.id, editingItem.name, 'Edição', `Item modificado pelo gestor`, 'Gestor');
    } else {
      // Criar
      const newItem = {
        id: Date.now().toString(),
        ...formData,
        sector: activeSector
      };
      setItems([...items, newItem]);
      addLog(newItem.id, newItem.name, 'Criação', `Criado com stock inicial de ${newItem.quantity}`, 'Gestor');
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id, name) => {
    if (window.confirm(`Tem a certeza que deseja eliminar "${name}"?`)) {
      setItems(items.filter(i => i.id !== id));
      addLog(id, name, 'Remoção', `Item eliminado pelo gestor`, 'Gestor');
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Isto irá repor os dados de demonstração iniciais. Continuar?')) {
      setItems(DEMO_ITEMS);
      setLogs([]);
      localStorage.removeItem('bht_inventory');
      localStorage.removeItem('bht_logs');
    }
  };

  // Funções do Funcionário (+1, -1 e Confirmação)
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
    alert('Alterações registadas com sucesso!');
  };

  // Sistema de Logs
  const addLog = (itemId, itemName, action, details, user, sector = activeSector) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('pt-PT'),
      itemId,
      itemName,
      action,
      details,
      user,
      sector
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Exportação CSV
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtros de Itens
  const currentSectorItems = items.filter(i => (i.sector || 'bar') === activeSector);
  
  const filteredItems = currentSectorItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', ...new Set(currentSectorItems.map(i => i.category))];

  // ----------------------------------------------------
  // ECRÃ 1: AUTENTICAÇÃO (LOGIN)
  // ----------------------------------------------------
  if (!role) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-amber-500/20 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Logo BHT */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/BHT_Gold_400x-100-removebg-preview.jpg" 
              alt="Boutique Hotel Teatro Logo" 
              className="h-28 object-contain mb-3 drop-shadow-[0_4px_10px_rgba(217,119,6,0.3)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-serif text-amber-400 tracking-wide font-bold text-center">
              BOUTIQUE HOTEL TEATRO
            </h1>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
              Gestão de Stock & Inventário
            </p>
          </div>

          {/* Seleção de Perfil */}
          {!tempWorkerName ? (
            <div className="space-y-6">
              {/* Form Gestor */}
              <form onSubmit={handleManagerLogin} className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold">
                  <Lock className="w-5 h-5" />
                  <span>Acesso Gestor</span>
                </div>
                <input
                  type="password"
                  placeholder="PIN do Gestor (Base: 0000)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 mb-3"
                />
                {pinError && (
                  <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> PIN Incorreto. Tente "0000".
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                  Entrar como Gestor
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-4 text-neutral-500 text-xs uppercase tracking-wider">OU</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              {/* Form Funcionário */}
              <form onSubmit={handleWorkerLogin} className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 mb-3 text-neutral-200 font-semibold">
                  <User className="w-5 h-5" />
                  <span>Acesso Funcionário</span>
                </div>
                <input
                  type="text"
                  placeholder="Insira o seu Nome"
                  value={tempWorkerName}
                  onChange={(e) => setTempWorkerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 mb-3"
                />
                <button
                  type="submit"
                  disabled={!tempWorkerName.trim()}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors border border-neutral-600"
                >
                  Continuar
                </button>
              </form>
            </div>
          ) : (
            /* Seleção de Setor para o Funcionário */
            <div className="bg-neutral-950/80 p-5 rounded-xl border border-amber-500/30 text-center animate-fade-in">
              <p className="text-sm text-neutral-400 mb-1">Bem-vindo(a), <span className="text-amber-400 font-bold">{tempWorkerName}</span>!</p>
              <h2 className="text-lg font-semibold text-white mb-6">Em que setor vai trabalhar agora?</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => selectSectorAndEnter('bar')}
                  className="p-5 bg-neutral-900 border-2 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 rounded-xl flex flex-col items-center gap-3 transition-all group"
                >
                  <Wine className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white text-base">BAR</span>
                </button>

                <button
                  onClick={() => selectSectorAndEnter('cozinha')}
                  className="p-5 bg-neutral-900 border-2 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 rounded-xl flex flex-col items-center gap-3 transition-all group"
                >
                  <ChefHat className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white text-base">COZINHA</span>
                </button>
              </div>

              <button
                onClick={() => setTempWorkerName('')}
                className="mt-6 text-xs text-neutral-400 hover:text-white underline"
              >
                Voltar e alterar nome
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HEADER COMUM PARA GESTOR E FUNCIONÁRIO
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Structural Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/BHT_Gold_400x-100-removebg-preview.jpg" 
              alt="Logo" 
              className="h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="font-serif text-amber-400 font-bold text-base leading-tight">
                BOUTIQUE HOTEL TEATRO
              </h1>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                {role === 'manager' ? 'Painel de Gestão' : `Sessão: ${workerName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              role === 'manager' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
            }`}>
              {role === 'manager' ? 'Gestor' : `Funcionário (${activeSector.toUpperCase()})`}
            </span>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mudar de Setor (Exclusivo para o Gestor) */}
        {role === 'manager' && (
          <div className="bg-neutral-950 border-t border-neutral-800 py-2 px-4">
            <div className="max-w-6xl mx-auto flex justify-center">
              <div className="bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex gap-2">
                <button
                  onClick={() => setActiveSector('bar')}
                  className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeSector === 'bar'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Wine className="w-4 h-4" />
                  <span>BAR</span>
                </button>
                <button
                  onClick={() => setActiveSector('cozinha')}
                  className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeSector === 'cozinha'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span>COZINHA</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------
          MODO GESTOR
      ---------------------------------------------------- */}
      {role === 'manager' && (
        <main className="flex-grow max-w-6xl w-full mx-auto p-4 md:p-6">
          {/* Navegação por Separadores */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-neutral-800 pb-4">
            <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'inventory' ? 'bg-neutral-800 text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" /> Stock ({activeSector.toUpperCase()})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'history' ? 'bg-neutral-800 text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" /> Histórico de Movimentos
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'stats' ? 'bg-neutral-800 text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Estatísticas
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV('inventory')}
                  className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/10"
                >
                  <Plus className="w-4 h-4" /> Adicionar Item
                </button>
              </div>
            )}

            {activeTab === 'history' && (
              <button
                onClick={() => exportToCSV('history')}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-sm font-semibold rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" /> Exportar Relatório CSV
              </button>
            )}
          </div>

          {/* TAB 1: INVENTÁRIO (GESTOR) */}
          {activeTab === 'inventory' && (
            <div>
              {/* Barra de Pesquisa e Filtros */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-colors ${
                        categoryFilter === cat
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela / Lista de Gestão */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                  <p className="text-neutral-400 mb-4">Nenhum item encontrado no setor {activeSector.toUpperCase()}.</p>
                  <button
                    onClick={handleResetDemoData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-amber-400 hover:bg-neutral-700 rounded-lg text-sm border border-neutral-700"
                  >
                    <RefreshCw className="w-4 h-4" /> Carregar Dados de Exemplo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => {
                    const isLow = item.quantity <= item.minQuantity;
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-neutral-900 border p-5 rounded-2xl flex flex-col justify-between transition-all ${
                          isLow ? 'border-red-500/40 bg-red-950/10' : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-medium">
                              {item.category}
                            </span>
                            {isLow && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                <AlertTriangle className="w-3 h-3" /> Stock Baixo
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                          <div className="text-2xl font-black text-amber-400 my-2">
                            {item.quantity} <span className="text-sm font-normal text-neutral-400">{item.unit}</span>
                          </div>
                          <p className="text-xs text-neutral-500">Mínimo necessário: {item.minQuantity} {item.unit}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-800/80">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-neutral-400 hover:text-amber-400 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTÓRICO (GESTOR) */}
          {activeTab === 'history' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="p-4 bg-neutral-950/50 border-b border-neutral-800 font-bold text-amber-400 text-sm uppercase tracking-wider">
                Registos de Atividade ({activeSector.toUpperCase()})
              </div>
              {logs.filter(l => l.sector === activeSector).length === 0 ? (
                <div className="p-8 text-center text-neutral-500">Sem registos de atividade neste setor.</div>
              ) : (
                <div className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto">
                  {logs.filter(l => l.sector === activeSector).map(log => (
                    <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-800/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{log.itemName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            log.action === 'Entrada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            log.action === 'Saída' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">{log.details}</p>
                      </div>
                      <div className="text-right sm:text-right text-xs">
                        <span className="text-neutral-300 font-medium block">Por: {log.user}</span>
                        <span className="text-neutral-500">{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ESTATÍSTICAS (GESTOR) */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                <div className="text-neutral-400 text-sm font-medium mb-1">Total de Produtos ({activeSector.toUpperCase()})</div>
                <div className="text-3xl font-black text-amber-400">{currentSectorItems.length}</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                <div className="text-neutral-400 text-sm font-medium mb-1">Itens em Stock Baixo</div>
                <div className="text-3xl font-black text-red-400">
                  {currentSectorItems.filter(i => i.quantity <= i.minQuantity).length}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                <div className="text-neutral-400 text-sm font-medium mb-1">Total de Movimentos Registados</div>
                <div className="text-3xl font-black text-white">
                  {logs.filter(l => l.sector === activeSector).length}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ----------------------------------------------------
          MODO FUNCIONÁRIO (SEM VISUALIZAÇÃO DE STOCK TOTAL)
      ---------------------------------------------------- */}
      {role === 'worker' && (
        <main className="flex-grow max-w-4xl w-full mx-auto p-4 pb-28">
          {/* Instruções para o Funcionário */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl mb-6">
            <h2 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
              Painel de Controlo - {activeSector.toUpperCase()}
            </h2>
            <p className="text-xs text-neutral-300">
              Selecione as quantidades que retirou ou adicionou utilizando os botões <span className="text-amber-400 font-bold">+</span> e <span className="text-amber-400 font-bold">-</span>. No final, clique em <strong>Confirmar Alterações</strong> no fundo do ecrã.
            </p>
          </div>

          {/* Campo de Pesquisa */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Lista de Produtos para Controlo rápido */}
          <div className="space-y-3">
            {filteredItems.map(item => {
              const pending = pendingChanges[item.id] || 0;
              return (
                <div 
                  key={item.id} 
                  className={`bg-neutral-900 border p-4 rounded-xl flex items-center justify-between transition-colors ${
                    pending !== 0 ? 'border-amber-500/60 bg-amber-500/5' : 'border-neutral-800'
                  }`}
                >
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium uppercase">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{item.name}</h3>
                    <p className="text-xs text-neutral-500">Unidade: {item.unit}</p>
                  </div>

                  {/* Controlo do Ajuste (+1 / +2 / -1 / -2) */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                      <button
                        onClick={() => handlePendingChange(item.id, -1)}
                        className="w-10 h-10 rounded-md bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-lg flex items-center justify-center transition-colors active:scale-95"
                      >
                        -
                      </button>
                      
                      <div className="w-12 text-center">
                        <span className={`text-lg font-black ${
                          pending > 0 ? 'text-emerald-400' : pending < 0 ? 'text-red-400' : 'text-neutral-500'
                        }`}>
                          {pending > 0 ? `+${pending}` : pending}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePendingChange(item.id, 1)}
                        className="w-10 h-10 rounded-md bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-lg flex items-center justify-center transition-colors active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra Flutuante Inferior para Confirmar Alterações */}
          {Object.keys(pendingChanges).length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/95 backdrop-blur-md border-t border-amber-500/30 z-40">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block">Itens Modificados:</span>
                  <span className="text-lg font-bold text-white">{Object.keys(pendingChanges).length} produto(s)</span>
                </div>
                <button
                  onClick={handleConfirmWorkerChanges}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Check className="w-5 h-5" /> Confirmar Alterações
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ----------------------------------------------------
          MODAL CRIAR/EDITAR ITEM (GESTOR)
      ---------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-amber-400 mb-4">
              {editingItem ? 'Editar Item' : 'Adicionar Novo Item'} ({activeSector.toUpperCase()})
            </h2>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Gin Mare / Azeite Virgem"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Categoria</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Gin, Vinho, Secos, Frescos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Quantidade Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Mínimo de Alerta</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Unidade de Medida</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Garrafas">Garrafas</option>
                  <option value="Unidades">Unidades</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Caixas">Caixas</option>
                  <option value="Kg">Kg</option>
                  <option value="Litros">Litros</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}