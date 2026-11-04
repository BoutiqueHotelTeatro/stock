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
  Send,
  Key,
  ArrowRightLeft,
  Sun,
  Moon
} from 'lucide-react';

// ==========================================
// CONFIGURAZIONE NOTIFICHE EMAIL
// ==========================================
const TARGET_HOTEL_EMAIL = "geral@boutiquehotelteatro.net";

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
  { id: '14', name: 'Leite Meio Gordo 1L', category: 'Laticínios', quantity: 30, minQuantity: 10, unit: 'Litros', sector: 'cozinha' },
  // HOUSEKEEPING
  { id: '10', name: 'Toalhas de Banho Grandes', category: 'Têxteis', quantity: 35, minQuantity: 15, unit: 'Unidades', sector: 'hk' },
  { id: '11', name: 'Amenities Gel de Banho 30ml', category: 'Amenities', quantity: 120, minQuantity: 40, unit: 'Unidades', sector: 'hk' },
  { id: '12', name: 'Papel Higiénico Premium', category: 'Higiene', quantity: 65, minQuantity: 25, unit: 'Rolos', sector: 'hk' },
  { id: '13', name: 'Lençóis Cama Casal', category: 'Têxteis', quantity: 20, minQuantity: 8, unit: 'Unidades', sector: 'hk' }
];

