import './storage';
import React, { useState, useEffect } from 'react';
import { Brain, Dumbbell, Plus, Check, X, LogOut, BarChart3, Home, Target, History, Shirt } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RPGTaskManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  
  const [intelligence, setIntelligence] = useState(0); // total XP for intelligence
  const [strength, setStrength] = useState(0); // total XP for strength
  const [intTasks, setIntTasks] = useState([]);
  const [strTasks, setStrTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [newIntTask, setNewIntTask] = useState('');
  const [newStrTask, setNewStrTask] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);
  const [hat, setHat] = useState('none');
  const [stickmanColor, setStickmanColor] = useState('#43BCCD');

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      const result = await window.storage.get(`user:${currentUser}`);
      if (result) {
        const data = JSON.parse(result.value);
        setIntelligence(data.intelligence || 0);
        setStrength(data.strength || 0);
        setIntTasks(data.intTasks || []);
        setStrTasks(data.strTasks || []);
        setHistory(data.history || []);
        setCompletedHistory(data.completedHistory || []);
        setHat(data.hat || 'none');
        setStickmanColor(data.stickmanColor || '#43BCCD');
      }
    } catch (error) {
      console.log('Новый пользователь');
    }
  };

  const saveUserData = async () => {
    if (!currentUser) return;
    
    const data = {
      intelligence,
      strength,
      intTasks,
      strTasks,
      history,
      completedHistory,
      hat,
      stickmanColor
    };
    
    try {
      await window.storage.set(`user:${currentUser}`, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      saveUserData();
    }
  }, [intelligence, strength, intTasks, strTasks, history, completedHistory, hat, stickmanColor]);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      alert('Заполните все поля!');
      return;
    }

    try {
      const result = await window.storage.get(`auth:${username}`);
      
      if (isLogin) {
        if (!result) {
          alert('Пользователь не найден!');
          return;
        }
        const stored = JSON.parse(result.value);
        if (stored.password !== password) {
          alert('Неверный пароль!');
          return;
        }
        setCurrentUser(username);
      } else {
        if (result) {
          alert('Пользователь уже существует!');
          return;
        }
        await window.storage.set(`auth:${username}`, JSON.stringify({ password }));
        setCurrentUser(username);
      }
    } catch (error) {
      if (!isLogin) {
        await window.storage.set(`auth:${username}`, JSON.stringify({ password }));
        setCurrentUser(username);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setIntelligence(0);
    setStrength(0);
    setIntTasks([]);
    setStrTasks([]);
    setHistory([]);
    setCompletedHistory([]);
    setCurrentPage('home');
    setHat('none');
    setStickmanColor('#43BCCD');
  };

  const addIntTask = () => {
    if (newIntTask.trim()) {
      setIntTasks([...intTasks, { id: Date.now(), text: newIntTask }]);
      setNewIntTask('');
    }
  };

  const addStrTask = () => {
    if (newStrTask.trim()) {
      setStrTasks([...strTasks, { id: Date.now(), text: newStrTask }]);
      setNewStrTask('');
    }
  };

  const completeIntTask = (id) => {
    setPendingTask({ id, type: 'int' });
    setShowConfirm(true);
  };

  const completeStrTask = (id) => {
    setPendingTask({ id, type: 'str' });
    setShowConfirm(true);
  };

  const confirmComplete = () => {
    const today = new Date().toLocaleDateString('ru-RU');
    const now = new Date().toLocaleString('ru-RU');

    if (!pendingTask) {
      setShowConfirm(false);
      return;
    }

    if (pendingTask.type === 'int') {
      const task = intTasks.find(t => t.id === pendingTask.id);
      setIntTasks(intTasks.filter(t => t.id !== pendingTask.id));
      setIntelligence(prev => prev + 1);

      setHistory(prevHistory => {
        const todayEntry = prevHistory.find(h => h.date === today);
        if (todayEntry) {
          // создаём новый объект, вместо мутирования существующего
          return prevHistory.map(h =>
            h.date === today ? { ...h, intelligence: h.intelligence + 1 } : h
          );
        } else {
          return [...prevHistory, { date: today, intelligence: 1, strength: 0 }];
        }
      });

      setCompletedHistory(prev => [
        { id: Date.now(), text: task ? task.text : 'Задание', type: 'intelligence', points: 1, date: now },
        ...prev
      ]);
    } else {
      const task = strTasks.find(t => t.id === pendingTask.id);
      setStrTasks(strTasks.filter(t => t.id !== pendingTask.id));
      setStrength(prev => prev + 1);

      setHistory(prevHistory => {
        const todayEntry = prevHistory.find(h => h.date === today);
        if (todayEntry) {
          return prevHistory.map(h =>
            h.date === today ? { ...h, strength: h.strength + 1 } : h
          );
        } else {
          return [...prevHistory, { date: today, intelligence: 0, strength: 1 }];
        }
      });

      setCompletedHistory(prev => [
        { id: Date.now(), text: task ? task.text : 'Задание', type: 'strength', points: 1, date: now },
        ...prev
      ]);
    }

    setShowConfirm(false);
    setPendingTask(null);
  };


  const cancelComplete = () => {
    setShowConfirm(false);
    setPendingTask(null);
  };

  const deleteIntTask = (id) => {
    setIntTasks(intTasks.filter(t => t.id !== id));
  };

  const deleteStrTask = (id) => {
    setStrTasks(strTasks.filter(t => t.id !== id));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-white/20 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-6">
            ⚔️ RPG Задачник
          </h1>
          
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 text-base"
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="Пароль"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 text-base"
            />
            
            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all text-base"
            >
              {isLogin ? 'Войти' : 'Регистрация'}
            </button>
            
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-teal-400 hover:text-teal-300 transition-colors text-sm"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStickman = (size = 200) => {
    return (
      <svg width={size} height={size * 1.5} viewBox="0 0 200 300">
        {/* Head */}
        <circle cx="100" cy="50" r="25" fill={stickmanColor} stroke="none"/>
        
        {/* Hats */}
        {hat === 'santa' && (
          <g>
            {/* Santa hat */}
            <path d="M 75 35 Q 100 5 125 35" fill="#dc2626" stroke="none"/>
            <circle cx="100" cy="5" r="8" fill="white"/>
            <ellipse cx="100" cy="35" rx="28" ry="6" fill="white"/>
          </g>
        )}
        
        {hat === 'cap' && (
          <g>
            {/* Baseball cap */}
            <ellipse cx="100" cy="35" rx="30" ry="18" fill="#3b82f6"/>
            <path d="M 70 35 L 50 40 L 70 45 Z" fill="#3b82f6"/>
          </g>
        )}
        
        {hat === 'bandana' && (
          <g>
            {/* Bandana */}
            <path d="M 75 40 L 100 30 L 125 40 L 125 50 L 75 50 Z" fill="#ef4444"/>
            <path d="M 125 45 L 135 48 L 130 55 Z" fill="#dc2626"/>
          </g>
        )}
        
        {/* Body */}
        <line x1="100" y1="75" x2="100" y2="170" stroke={stickmanColor} strokeWidth="8" strokeLinecap="round"/>
        {/* Arms */}
        <line x1="100" y1="100" x2="65" y2="130" stroke={stickmanColor} strokeWidth="8" strokeLinecap="round"/>
        <line x1="100" y1="100" x2="135" y2="130" stroke={stickmanColor} strokeWidth="8" strokeLinecap="round"/>
        {/* Legs */}
        <line x1="100" y1="170" x2="75" y2="240" stroke={stickmanColor} strokeWidth="8" strokeLinecap="round"/>
        <line x1="100" y1="170" x2="125" y2="240" stroke={stickmanColor} strokeWidth="8" strokeLinecap="round"/>
      </svg>
    );
  };

  const renderHome = () => {
    // compute levels and progress 0..10
    const intLevel = Math.floor(intelligence / 10);
    const strLevel = Math.floor(strength / 10);
    const intProgress = intelligence % 10;
    const strProgress = strength % 10;

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-0">
        <div className="relative">
          {renderStickman(200)}
          
          {/* Stats around stickman */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4">
            <div className="bg-teal-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-teal-500/50">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-teal-400" />
                <span className="text-white font-bold">{intelligence}</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4">
            <div className="bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-red-500/50">
              <div className="flex items-center gap-2">
                <Dumbbell size={16} className="text-red-400" />
                <span className="text-white font-bold">{strength}</span>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mt-6">Добро пожаловать, {currentUser}!</h2>
        <p className="text-gray-400 mt-2">Используйте навигацию для улучшения навыков</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">Уровень {intLevel}</div>
            <div className="text-gray-300 text-sm mt-2">{intProgress}/10</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">Уровень {strLevel}</div>
            <div className="text-gray-300 text-sm mt-2">{strProgress}/10</div>
          </div>
        </div>
      </div>
    );
  };

  const resetProgress = () => {
    if (window.confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить!')) {
      setIntelligence(0);
      setStrength(0);
      setIntTasks([]);
      setStrTasks([]);
      setHistory([]);
      setCompletedHistory([]);
      alert('Прогресс сброшен!');
    }
  };

  const renderCustomize = () => (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Кастомизация персонажа</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Предпросмотр</h2>
          <div className="flex justify-center">
            {renderStickman(250)}
          </div>
        </div>
        
        {/* Customization options */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Головные уборы</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setHat('none')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  hat === 'none' 
                    ? 'border-teal-500 bg-teal-500/20' 
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🚫</div>
                  <div className="text-white font-medium">Без шапки</div>
                </div>
              </button>
              
              <button
                onClick={() => setHat('santa')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  hat === 'santa' 
                    ? 'border-teal-500 bg-teal-500/20' 
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🎅</div>
                  <div className="text-white font-medium">Новогодняя</div>
                </div>
              </button>
              
              <button
                onClick={() => setHat('cap')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  hat === 'cap' 
                    ? 'border-teal-500 bg-teal-500/20' 
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🧢</div>
                  <div className="text-white font-medium">Кепка</div>
                </div>
              </button>
              
              <button
                onClick={() => setHat('bandana')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  hat === 'bandana' 
                    ? 'border-teal-500 bg-teal-500/20' 
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🔴</div>
                  <div className="text-white font-medium">Бандана</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Цвет персонажа</h2>
            
            <div className="grid grid-cols-4 gap-3">
              {['#43BCCD', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'].map(color => (
                <button
                  key={color}
                  onClick={() => setStickmanColor(color)}
                  className={`h-16 rounded-lg border-4 transition-all ${stickmanColor === color ? 'border-white scale-110' : 'border-white/20 hover:border-white/40'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Опасная зона</h2>
            <p className="text-gray-300 mb-4">Сброс прогресса удалит все ваши навыки и историю выполненных заданий.</p>
            <button
              onClick={resetProgress}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-base"
            >
              🗑️ Сбросить весь прогресс
            </button>
          </div>
          
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
            <p className="text-teal-400 text-sm">
              💡 Все изменения сохраняются автоматически!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkills = () => {
    const intLevel = Math.floor(intelligence / 10);
    const strLevel = Math.floor(strength / 10);
    const intProgress = intelligence % 10;
    const strProgress = strength % 10;

    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Улучшение навыков</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-teal-400" size={32} />
              <h2 className="text-2xl font-bold text-white">Интеллект</h2>
            </div>
            <div className="text-5xl font-bold text-teal-400 mb-2">{intelligence}</div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(intProgress / 10) * 100}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-2">Уровень: {intLevel} — {intProgress}/10</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Dumbbell className="text-red-400" size={32} />
              <h2 className="text-2xl font-bold text-white">Сила</h2>
            </div>
            <div className="text-5xl font-bold text-red-400 mb-2">{strength}</div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(strProgress / 10) * 100}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-2">Уровень: {strLevel} — {strProgress}/10</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-teal-500/30">
            <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
              <Brain size={24} />
              Задания на интеллект
            </h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newIntTask}
                onChange={(e) => setNewIntTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIntTask()}
                placeholder="Новое задание..."
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={addIntTask}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-3 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {intTasks.map(task => (
                <div key={task.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <span className="text-white flex-1">{task.text}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeIntTask(task.id)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                      aria-label="Выполнить"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => deleteIntTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Удалить"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {intTasks.length === 0 && (
                <p className="text-gray-400 text-center py-8">Нет заданий</p>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Dumbbell size={24} />
              Задания на силу
            </h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newStrTask}
                onChange={(e) => setNewStrTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStrTask()}
                placeholder="Новое задание..."
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={addStrTask}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {strTasks.map(task => (
                <div key={task.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <span className="text-white flex-1">{task.text}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeStrTask(task.id)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                      aria-label="Выполнить"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => deleteStrTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Удалить"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {strTasks.length === 0 && (
                <p className="text-gray-400 text-center py-8">Нет заданий</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    // prepare Y axis ticks and domain so ticks are integers 0..N (min 10)
    const maxInt = history.length ? Math.max(...history.map(h => h.intelligence || 0)) : 0;
    const maxStr = history.length ? Math.max(...history.map(h => h.strength || 0)) : 0;
    const yMaxSingle = Math.max(maxInt, maxStr, 10); // at least 10
    // if yMaxSingle is small, show every integer; if large, create steps
    let ticks = [];
    if (yMaxSingle <= 20) {
      for (let i = 0; i <= yMaxSingle; i++) ticks.push(i);
    } else {
      // generate stepped ticks (approx 10 ticks)
      const step = Math.ceil(yMaxSingle / 10);
      for (let v = 0; v <= yMaxSingle; v += step) ticks.push(v);
      if (ticks[ticks.length - 1] !== yMaxSingle) ticks.push(yMaxSingle);
    }

    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">История выполненных заданий</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">График прогресса</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              {/* Use integer ticks for Y axis (0..yMaxSingle) */}
              <YAxis stroke="#ffffff80" ticks={ticks} domain={[0, Math.max(...ticks)]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="intelligence" stroke="#43BCCD" strokeWidth={2} name="Интеллект" />
              <Line type="monotone" dataKey="strength" stroke="#ef4444" strokeWidth={2} name="Сила" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-gray-400 text-sm mt-4">Показаны последние 14 дней активности</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Выполненные задания</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {completedHistory.map(item => (
              <div key={item.id} className="bg-white/5 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === 'intelligence' ? (
                      <Brain size={16} className="text-teal-400" />
                    ) : (
                      <Dumbbell size={16} className="text-red-400" />
                    )}
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{item.date}</div>
                </div>
                <div className={`text-lg font-bold ${item.type === 'intelligence' ? 'text-teal-400' : 'text-red-400'}`}>
                  +{item.points}
                </div>
              </div>
            ))}
            {completedHistory.length === 0 && (
              <p className="text-gray-400 text-center py-8">Нет выполненных заданий</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation: mobile-friendly (horiz scroll) */}
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  currentPage === 'home' 
                    ? 'bg-teal-500/20 text-teal-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Home size={18} />
                Главная
              </button>
              <button
                onClick={() => setCurrentPage('skills')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  currentPage === 'skills' 
                    ? 'bg-teal-500/20 text-teal-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Target size={18} />
                Навыки
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  currentPage === 'history' 
                    ? 'bg-teal-500/20 text-teal-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History size={18} />
                История
              </button>
              <button
                onClick={() => setCurrentPage('customize')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  currentPage === 'customize' 
                    ? 'bg-teal-500/20 text-teal-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shirt size={18} />
                Персонаж
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'skills' && renderSkills()}
        {currentPage === 'history' && renderHistory()}
        {currentPage === 'customize' && renderCustomize()}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 sm:p-8 border-2 border-white/30 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Подтвердить выполнение?</h3>
            <p className="text-gray-300 mb-6">Вы действительно выполнили это задание?</p>
            <div className="flex gap-4">
              <button
                onClick={confirmComplete}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Да, выполнено!
              </button>
              <button
                onClick={cancelComplete}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
