import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { 
  Wine, 
  ChefHat, 
  Sparkles,
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
  FileText,
  Mail,
  BellRing,
  Send
} from 'lucide-react';

// ==========================================
// CONFIGURAZIONE NOTIFICHE EMAIL
// ==========================================
const TARGET_HOTEL_EMAIL = "geral@boutiquehotelteatro.net";

// INSERISCI QUI LE TUE 3 CHIAVI REALI DI EMAILJS
const EMAILJS_SERVICE_ID = "service_kbpv5sj";     
const EMAILJS_TEMPLATE_ID = "template_pr9t6hr";   
const EMAILJS_PUBLIC_KEY = "rMnkpcpHyCji5tXug";     

const INITIAL_DEMO_ITEMS = [
  // BAR
  { id: '1', name: 'Gin Mare', category: 'Gin', quantity: 12, minQuantity: 5, unit: 'Garrafas', sector: 'bar' },
  { id: '2', name: 'Whisky Macallan 12', category: 'Whisky', quantity: 4, minQuantity: 3, unit: 'Garrafas', sector: 'bar' },
  { id: '3', name: 'Vinho Tinto Douro Reserva', category: 'Vinho', quantity: 24, minQuantity: 10, unit: 'Garrafas', sector: 'bar' },
  { id: '4', name: 'Cerveja Artesanal Super Bock', category: 'Cerveja', quantity: 48, minQuantity: 20, unit: 'Garrafas', sector: 'bar' },
  { id: '5', name: 'Água Tónica Premium', category: 'Sem Álcool', quantity: 60, minQuantity: 24, unit: 'Garrafas', sector: 'bar' },
  // COZINHA
  { id: '6', name: 'Azeite Virgem Extra 5L', category: 'Óleos & Condimentos', quantity: 8, minQuantity: 3, unit: 'Unidades', sector: 'cozinha' },
  { id: '7', name: 'Arroz Carolino 5kg', category: 'Secos', quantity: 15, minQuantity: 5, unit: 'Sacos', sector: 'cozinha' },
  { id: '8', name: 'Presunto Ibérico (Peça)', category: 'Charcutaria', quantity: 2, minQuantity: 1, unit: 'Peças', sector: 'cozinha' },
  { id: '9', name: 'Farinha Tipo 65 1kg', category: 'Secos', quantity: 25, minQuantity: 10, unit: 'Sacos', sector: 'cozinha' },
  // HOUSEKEEPING
  { id: '10', name: 'Toalhas de Banho Grandes', category: 'Têxteis', quantity: 35, minQuantity: 15, unit: 'Unidades', sector: 'hk' },
  { id: '11', name: 'Amenities Gel de Banho 30ml', category: 'Amenities', quantity: 120, minQuantity: 40, unit: 'Unidades', sector: 'hk' },
  { id: '12', name: 'Papel Higiénico Premium', category: 'Higiene', quantity: 65, minQuantity: 25, unit: 'Rolos', sector: 'hk' },
  { id: '13', name: 'Lençóis Cama Casal', category: 'Têxteis', quantity: 20, minQuantity: 8, unit: 'Unidades', sector: 'hk' }
];