export default function App() {
  // GESTIONE TEMA (dark / ivory)
  const [theme, setTheme] = useState(() => localStorage.getItem('bht_theme') || 'dark');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'ivory' : 'dark');
  };

  useEffect(() => {
    localStorage.setItem('bht_theme', theme);
  }, [theme]);

  // Sessione
  const [role, setRole] = useState(() => localStorage.getItem('bht_session_role') || null); 
  const [activeSector, setActiveSector] = useState(() => localStorage.getItem('bht_session_sector') || 'bar'); 
  const [workerName, setWorkerName] = useState(() => localStorage.getItem('bht_session_worker_name') || '');

  const [managerPin, setManagerPin] = useState('0000');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

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

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    sourceSector: '',
    itemId: '',
    quantity: 1
  });

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

  useEffect(() => {
    const unsubPin = onSnapshot(doc(db, "bht_settings", "auth"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().pin) {
        setManagerPin(docSnap.data().pin);
      } else {
        setDoc(doc(db, "bht_settings", "auth"), { pin: '0000' });
      }
    });

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
      unsubPin();
      unsubItems();
      unsubLogs();
      unsubRequests();
    };
  }, []);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getSectorLabel = (sec) => {
    if (sec === 'hk') return 'Housekeeping';
    if (sec === 'cozinha') return 'Cozinha';
    return 'Bar';
  };

  const sendEmailAlert = async (productName, sector, currentQty, minQty, unit, showFeedback = false) => {
    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID") return false;

    try {
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
      if (showFeedback) {
        showToast("Email enviada");
      }
      return true;
    } catch (error) {
      console.error("Falha EmailJS:", error);
      if (showFeedback) {
        alert("Erro no envio do email. Verifique as credenciais.");
      }
      return false;
    }
  };

  const handleTestEmail = () => {
    sendEmailAlert("PRODUTO TESTE", getSectorLabel(activeSector), 1, 5, "Unidades", true);
  };

  const handleManagerLogin = (e) => {
    e.preventDefault();
    if (pinInput === managerPin) {
      setRole('manager'); 
      setPinError(false); 
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (!newPinInput.trim()) return;

    try {
      await setDoc(doc(db, "bht_settings", "auth"), { pin: newPinInput.trim() });
      setManagerPin(newPinInput.trim());
      setIsPinModalOpen(false);
      setNewPinInput('');
      showToast("PIN alterado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar o PIN.");
    }
  };

  const handleClearAllData = async () => {
    const confirmation = window.confirm(
      "TEM A CERTEZA QUE DESEJA APAGAR TUDO?\nEsta ação irá eliminar todos os produtos, históricos e solicitações da base de dados no Cloud."
    );
    if (!confirmation) return;

    try {
      showToast("A limpar base de dados...");
      for (const item of items) {
        await deleteDoc(doc(db, "bht_inventory", item.id));
      }
      for (const log of logs) {
        await deleteDoc(doc(db, "bht_logs", log.id));
      }
      for (const req of requests) {
        await deleteDoc(doc(db, "bht_requests", req.id));
      }
      setAlertedItems({});
      localStorage.removeItem('bht_alerted_items');
      showToast("Base de dados limpa com sucesso.");
    } catch (err) {
      console.error("Erro ao apagar:", err);
      alert("Erro ao limpar dados no Cloud.");
    }
  };

  const handleRestoreDemoData = async () => {
    if (!window.confirm("Carregar os produtos iniciais de exemplo na base de dados?")) return;
    try {
      for (const item of INITIAL_DEMO_ITEMS) {
        await setDoc(doc(db, "bht_inventory", item.id), item);
      }
      showToast("Dados de exemplo carregados.");
    } catch (err) {
      console.error(err);
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
      console.error("Errore log:", err);
    }
  };

  const handleOpenTransferModal = () => {
    const availableSectors = ['bar', 'cozinha', 'hk'].filter(s => s !== activeSector);
    const initialSource = availableSectors[0];
    const availableItems = items.filter(i => i.sector === initialSource && i.quantity > 0);
    
    setTransferData({
      sourceSector: initialSource,
      itemId: availableItems.length > 0 ? availableItems[0].id : '',
      quantity: 1
    });
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.itemId || transferData.quantity <= 0) return;

    const sourceItem = items.find(i => i.id === transferData.itemId);
    if (!sourceItem) {
      alert("Produto de origem não encontrado.");
      return;
    }

    const qty = parseInt(transferData.quantity, 10);
    if (qty > sourceItem.quantity) {
      alert(`Quantidade indisponível! Stock atual na origem: ${sourceItem.quantity} ${sourceItem.unit}`);
      return;
    }

    try {
      const newSourceQty = Math.max(0, sourceItem.quantity - qty);
      await updateDoc(doc(db, "bht_inventory", sourceItem.id), {
        quantity: newSourceQty
      });

      if (newSourceQty <= sourceItem.minQuantity) {
        sendEmailAlert(sourceItem.name, getSectorLabel(sourceItem.sector), newSourceQty, sourceItem.minQuantity, sourceItem.unit, false);
      }

      const targetItem = items.find(i => 
        i.sector === activeSector && 
        i.name.trim().toLowerCase() === sourceItem.name.trim().toLowerCase()
      );

      if (targetItem) {
        await updateDoc(doc(db, "bht_inventory", targetItem.id), {
          quantity: targetItem.quantity + qty
        });
      } else {
        const newRef = doc(collection(db, "bht_inventory"));
        await setDoc(newRef, {
          id: newRef.id,
          name: sourceItem.name,
          category: sourceItem.category,
          quantity: qty,
          minQuantity: sourceItem.minQuantity || 3,
          unit: sourceItem.unit,
          sector: activeSector
        });
      }

      const detailStr = `${qty} ${sourceItem.unit} de ${getSectorLabel(sourceItem.sector).toUpperCase()} para ${getSectorLabel(activeSector).toUpperCase()}`;
      await addLogCloud(
        sourceItem.id,
        sourceItem.name,
        'Transferência',
        detailStr,
        workerName,
        activeSector
      );

      setIsTransferModalOpen(false);
      showToast(`Transferência concluída: +${qty} ${sourceItem.unit} no setor ${getSectorLabel(activeSector)}.`);
    } catch (err) {
      console.error("Erro ao transferir:", err);
      alert("Erro ao executar a transferência no Cloud.");
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
      showToast('Pedido enviado com sucesso.');
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
      showToast('Item adicionado ao stock.');
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
      showToast('Guardado no Cloud.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (window.confirm(`Tem a certeza que deseja eliminar "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "bht_inventory", id));
        addLogCloud(id, name, 'Remoção', `Eliminado pelo gestor`, 'Gestor');
        showToast('Item eliminado.');
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

        await updateDoc(doc(db, "bht_inventory", id), { quantity: newQty });
        addLogCloud(item.id, item.name, actionType, detailStr, workerName, item.sector);

        if (newQty <= item.minQuantity) {
          if (!newAlerts[item.id]) {
            sendEmailAlert(item.name, getSectorLabel(item.sector), newQty, item.minQuantity, item.unit, false);
            newAlerts[item.id] = true;
          }
        } else {
          delete newAlerts[item.id];
        }
      }

      setAlertedItems(newAlerts);
      setPendingChanges({});
      showToast('Movimentos registados no sistema.');
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

  const transferSourceItems = items.filter(i => i.sector === transferData.sourceSector && i.quantity > 0);

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!role) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-3 sm:p-4 font-sans transition-colors duration-300 ${
        isDark ? 'bg-neutral-950 text-neutral-200' : 'bg-[#FDFBF7] text-stone-800'
      }`}>
        
        {/* Pulsante Selettore Tema nel Login */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800' 
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            title={isDark ? "Mudar para Tema Marfim (Claro)" : "Mudar para Tema Escuro"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDark ? 'Tema Marfim' : 'Tema Escuro'}</span>
          </button>
        </div>

        <div className={`w-full max-w-md rounded-xl p-5 sm:p-8 shadow-2xl border transition-colors ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
        }`}>
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <img 
              src="/BHT_Gold_400x-100-removebg-preview.jpg" 
              alt="Boutique Hotel Teatro Logo" 
              className="h-20 sm:h-24 object-contain mb-3 sm:mb-4"
            />
            <h1 className="text-lg sm:text-xl font-serif text-[#b8923c] tracking-widest font-bold text-center uppercase">
              Boutique Hotel Teatro
            </h1>
            <div className={`h-px w-12 my-2 sm:my-3 ${isDark ? 'bg-neutral-800' : 'bg-stone-300'}`}></div>
            <p className={`text-[10px] sm:text-[11px] uppercase tracking-widest font-medium ${isDark ? 'text-neutral-500' : 'text-stone-500'}`}>
              Gestão de Stock Integrada
            </p>
          </div>

          {workerStep === 'name' ? (
            <div className="space-y-6 sm:space-y-8">
              <form onSubmit={handleManagerLogin} className="space-y-3">
                <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
                  <Lock className="w-4 h-4 text-[#b8923c]" /> Acesso Gestão
                </div>
                <input
                  type="password" placeholder="PIN de Acesso" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 sm:py-3 rounded-md text-sm transition-colors border focus:outline-none focus:border-[#b8923c] ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' 
                      : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                  }`}
                />
                {pinError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> PIN Incorreto.</p>}
                <button type="submit" className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-sm ${
                  isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700' : 'bg-stone-800 hover:bg-stone-700 text-white'
                }`}>
                  Entrar como Gestor
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className={`flex-grow border-t ${isDark ? 'border-neutral-800' : 'border-stone-200'}`}></div>
                <span className={`flex-shrink mx-3 sm:mx-4 text-[10px] uppercase tracking-widest font-semibold ${isDark ? 'text-neutral-600' : 'text-stone-400'}`}>Terminal Operacional</span>
                <div className={`flex-grow border-t ${isDark ? 'border-neutral-800' : 'border-stone-200'}`}></div>
              </div>

              <form onSubmit={handleWorkerNameSubmit} className="space-y-3">
                <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
                  <User className="w-4 h-4 text-[#b8923c]" /> Identificação do Funcionário
                </div>
                <input
                  type="text" placeholder="Nome Completo" value={tempNameInput} onChange={(e) => setTempNameInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 sm:py-3 rounded-md text-sm transition-colors border focus:outline-none focus:border-[#b8923c] ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' 
                      : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                  }`}
                />
                <button type="submit" disabled={!tempNameInput.trim()} className="w-full py-2.5 sm:py-3 bg-[#b8923c] hover:bg-[#a37f2d] disabled:opacity-40 text-neutral-950 text-xs sm:text-sm font-bold rounded-md transition-colors shadow-sm">
                  Prosseguir
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in text-center">
              <p className={`text-xs sm:text-sm mb-1 sm:mb-2 font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>Operador: <span className="font-bold text-[#b8923c]">{workerName}</span></p>
              <h2 className="text-base sm:text-lg font-bold text-[#b8923c] mb-5 sm:mb-6">Selecione o Departamento</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button onClick={() => selectSectorAndEnter('bar')} className={`p-4 sm:p-5 border rounded-lg flex flex-row sm:flex-col items-center justify-center gap-3 transition-all ${
                  isDark ? 'bg-neutral-950 border-neutral-800 hover:border-[#b8923c]' : 'bg-stone-50 border-stone-200 hover:border-[#b8923c] hover:shadow-md'
                }`}>
                  <Wine className="w-6 h-6 sm:w-7 sm:h-7 text-[#b8923c]" />
                  <span className="font-bold text-xs tracking-wider">BAR</span>
                </button>
                <button onClick={() => selectSectorAndEnter('cozinha')} className={`p-4 sm:p-5 border rounded-lg flex flex-row sm:flex-col items-center justify-center gap-3 transition-all ${
                  isDark ? 'bg-neutral-950 border-neutral-800 hover:border-[#b8923c]' : 'bg-stone-50 border-stone-200 hover:border-[#b8923c] hover:shadow-md'
                }`}>
                  <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-[#b8923c]" />
                  <span className="font-bold text-xs tracking-wider">COZINHA</span>
                </button>
                <button onClick={() => selectSectorAndEnter('hk')} className={`p-4 sm:p-5 border rounded-lg flex flex-row sm:flex-col items-center justify-center gap-3 transition-all ${
                  isDark ? 'bg-neutral-950 border-neutral-800 hover:border-[#b8923c]' : 'bg-stone-50 border-stone-200 hover:border-[#b8923c] hover:shadow-md'
                }`}>
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#b8923c]" />
                  <span className="font-bold text-xs tracking-wider">HOUSEKEEPING</span>
                </button>
              </div>
              <button onClick={() => setWorkerStep('name')} className={`mt-6 text-xs font-medium transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}>
                &larr; Alterar Identificação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // APP PRINCIPALE
  // ----------------------------------------------------
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-neutral-950 text-neutral-200' : 'bg-[#FDFBF7] text-stone-800'
    }`}>
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-[#b8923c] text-neutral-950 px-4 py-2.5 rounded-lg shadow-xl font-bold text-xs sm:text-sm flex items-center gap-2 border border-amber-300">
          <BellRing className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className={`border-b sticky top-0 z-30 shadow-sm transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-200'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img src="/BHT_Gold_400x-100-removebg-preview.jpg" alt="Logo" className="h-8 sm:h-10 object-contain flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-[#b8923c] text-xs sm:text-sm tracking-wider uppercase truncate font-bold">
                Boutique Hotel Teatro
              </h1>
              <p className={`text-[9px] sm:text-[10px] uppercase tracking-widest hidden xs:block truncate font-semibold ${
                isDark ? 'text-neutral-400' : 'text-stone-400'
              }`}>
                {role === 'manager' ? 'Painel Gestão Cloud' : `Operador: ${workerName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Tasto Switch Tema */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-md border transition-colors ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800' 
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
              title={isDark ? "Mudar para Tema Marfim" : "Mudar para Tema Escuro"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {role === 'manager' && (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 border rounded-md text-xs font-semibold transition-colors ${
                  isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-[#b8923c] border-neutral-800' : 'bg-stone-50 hover:bg-stone-100 text-[#b8923c] border-stone-200'
                }`}
                title="Alterar PIN do Gestor"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Alterar PIN</span>
              </button>
            )}

            <div className={`border px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md flex items-center gap-2 ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#b8923c] uppercase block leading-none">
                  {role === 'manager' ? 'Gestor' : getSectorLabel(activeSector)}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 border rounded-md font-semibold text-xs transition-colors ${
                isDark 
                  ? 'bg-neutral-900 hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border-neutral-800 hover:border-red-900/60' 
                  : 'bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 border-stone-200 hover:border-red-200'
              }`}
              title="Terminar Sessão"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {role === 'manager' && (
          <div className={`border-t px-3 sm:px-6 overflow-x-auto no-scrollbar ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-stone-100 shadow-inner'
          }`}>
            <div className="max-w-7xl mx-auto flex gap-4 sm:gap-8 whitespace-nowrap min-w-max">
              <button onClick={() => setActiveSector('bar')} className={`flex items-center gap-1.5 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-bold transition-colors ${activeSector === 'bar' ? 'border-[#b8923c] text-[#b8923c]' : isDark ? 'border-transparent text-neutral-500 hover:text-neutral-300' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
                <Wine className="w-3.5 h-3.5" /> BAR
              </button>
              <button onClick={() => setActiveSector('cozinha')} className={`flex items-center gap-1.5 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-bold transition-colors ${activeSector === 'cozinha' ? 'border-[#b8923c] text-[#b8923c]' : isDark ? 'border-transparent text-neutral-500 hover:text-neutral-300' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
                <ChefHat className="w-3.5 h-3.5" /> COZINHA
              </button>
              <button onClick={() => setActiveSector('hk')} className={`flex items-center gap-1.5 py-2.5 sm:py-3 border-b-2 text-xs sm:text-sm font-bold transition-colors ${activeSector === 'hk' ? 'border-[#b8923c] text-[#b8923c]' : isDark ? 'border-transparent text-neutral-500 hover:text-neutral-300' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
                <Sparkles className="w-3.5 h-3.5" /> HOUSEKEEPING
              </button>
            </div>
          </div>
        )}
      </header>

      {/* PAINEL GESTOR */}
      {role === 'manager' && (
        <main className="flex-grow max-w-7xl w-full mx-auto p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className={`flex rounded-md p-1 border overflow-x-auto no-scrollbar whitespace-nowrap ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-bold transition-colors ${activeTab === 'inventory' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-stone-100 text-stone-900 border border-stone-200') : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-700')}`}>
                <Package className="w-3.5 h-3.5" /> Inventário
              </button>
              <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-bold transition-colors ${activeTab === 'history' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-stone-100 text-stone-900 border border-stone-200') : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-700')}`}>
                <History className="w-3.5 h-3.5" /> Movimentos
              </button>
              <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-bold transition-colors relative ${activeTab === 'requests' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-stone-100 text-stone-900 border border-stone-200') : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-700')}`}>
                <FileText className="w-3.5 h-3.5" /> Solicitações
                {pendingRequestsCount > 0 && (
                  <span className="ml-1 bg-[#b8923c] text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-bold transition-colors ${activeTab === 'stats' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-stone-100 text-stone-900 border border-stone-200') : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-700')}`}>
                <TrendingUp className="w-3.5 h-3.5" /> Relatórios
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={handleTestEmail} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border transition-colors shadow-sm ${
                    isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-amber-500/40' : 'bg-white hover:bg-stone-50 text-[#b8923c] border-[#b8923c]/40'
                  }`}
                  title="Testar envio de email via EmailJS"
                >
                  <Send className="w-3.5 h-3.5" /> Testar Email
                </button>
                <button onClick={() => exportToCSV('inventory')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border transition-colors shadow-sm ${
                  isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                }`}>
                  <Download className="w-3.5 h-3.5" /> Exportar
                </button>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-bold text-xs rounded-md transition-colors shadow-sm">
                  <Plus className="w-3.5 h-3.5" /> Novo Item
                </button>
              </div>
            )}
            {activeTab === 'history' && (
              <button onClick={() => exportToCSV('history')} className={`w-full sm:w-auto justify-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border transition-colors shadow-sm ${
                isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
              }`}>
                <Download className="w-3.5 h-3.5" /> Exportar Relatório CSV
              </button>
            )}
          </div>

          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative w-full sm:w-80 shadow-sm">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
                  <input type="text" placeholder="Filtrar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-9 pr-3 py-2 border rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-stone-200 text-stone-800'
                  }`} />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap border transition-colors shadow-sm ${
                      categoryFilter === cat 
                        ? (isDark ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-stone-100 border-stone-300 text-stone-900') 
                        : (isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-white border-stone-200 text-stone-500 hover:text-stone-700')
                    }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredItems.map(item => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <div key={item.id} className={`border rounded-lg p-3.5 flex flex-col justify-between transition-colors shadow-sm ${
                      isDark 
                        ? (isLow ? 'border-red-900/50 bg-red-950/10' : 'bg-neutral-900 border-neutral-800') 
                        : (isLow ? 'border-red-300 bg-red-50' : 'bg-white border-stone-200 hover:shadow-md')
                    }`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] uppercase tracking-wider font-bold ${isDark ? 'text-neutral-500' : 'text-stone-500'}`}>{item.category}</span>
                          {isLow && (
                            <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              isDark ? 'text-red-400 bg-red-950/40 border-red-900/50' : 'text-red-600 bg-red-100 border-red-200'
                            }`}>
                              <AlertTriangle className="w-3 h-3" /> Mínimo Atingido
                            </span>
                          )}
                        </div>
                        <h3 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-stone-800'}`}>{item.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl sm:text-2xl font-black tabular-nums ${isLow ? 'text-red-500' : 'text-[#b8923c]'}`}>{item.quantity}</span>
                          <span className={`text-xs lowercase font-medium ${isDark ? 'text-neutral-500' : 'text-stone-500'}`}>{item.unit}</span>
                        </div>
                      </div>
                      <div className={`flex justify-between items-center mt-3 pt-2.5 border-t text-xs ${isDark ? 'border-neutral-800' : 'border-stone-100'}`}>
                        <span className={`text-[10px] font-semibold ${isDark ? 'text-neutral-500' : 'text-stone-400'}`}>Mínimo: {item.minQuantity} {item.unit}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleOpenModal(item)} className={`p-1.5 rounded transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-stone-400 hover:text-[#b8923c]'}`}><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-1.5 text-stone-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className={`border rounded-lg overflow-x-auto shadow-sm ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
            }`}>
              <table className={`w-full text-left text-xs sm:text-sm min-w-[500px] ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
                <thead className={`text-[10px] sm:text-xs uppercase font-bold border-b ${
                  isDark ? 'bg-neutral-950/60 text-neutral-500 border-neutral-800' : 'bg-stone-50 text-stone-500 border-stone-200'
                }`}>
                  <tr>
                    <th className="px-3 sm:px-4 py-3">Data / Hora</th>
                    <th className="px-3 sm:px-4 py-3">Produto</th>
                    <th className="px-3 sm:px-4 py-3">Operação</th>
                    <th className="px-3 sm:px-4 py-3">Operador</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-stone-100'}`}>
                  {logs.filter(l => l.sector === activeSector).map(log => (
                    <tr key={log.id} className={isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-stone-50'}>
                      <td className="px-3 sm:px-4 py-3 text-xs tabular-nums">{log.timestamp}</td>
                      <td className={`px-3 sm:px-4 py-3 font-bold ${isDark ? 'text-neutral-200' : 'text-stone-800'}`}>{log.itemName}</td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.action === 'Entrada' ? (isDark ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : 
                          log.action === 'Saída' ? (isDark ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-200') : 
                          log.action === 'Transferência' ? (isDark ? 'bg-purple-950/40 text-purple-300 border-purple-800/50' : 'bg-purple-50 text-purple-700 border-purple-200') :
                          (isDark ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-stone-100 text-stone-600 border-stone-200')
                        }`}>
                          {log.details}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs font-semibold">{log.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {requests.filter(r => r.sector === activeSector).length === 0 ? (
                <div className={`border p-8 text-center rounded-lg text-xs sm:text-sm font-medium shadow-sm ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : 'bg-white border-stone-200 text-stone-400'
                }`}>
                  Nenhuma solicitação registada no departamento de {getSectorLabel(activeSector)}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {requests.filter(r => r.sector === activeSector).map(req => (
                    <div key={req.id} className={`border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                      isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}>{req.name}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                            isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-stone-100 text-stone-500 border-stone-200'
                          }`}>{req.category}</span>
                        </div>
                        <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
                          Qtd: <strong className={isDark ? 'text-white' : 'text-stone-800'}>{req.quantity} {req.unit}</strong> | Solicitado por: {req.requestedBy}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveRequest(req)} className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center justify-center gap-1 shadow-sm transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                            </button>
                            <button onClick={() => handleRejectRequest(req.id, req.name, req.sector)} className={`flex-1 sm:flex-none px-3 py-1.5 border text-xs font-bold rounded flex items-center justify-center gap-1 shadow-sm transition-colors ${
                              isDark ? 'bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 text-neutral-400 border-neutral-700' : 'bg-white hover:bg-red-50 text-stone-500 hover:text-red-600 border-stone-200'
                            }`}>
                              <XCircle className="w-3.5 h-3.5" /> Rejeitar
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs px-2.5 py-1 rounded font-bold border ${
                            req.status === 'approved' 
                              ? (isDark ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') 
                              : (isDark ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-red-50 text-red-700 border-red-200')
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`border p-4 rounded-lg shadow-sm ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'}`}>
                  <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-stone-400'}`}>Total Referências</div>
                  <div className={`text-2xl sm:text-3xl font-black tabular-nums ${isDark ? 'text-white' : 'text-stone-800'}`}>{currentSectorItems.length}</div>
                </div>
                <div className={`border p-4 rounded-lg shadow-sm ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'}`}>
                  <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-stone-400'}`}>Stock em Alerta</div>
                  <div className="text-2xl sm:text-3xl font-black text-red-500 tabular-nums">{currentSectorItems.filter(i => i.quantity <= i.minQuantity).length}</div>
                </div>
                <div className={`border p-4 rounded-lg shadow-sm ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'}`}>
                  <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-stone-400'}`}>Solicitações Pendentes</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#b8923c] tabular-nums">{pendingRequestsCount}</div>
                </div>
              </div>

              <div className={`border rounded-lg p-5 shadow-sm ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'}`}>
                <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-800'}`}>
                  <Trash2 className="w-4 h-4 text-red-500" /> Gestão da Base de Dados (Cloud)
                </h3>
                <p className={`text-xs mb-4 leading-relaxed font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
                  Utilize estas ferramentas para reiniciar o sistema ou restaurar a demonstração inicial. Estas ações afetam diretamente a base de dados central.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleClearAllData}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar Toda a Base de Dados
                  </button>

                  <button
                    onClick={handleRestoreDemoData}
                    className={`px-4 py-2 border rounded-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm ${
                      isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Repor Produtos de Demonstração
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* TERMINAL DO FUNCIONÁRIO */}
      {role === 'worker' && (
        <main className="flex-grow max-w-2xl w-full mx-auto p-3 sm:p-4 pb-36">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-stone-800'}`}>Terminal <span className="text-[#b8923c] uppercase">{getSectorLabel(activeSector)}</span></h2>
              <p className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>Registo rápido de entradas e saídas.</p>
            </div>
            
            <button
              onClick={handleOpenTransferModal}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isDark 
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-[#b8923c] border-[#b8923c]/40 hover:border-[#b8923c]' 
                  : 'bg-white hover:bg-stone-50 text-[#b8923c] border-[#b8923c]/30 hover:border-[#b8923c]'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-[#b8923c]" />
              <span>Transferir Stock</span>
            </button>
          </div>

          <div className="relative mb-4 shadow-sm">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
            <input type="text" placeholder="Pesquisar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-9 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:border-[#b8923c] ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-stone-200 text-stone-800'
            }`} />
          </div>

          <div className="space-y-2.5 mb-8">
            {filteredItems.map(item => {
              const pending = pendingChanges[item.id] || 0;
              return (
                <div key={item.id} className={`border rounded-xl p-3 flex items-center justify-between gap-2 transition-colors shadow-sm ${
                  pending !== 0 
                    ? (isDark ? 'border-[#b8923c] bg-[#b8923c]/10' : 'border-[#b8923c] bg-orange-50/50') 
                    : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200')
                }`}>
                  <div className="min-w-0 flex-grow pr-2">
                    <div className={`text-[9px] uppercase tracking-widest font-bold ${isDark ? 'text-neutral-500' : 'text-stone-400'}`}>{item.category}</div>
                    <div className={`text-xs sm:text-sm font-black truncate ${isDark ? 'text-white' : 'text-stone-800'}`}>{item.name}</div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>{item.unit}</div>
                  </div>

                  <div className={`flex items-center p-1 rounded-lg border flex-shrink-0 ${
                    isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <button 
                      onClick={() => handlePendingChange(item.id, -1)} 
                      className={`w-11 h-11 sm:w-12 sm:h-10 rounded-md font-black text-xl flex items-center justify-center touch-manipulation select-none border shadow-sm transition-colors ${
                        isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800 active:bg-neutral-700' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200 active:bg-stone-200'
                      }`}
                    >
                      -
                    </button>
                    <div className="w-12 text-center">
                      <span className={`text-base font-black tabular-nums ${
                        pending > 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : 
                        pending < 0 ? (isDark ? 'text-red-400' : 'text-red-500') : 
                        (isDark ? 'text-neutral-500' : 'text-stone-700')
                      }`}>
                        {pending > 0 ? `+${pending}` : pending}
                      </span>
                    </div>
                    <button 
                      onClick={() => handlePendingChange(item.id, 1)} 
                      className={`w-11 h-11 sm:w-12 sm:h-10 rounded-md font-black text-xl flex items-center justify-center touch-manipulation select-none border shadow-sm transition-colors ${
                        isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800 active:bg-neutral-700' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200 active:bg-stone-200'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`border rounded-xl p-4 shadow-md ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-center gap-1.5 mb-1.5 text-[#b8923c] font-black text-xs sm:text-sm uppercase tracking-wider">
              <PlusCircle className="w-4 h-4" /> Requisitar Novo Produto / Encomenda
            </div>
            <p className={`text-[11px] mb-3 font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
              Produto não listado? Preencha os campos abaixo para solicitar a inclusão ao Gestor.
            </p>

            <form onSubmit={handleWorkerRequestSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text" required placeholder="Designação do Produto" value={reqData.name} onChange={(e) => setReqData({...reqData, name: e.target.value})}
                  className={`px-3 py-2 border rounded text-xs focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                  }`}
                />
                <input
                  type="text" placeholder="Categoria (ex: Bebidas, Têxteis)" value={reqData.category} onChange={(e) => setReqData({...reqData, category: e.target.value})}
                  className={`px-3 py-2 border rounded text-xs focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number" min="1" required placeholder="Qtd" value={reqData.quantity} onChange={(e) => setReqData({...reqData, quantity: e.target.value})}
                  className={`w-20 px-2.5 py-2 border rounded text-xs focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                />
                <select
                  value={reqData.unit} onChange={(e) => setReqData({...reqData, unit: e.target.value})}
                  className={`w-full px-2.5 py-2 border rounded text-xs focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                >
                  <option value="Unidades">Unidades</option>
                  <option value="Garrafas">Garrafas</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Caixas">Caixas</option>
                  <option value="Rolos">Rolos</option>
                  <option value="Kg">Kg</option>
                  <option value="Litros">Litros</option>
                </select>
                <button type="submit" className={`px-4 py-2 text-xs font-bold rounded shadow-sm transition-colors whitespace-nowrap ${
                  isDark ? 'bg-neutral-800 hover:bg-[#b8923c] hover:text-black text-white border border-neutral-700' : 'bg-stone-800 hover:bg-[#b8923c] text-white'
                }`}>
                  Pedir
                </button>
              </div>
            </form>
          </div>

          {Object.keys(pendingChanges).length > 0 && (
            <div className={`fixed bottom-0 left-0 right-0 p-3 sm:p-4 backdrop-blur-md border-t z-40 ${
              isDark ? 'bg-neutral-950/95 border-neutral-800 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]' : 'bg-white/95 border-stone-200 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]'
            }`}>
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                <div>
                  <div className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-neutral-500' : 'text-stone-500'}`}>Itens Alterados</div>
                  <div className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-stone-800'}`}>{Object.keys(pendingChanges).length} referência(s)</div>
                </div>
                <button onClick={handleConfirmWorkerChanges} className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors shadow-lg active:scale-95">
                  Confirmar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* MODAL TRASFERIMENTO DIRETTO TRA REPARTI */}
      {isTransferModalOpen && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 ${
          isDark ? 'bg-neutral-950/80' : 'bg-stone-900/60'
        }`}>
          <div className={`border w-full max-w-md rounded-xl p-5 relative shadow-2xl ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
          }`}>
            <button onClick={() => setIsTransferModalOpen(false)} className={`absolute top-4 right-4 ${isDark ? 'text-neutral-500 hover:text-white' : 'text-stone-400 hover:text-stone-600'}`}><X className="w-5 h-5" /></button>
            <h2 className={`text-base font-black mb-1 flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-800'}`}>
              <ArrowRightLeft className="w-4 h-4 text-[#b8923c]" /> Transferência Interna
            </h2>
            <p className={`text-xs mb-4 font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
              Prelevar um produto de outro departamento para o setor <strong className="text-[#b8923c] uppercase">{getSectorLabel(activeSector)}</strong>.
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
              <div>
                <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Setor de Origem (De onde retira)</label>
                <select
                  value={transferData.sourceSector}
                  onChange={(e) => {
                    const newSource = e.target.value;
                    const availableItems = items.filter(i => i.sector === newSource && i.quantity > 0);
                    setTransferData({
                      sourceSector: newSource,
                      itemId: availableItems.length > 0 ? availableItems[0].id : '',
                      quantity: 1
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                >
                  {['bar', 'cozinha', 'hk'].filter(s => s !== activeSector).map(sec => (
                    <option key={sec} value={sec}>{getSectorLabel(sec).toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Produto a Transferir</label>
                {transferSourceItems.length === 0 ? (
                  <p className={`text-xs p-2 rounded border font-semibold ${
                    isDark ? 'text-red-400 bg-red-950/30 border-red-900/40' : 'text-red-500 bg-red-50 border-red-200'
                  }`}>
                    Nenhum produto disponível em stock neste setor de origem.
                  </p>
                ) : (
                  <select
                    value={transferData.itemId}
                    onChange={(e) => setTransferData({ ...transferData, itemId: e.target.value, quantity: 1 })}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-[#b8923c] ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    {transferSourceItems.map(it => (
                      <option key={it.id} value={it.id}>
                        {it.name} (Disponível: {it.quantity} {it.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {transferSourceItems.length > 0 && (
                <div>
                  <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max={items.find(i => i.id === transferData.itemId)?.quantity || 1}
                    required
                    value={transferData.quantity}
                    onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-[#b8923c] ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  />
                  <span className={`text-[10px] mt-1 block font-semibold ${isDark ? 'text-neutral-500' : 'text-stone-500'}`}>
                    Unidade: {items.find(i => i.id === transferData.itemId)?.unit}
                  </span>
                </div>
              )}

              <div className={`flex justify-end gap-2 pt-3 border-t ${isDark ? 'border-neutral-800' : 'border-stone-200'}`}>
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className={`px-3 py-1.5 text-xs font-bold ${isDark ? 'text-neutral-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}>Cancelar</button>
                <button
                  type="submit"
                  disabled={transferSourceItems.length === 0}
                  className="px-4 py-2 bg-[#b8923c] hover:bg-[#a37f2d] disabled:opacity-40 text-neutral-950 font-bold text-xs rounded transition-colors shadow-sm"
                >
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ALTERAR PIN DO GESTOR */}
      {isPinModalOpen && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 ${
          isDark ? 'bg-neutral-950/80' : 'bg-stone-900/60'
        }`}>
          <div className={`border w-full max-w-sm rounded-xl p-5 relative shadow-2xl ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
          }`}>
            <button onClick={() => setIsPinModalOpen(false)} className={`absolute top-4 right-4 ${isDark ? 'text-neutral-500 hover:text-white' : 'text-stone-400 hover:text-stone-600'}`}><X className="w-5 h-5" /></button>
            <h2 className={`text-base font-black mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-800'}`}>
              <Key className="w-4 h-4 text-[#b8923c]" /> Alterar PIN do Gestor
            </h2>
            <p className={`text-xs mb-4 font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
              O novo PIN será imediatamente sincronizado em todos os computadores, tablets e telemóveis.
            </p>

            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div>
                <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Novo Código PIN</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1234"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                />
              </div>

              <div className={`flex justify-end gap-2 pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-stone-200'}`}>
                <button type="button" onClick={() => setIsPinModalOpen(false)} className={`px-3 py-1.5 text-xs font-bold ${isDark ? 'text-neutral-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}>Cancelar</button>
                <button type="submit" className="px-4 py-1.5 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-bold text-xs rounded transition-colors shadow-sm">Guardar Novo PIN</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR/EDITAR ITEM (GESTOR) */}
      {isModalOpen && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 ${
          isDark ? 'bg-neutral-950/80' : 'bg-stone-900/60'
        }`}>
          <div className={`border w-full max-w-md rounded-xl p-5 sm:p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
          }`}>
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-4 right-4 ${isDark ? 'text-neutral-500 hover:text-white' : 'text-stone-400 hover:text-stone-600'}`}><X className="w-5 h-5" /></button>
            <h2 className={`text-base sm:text-lg font-black mb-4 pb-3 border-b ${
              isDark ? 'text-white border-neutral-800' : 'text-stone-800 border-stone-200'
            }`}>
              {editingItem ? 'Editar Referência' : 'Nova Referência'} <span className="text-stone-500 text-xs font-semibold">({getSectorLabel(activeSector)})</span>
            </h2>
            
            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Designação</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-3 py-2 border rounded text-xs sm:text-sm focus:outline-none focus:border-[#b8923c] ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                }`} />
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Categoria / Família</label>
                <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={`w-full px-3 py-2 border rounded text-xs sm:text-sm focus:outline-none focus:border-[#b8923c] ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                }`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Stock Atual</label>
                  <input type="number" min="0" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className={`w-full px-3 py-2 border rounded text-xs sm:text-sm focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`} />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Stock Mínimo</label>
                  <input type="number" min="0" required value={formData.minQuantity} onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})} className={`w-full px-3 py-2 border rounded text-xs sm:text-sm focus:outline-none focus:border-[#b8923c] ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`} />
                </div>
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-400'}`}>Unidade de Medida</label>
                <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className={`w-full px-3 py-2 border rounded text-xs sm:text-sm focus:outline-none focus:border-[#b8923c] ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}>
                  <option value="Unidades">Unidades</option>
                  <option value="Garrafas">Garrafas</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Caixas">Caixas</option>
                  <option value="Rolos">Rolos</option>
                  <option value="Kg">Kg</option>
                  <option value="Litros">Litros</option>
                </select>
              </div>
              <div className={`flex justify-end gap-2.5 mt-5 pt-3 border-t ${isDark ? 'border-neutral-800' : 'border-stone-200'}`}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-3 py-2 text-xs font-bold ${isDark ? 'text-neutral-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}>Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#b8923c] hover:bg-[#a37f2d] text-neutral-950 font-bold text-xs rounded shadow-sm transition-colors">Guardar no Cloud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