export default function App() {
  const [role, setRole] = useState(() => localStorage.getItem('bht_session_role') || null); 
  const [activeSector, setActiveSector] = useState(() => localStorage.getItem('bht_session_sector') || 'bar'); 
  const [workerName, setWorkerName] = useState(() => localStorage.getItem('bht_session_worker_name') || '');

  const [workerStep, setWorkerStep] = useState('name'); 
  const [tempNameInput, setTempNameInput] = useState(''); 
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [requests, setRequests] = useState([]);
  
  const [alertedItems, setAlertedItems] = useState(() => {
    const saved = localStorage.getItem('bht_alerted_items');
    return saved ? JSON.parse(saved) : {};
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Geral', quantity: 0, minQuantity: 5, unit: 'Unidades'
  });

  const [pendingChanges, setPendingChanges] = useState({});
  const [reqData, setReqData] = useState({
    name: '', category: '', quantity: 1, unit: 'Unidades'
  });

  // Salva stato di login locale
  useEffect(() => {
    if (role) {
      localStorage.setItem('bht_session_role', role);
      localStorage.setItem('bht_session_sector', activeSector);
      localStorage.setItem('bht_session_worker_name', workerName);
    } else {
      localStorage.removeItem('bht_session_role');
      localStorage.removeItem('bht_session_sector');
      localStorage.removeItem('bht_session_worker_name');
    }
  }, [role, activeSector, workerName]);

  useEffect(() => {
    localStorage.setItem('bht_alerted_items', JSON.stringify(alertedItems));
  }, [alertedItems]);

  // Sincronizzazione Firebase Real-Time
  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, "bht_inventory"), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_DEMO_ITEMS.forEach(it => {
          setDoc(doc(db, "bht_inventory", it.id), it);
        });
      } else {
        const cloudItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(cloudItems);
      }
    }, (error) => console.error("Errore Firestore:", error));

    const unsubLogs = onSnapshot(collection(db, "bht_logs"), (snapshot) => {
      const cloudLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      cloudLogs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLogs(cloudLogs);
    });

    const unsubRequests = onSnapshot(collection(db, "bht_requests"), (snapshot) => {
      const cloudReqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      cloudReqs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRequests(cloudReqs);
    });

    return () => {
      unsubItems();
      unsubLogs();
      unsubRequests();
    };
  }, []);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const getSectorLabel = (sec) => {
    if (sec === 'hk') return 'Housekeeping';
    if (sec === 'cozinha') return 'Cozinha';
    return 'Bar';
  };

  // Funzione Invio Email con EmailJS nativo
  const sendEmailAlert = async (productName, sector, currentQty, minQty, unit) => {
    if (EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" || !EMAILJS_SERVICE_ID) {
      alert("⚠️ Chaves do EmailJS não configuradas no ficheiro src/App.jsx. Substitua YOUR_SERVICE_ID pelas suas chaves reais.");
      return false;
    }

    try {
      showToast(`A enviar email para ${TARGET_HOTEL_EMAIL}...`);
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: TARGET_HOTEL_EMAIL,
          product_name: productName,
          sector: sector,
          current_quantity: currentQty,
          min_quantity: minQty,
          unit: unit
        },
        EMAILJS_PUBLIC_KEY
      );
      showToast(`✉️ Email enviada com sucesso para ${TARGET_HOTEL_EMAIL}!`);
      return true;
    } catch (error) {
      console.error("Falha detalhada do EmailJS:", error);
      alert(`Erro no envio de Email: ${error?.text || error?.message || "Verifique as chaves e o template no EmailJS"}`);
      return false;
    }
  };

  // Pulsante Test Manuale per il Gestore
  const handleTestEmail = () => {
    sendEmailAlert("PRODUTO TESTE", getSectorLabel(activeSector), 2, 5, "Unidades");
  };

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
    setRole(null); 
    setWorkerName(''); 
    setTempNameInput(''); 
    setWorkerStep('name'); 
    setPendingChanges({});
  };

  const addLogCloud = async (itemId, itemName, action, details, user, sector = activeSector) => {
    try {
      await addDoc(collection(db, "bht_logs"), {
        itemId,
        itemName,
        action,
        details,
        user,
        sector,
        timestamp: new Date().toLocaleString('pt-PT'),
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Errore salvataggio log:", err);
    }
  };

  const handleWorkerRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqData.name.trim()) return;

    try {
      await addDoc(collection(db, "bht_requests"), {
        name: reqData.name.trim(),
        category: reqData.category.trim() || 'Geral',
        quantity: parseInt(reqData.quantity) || 1,
        minQuantity: 5,
        unit: reqData.unit,
        sector: activeSector,
        requestedBy: workerName,
        timestamp: new Date().toLocaleString('pt-PT'),
        createdAt: Date.now(),
        status: 'pending'
      });

      addLogCloud('N/A', reqData.name.trim(), 'Solicitação', `Solicitado: ${reqData.quantity} ${reqData.unit}`, workerName, activeSector);
      setReqData({ name: '', category: '', quantity: 1, unit: 'Unidades' });
      showToast('Solicitação registada no Cloud.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      const newRef = doc(collection(db, "bht_inventory"));
      await setDoc(newRef, {
        id: newRef.id,
        name: request.name,
        category: request.category,
        quantity: request.quantity,
        minQuantity: request.minQuantity,
        unit: request.unit,
        sector: request.sector
      });

      await updateDoc(doc(db, "bht_requests", request.id), { status: 'approved' });
      addLogCloud(newRef.id, request.name, 'Aprovação', `Aprovado por Gestor (Pedido por ${request.requestedBy})`, 'Gestor', request.sector);
      showToast('Item aprovado e adicionado ao stock.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId, name, sector) => {
    try {
      await updateDoc(doc(db, "bht_requests", requestId), { status: 'rejected' });
      addLogCloud('N/A', name, 'Rejeição', `Solicitação rejeitada`, 'Gestor', sector);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, category: item.category, quantity: item.quantity, minQuantity: item.minQuantity, unit: item.unit });
    } else {
      setEditingItem(null);
      setFormData({ 
        name: '', 
        category: activeSector === 'bar' ? 'Vinho' : activeSector === 'cozinha' ? 'Secos' : 'Têxteis', 
        quantity: 0, 
        minQuantity: 5, 
        unit: 'Unidades' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingItem) {
        await updateDoc(doc(db, "bht_inventory", editingItem.id), { ...formData });
        addLogCloud(editingItem.id, editingItem.name, 'Edição', `Modificado pelo gestor`, 'Gestor');
      } else {
        const newRef = doc(collection(db, "bht_inventory"));
        await setDoc(newRef, {
          id: newRef.id,
          ...formData,
          sector: activeSector
        });
        addLogCloud(newRef.id, formData.name, 'Criação', `Stock inicial: ${formData.quantity}`, 'Gestor');
      }
      setIsModalOpen(false);
      showToast('Guardado no Cloud com sucesso!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (window.confirm(`Tem a certeza que deseja eliminar "${name}" da base de dados?`)) {
      try {
        await deleteDoc(doc(db, "bht_inventory", id));
        addLogCloud(id, name, 'Remoção', `Eliminado pelo gestor`, 'Gestor');
        showToast('Item removido da base de dados.');
      } catch (err) {
        console.error(err);
      }
    }
  };

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

  // Conferma movimenti e controllo scorta minima con email
  const handleConfirmWorkerChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    const newAlerts = { ...alertedItems };

    try {
      for (const id of Object.keys(pendingChanges)) {
        const item = items.find(i => i.id === id);
        if (!item) continue;

        const delta = pendingChanges[id];
        const newQty = Math.max(0, item.quantity + delta);
        const actionType = delta > 0 ? 'Entrada' : 'Saída';
        const detailStr = `${delta > 0 ? '+' : ''}${delta} ${item.unit}`;

        // Aggiorna Firebase
        await updateDoc(doc(db, "bht_inventory", id), { quantity: newQty });
        addLogCloud(item.id, item.name, actionType, detailStr, workerName, item.sector);

        // Controllo e invio email se tocca o scende sotto la scorta minima
        if (newQty <= item.minQuantity) {
          if (!newAlerts[item.id]) {
            sendEmailAlert(item.name, getSectorLabel(item.sector), newQty, item.minQuantity, item.unit);
            newAlerts[item.id] = true;
          }
        } else {
          delete newAlerts[item.id];
        }
      }

      setAlertedItems(newAlerts);
      setPendingChanges({});
      showToast('Movimentos gravados com sucesso!');
    } catch (err) {
      console.error(err);
      showToast("Erro ao gravar movimentos.");
    }
  };

  const exportToCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'inventory') {
      csvContent += "ID;Nome;Setor;Categoria;Quantidade;Qtd Minima;Unidade\n";
      items.filter(i => i.sector === activeSector).forEach(i => {
        csvContent += `${i.id};"${i.name}";${getSectorLabel(i.sector)};"${i.category}";${i.quantity};${i.minQuantity};"${i.unit}"\n`;
      });
    } else {
      csvContent += "Data/Hora;Setor;Item;Acao;Detalhes;Utilizador\n";
      logs.filter(l => l.sector === activeSector).forEach(l => {
        csvContent += `"${l.timestamp}";${getSectorLabel(l.sector)};"${l.itemName}";"${l.action}";"${l.details}";"${l.user}"\n`;
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

  if (!role) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-center items-center p-3 sm:p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-5 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <img 
              src="/BHT_Gold_400x-100-removebg-preview.jpg" 
              alt="Boutique Hotel Teatro Logo" 
              className="h-20 sm:h-24 object-contain mb-3 sm:mb-4 drop-shadow-md"
            />
            <h1 className="text-lg sm:text-xl font-serif text-[#d5b266] tracking-widest font-semibold text-center uppercase">
              Boutique Hotel Teatro
            </h1>
            <div className="h-px w-12 bg-neutral-800 my-2 sm:my-3"></div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 uppercase tracking-widest font-medium">
              Gestão de Stock (Google Cloud)
            </p>
          </div>

          {workerStep === 'name' ? (
            <div className="space-y-6 sm:space-y-8">
              <form onSubmit={handleManagerLogin} className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-400 text-xs sm:text-sm font-medium mb-1">
                  <Lock className="w-4 h-4 text-[#b8923c]" /> Acesso Gestão
                </div>
                <input
                  type="password" placeholder="PIN de Acesso (Base: 0000)" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-md bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-[#b8923c] text-sm"
                />
                {pinError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> PIN Incorreto.</p>}
                <button type="submit" className="w-full py-2.5 sm:py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-medium rounded-md transition-colors border border-neutral-700">
                  Entrar como Gestor
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-3 sm:mx-4 text-neutral-600 text-[10px] uppercase tracking-widest">Terminal Operacional</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <form onSubmit={handleWorkerNameSubmit} className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-400 text-xs sm:text-sm font-medium mb-1">
                  <User className="w-4 h-4 text-[#b8923c]" /> Identificação do Funcionário
                </div>
                <input
                  type="text" placeholder="Nome Completo" value={tempNameInput} onChange={(e) => setTempNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-md bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-[#b8923c] text-sm"
                />
                <button type="submit" disabled={!tempNameInput.trim()} className="w-full py-2.5 sm:py-3 bg-[#b8923c] hover:bg-[#a37f2d] disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 text-xs sm:text-sm font-semibold rounded-md transition-colors">
                  Prosseguir
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in text-center">
              <p className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2">Operador: <span className="text-white font-medium">{workerName}</span></p>
              <h2 className="text-base sm:text-lg font-medium text-[#d5b266] mb-5 sm:mb-6">Selecione o Departamento</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button onClick={() => selectSectorAndEnter('bar')} className="p-4 sm:p-5 bg-neutral-950 border border-neutral-800 hover:border-[#b8923c] rounded-lg flex flex-row sm:flex-col items-center justify-center gap-3 transition-all">
                  <Wine className="w-6 h-6 sm:w-7 sm:h-7 text-[#d5b266]" />
                  <span className="font-semibold text-white text-xs tracking-wider">BAR</span>
                </button>
                <button onClick={() => selectSectorAndEnter('cozinha')} className="p-4 sm:p-5 bg-neutral-950 border border-neutral-800 hover:border-[#b8923c] rounded-lg flex flex-row sm:flex-col items-center justify-center gap-3 transition-all">
                  <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-[#d5b266]" />
                  <span className="font-semibold text-white text-xs tracking-wider">COZINHA</span>
                </button>
                <button onClick={() => selectSectorAndEnter('hk')} className="p-4 sm:p-5 bg-neutral-950 border border-neutral-800 hover:border-[#b8923c] rounded-lg flex flex-row sm:flex-col items-center justify-center gap-3 transition-all">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#d5b266]" />
                  <span className="font-semibold text-white text-xs tracking-wider">HOUSEKEEPING</span>
                </button>
              </div>
              <button onClick={() => setWorkerStep('name')} className="mt-6 text-xs text-neutral-500 hover:text-white transition-colors">
                &larr; Alterar Identificação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans">
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-[#b8923c] text-neutral-950 px-4 py-3 rounded-lg shadow-xl font-medium text-xs sm:text-sm flex items-center gap-2 border border-amber-300">
          <BellRing className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img src="/BHT_Gold_400x-100-removebg-preview.jpg" alt="Logo" className="h-8 sm:h-10 object-contain flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-[#d5b266] text-xs sm:text-sm tracking-wider uppercase truncate font-semibold">
                Boutique Hotel Teatro
              </h1>
              <p className="text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-widest hidden xs:block truncate">
                {role === 'manager' ? 'Painel Gestão Cloud' : `Operador: ${workerName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#d5b266] uppercase block leading-none">
                  {role === 'manager' ? 'Gestor' : getSectorLabel(activeSector)}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 bg-neutral-900 hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-900/60 rounded-md font-medium text-xs transition-colors"
              title="Terminar Sessão"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {role === 'manager' && (
          <div className="bg-neutral-900/60 border-t border-neutral-800 px-3 sm:px-6 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto flex gap-4 sm:gap-8 whitespace-nowrap min-w-max">
              <button onClick={() => setActiveSector('bar')} className={`flex items-center gap-1.5 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-medium transition-colors ${activeSector === 'bar' ? 'border-[#b8923c] text-[#d5b266]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                <Wine className="w-3.5 h-3.5" /> BAR
              </button>
              <button onClick={() => setActiveSector('cozinha')} className={`flex items-center gap-1.5 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-medium transition-colors ${activeSector === 'cozinha' ? 'border-[#b8923c] text-[#d5b266]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                <ChefHat className="w-3.5 h-3.5" /> COZINHA
              </button>
              <button onClick={() => setActiveSector('hk')} className={`flex items-center gap-1.5 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-medium transition-colors ${activeSector === 'hk' ? 'border-[#b8923c] text-[#d5b266]' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                <Sparkles className="w-3.5 h-3.5" /> HOUSEKEEPING
              </button>
            </div>
          </div>
        )}
      </header>

      {/* GESTOR */}
      {role === 'manager' && (
        <main className="flex-grow max-w-7xl w-full mx-auto p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex bg-neutral-900 rounded-md p-1 border border-neutral-800 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <Package className="w-3.5 h-3.5" /> Inventário
              </button>
              <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <History className="w-3.5 h-3.5" /> Movimentos
              </button>
              <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <FileText className="w-3.5 h-3.5" /> Solicitações
                {pendingRequestsCount > 0 && (
                  <span className="ml-1 bg-[#b8923c] text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}>
                <TrendingUp className="w-3.5 h-3.5" /> Relatórios
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="flex flex-wrap items-center gap-2">
                {/* PULSANTE TESTE EMAIL */}
                <button 
                  onClick={handleTestEmail} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-xs font-medium rounded-md border border-amber-500/40 transition-colors"
                  title="Testar envio de email via EmailJS"
                >
                  <Send className="w-3.5 h-3.5" /> Testar Email
                </button>

                <button onClick={() => exportToCSV('inventory')} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-md border border-neutral-700 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Exportar
                </button>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 text-xs font-semibold rounded-md transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Novo Item
                </button>
              </div>
            )}
            {activeTab === 'history' && (
              <button onClick={() => exportToCSV('history')} className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-md border border-neutral-700 transition-colors">
                <Download className="w-3.5 h-3.5" /> Exportar Relatório CSV
              </button>
            )}
          </div>

          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                  <input type="text" placeholder="Filtrar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-xs sm:text-sm text-white focus:outline-none focus:border-[#b8923c]" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap border transition-colors ${categoryFilter === cat ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredItems.map(item => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <div key={item.id} className={`bg-neutral-900 border rounded-lg p-3.5 flex flex-col justify-between transition-colors ${isLow ? 'border-red-900/50 bg-red-950/10' : 'border-neutral-800'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">{item.category}</span>
                          {isLow && (
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/50">
                              <AlertTriangle className="w-3 h-3" /> Mínimo Atingido
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1.5">{item.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl sm:text-2xl font-bold tabular-nums ${isLow ? 'text-red-400' : 'text-[#d5b266]'}`}>{item.quantity}</span>
                          <span className="text-xs text-neutral-500 lowercase">{item.unit}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-neutral-800 text-xs">
                        <span className="text-[10px] text-neutral-500">Mínimo: {item.minQuantity} {item.unit}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleOpenModal(item)} className="p-1.5 text-neutral-400 hover:text-white rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-1.5 text-neutral-400 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-neutral-400 min-w-[500px]">
                <thead className="bg-neutral-950/60 text-[10px] sm:text-xs uppercase font-medium text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5">Data / Hora</th>
                    <th className="px-3 sm:px-4 py-2.5">Produto</th>
                    <th className="px-3 sm:px-4 py-2.5">Operação</th>
                    <th className="px-3 sm:px-4 py-2.5">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {logs.filter(l => l.sector === activeSector).map(log => (
                    <tr key={log.id} className="hover:bg-neutral-800/30">
                      <td className="px-3 sm:px-4 py-2.5 text-xs tabular-nums">{log.timestamp}</td>
                      <td className="px-3 sm:px-4 py-2.5 font-medium text-neutral-200">{log.itemName}</td>
                      <td className="px-3 sm:px-4 py-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          log.action === 'Entrada' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 
                          log.action === 'Saída' ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' : 
                          'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}>
                          {log.details}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-xs">{log.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {requests.filter(r => r.sector === activeSector).length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-500 rounded-lg text-xs sm:text-sm">
                  Nenhuma solicitação registada no departamento de {getSectorLabel(activeSector)}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {requests.filter(r => r.sector === activeSector).map(req => (
                    <div key={req.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{req.name}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">{req.category}</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          Qtd: <strong className="text-white">{req.quantity} {req.unit}</strong> | Solicitado por: {req.requestedBy}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveRequest(req)} className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                            </button>
                            <button onClick={() => handleRejectRequest(req.id, req.name, req.sector)} className="flex-1 sm:flex-none px-3 py-1.5 bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 text-neutral-400 text-xs font-semibold rounded flex items-center justify-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Rejeitar
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs px-2.5 py-1 rounded font-semibold border ${
                            req.status === 'approved' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'
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

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-neutral-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Total Referências</div>
                <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{currentSectorItems.length}</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-neutral-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Stock em Alerta</div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400 tabular-nums">{currentSectorItems.filter(i => i.quantity <= i.minQuantity).length}</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-neutral-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Solicitações Pendentes</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#d5b266] tabular-nums">{pendingRequestsCount}</div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* FUNCIONÁRIO */}
      {role === 'worker' && (
        <main className="flex-grow max-w-2xl w-full mx-auto p-3 sm:p-4 pb-36">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Terminal <span className="text-[#d5b266] uppercase">{getSectorLabel(activeSector)}</span></h2>
              <p className="text-xs text-neutral-400">Registo rápido de entradas e saídas.</p>
            </div>
            <div className="w-9 h-9 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              {activeSector === 'bar' ? <Wine className="w-5 h-5 text-neutral-400" /> : activeSector === 'cozinha' ? <ChefHat className="w-5 h-5 text-neutral-400" /> : <Sparkles className="w-5 h-5 text-neutral-400" />}
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input type="text" placeholder="Pesquisar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-white focus:outline-none focus:border-[#b8923c]" />
          </div>

          <div className="space-y-2 mb-8">
            {filteredItems.map(item => {
              const pending = pendingChanges[item.id] || 0;
              return (
                <div key={item.id} className={`bg-neutral-900 border rounded-lg p-3 flex items-center justify-between gap-2 transition-colors ${pending !== 0 ? 'border-[#b8923c]/60 bg-[#b8923c]/5' : 'border-neutral-800'}`}>
                  <div className="min-w-0 flex-grow pr-2">
                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-semibold">{item.category}</div>
                    <div className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-neutral-500">{item.unit}</div>
                  </div>

                  <div className="flex items-center bg-neutral-950 p-1 rounded-md border border-neutral-800 flex-shrink-0">
                    <button 
                      onClick={() => handlePendingChange(item.id, -1)} 
                      className="w-11 h-11 sm:w-12 sm:h-10 rounded bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-200 font-bold text-xl flex items-center justify-center touch-manipulation select-none"
                    >
                      -
                    </button>
                    <div className="w-11 text-center">
                      <span className={`text-base font-bold tabular-nums ${pending > 0 ? 'text-emerald-400' : pending < 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                        {pending > 0 ? `+${pending}` : pending}
                      </span>
                    </div>
                    <button 
                      onClick={() => handlePendingChange(item.id, 1)} 
                      className="w-11 h-11 sm:w-12 sm:h-10 rounded bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-200 font-bold text-xl flex items-center justify-center touch-manipulation select-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-1.5 mb-1.5 text-[#d5b266] font-semibold text-xs sm:text-sm uppercase tracking-wider">
              <PlusCircle className="w-4 h-4" /> Requisitar Novo Produto / Encomenda
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">
              Produto não listado? Preencha os campos abaixo para solicitar a inclusão ao Gestor.
            </p>

            <form onSubmit={handleWorkerRequestSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text" required placeholder="Designação do Produto" value={reqData.name} onChange={(e) => setReqData({...reqData, name: e.target.value})}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-[#b8923c]"
                />
                <input
                  type="text" placeholder="Categoria (ex: Bebidas, Têxteis)" value={reqData.category} onChange={(e) => setReqData({...reqData, category: e.target.value})}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-[#b8923c]"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number" min="1" required placeholder="Qtd" value={reqData.quantity} onChange={(e) => setReqData({...reqData, quantity: e.target.value})}
                  className="w-20 px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-[#b8923c]"
                />
                <select
                  value={reqData.unit} onChange={(e) => setReqData({...reqData, unit: e.target.value})}
                  className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-[#b8923c]"
                >
                  <option value="Unidades">Unidades</option>
                  <option value="Garrafas">Garrafas</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Caixas">Caixas</option>
                  <option value="Rolos">Rolos</option>
                  <option value="Kg">Kg</option>
                  <option value="Litros">Litros</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-neutral-800 hover:bg-[#b8923c] hover:text-black text-white text-xs font-semibold rounded border border-neutral-700 whitespace-nowrap">
                  Pedir
                </button>
              </div>
            </form>
          </div>

          {Object.keys(pendingChanges).length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 z-40 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Itens Alterados</div>
                  <div className="text-sm sm:text-base font-bold text-white">{Object.keys(pendingChanges).length} referência(s)</div>
                </div>
                <button onClick={handleConfirmWorkerChanges} className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-bold text-xs sm:text-sm rounded-md flex items-center gap-1.5 transition-colors shadow-lg">
                  Confirmar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* MODAL GESTOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-lg p-5 sm:p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4 pb-3 border-b border-neutral-800">
              {editingItem ? 'Editar Referência' : 'Nova Referência'} <span className="text-neutral-500 text-xs font-normal">({getSectorLabel(activeSector)})</span>
            </h2>
            
            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Designação</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#b8923c]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Categoria / Família</label>
                <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#b8923c]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Stock Atual</label>
                  <input type="number" min="0" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#b8923c]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Stock Mínimo</label>
                  <input type="number" min="0" required value={formData.minQuantity} onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#b8923c]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">Unidade de Medida</label>
                <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#b8923c]">
                  <option value="Unidades">Unidades</option>
                  <option value="Garrafas">Garrafas</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Caixas">Caixas</option>
                  <option value="Rolos">Rolos</option>
                  <option value="Kg">Kg</option>
                  <option value="Litros">Litros</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-neutral-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 text-xs text-neutral-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-bold text-xs rounded transition-colors">Guardar no Cloud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
