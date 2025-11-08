import './storage';
import React, { useState, useEffect } from 'react';
import { Brain, Dumbbell, Plus, Check, X, LogOut, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RPGTaskManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showStats, setShowStats] = useState(false);
  
  const [intelligence, setIntelligence] = useState(0);
  const [strength, setStrength] = useState(0);
  const [intTasks, setIntTasks] = useState([]);
  const [strTasks, setStrTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [newIntTask, setNewIntTask] = useState('');
  const [newStrTask, setNewStrTask] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);

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
      history
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
  }, [intelligence, strength, intTasks, strTasks, history]);

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
    
    if (pendingTask.type === 'int') {
      setIntTasks(intTasks.filter(t => t.id !== pendingTask.id));
      setIntelligence(intelligence + 10);
      
      const newHistory = [...history];
      const todayEntry = newHistory.find(h => h.date === today);
      if (todayEntry) {
        todayEntry.intelligence += 10;
      } else {
        newHistory.push({ date: today, intelligence: 10, strength: 0 });
      }
      setHistory(newHistory);
    } else {
      setStrTasks(strTasks.filter(t => t.id !== pendingTask.id));
      setStrength(strength + 10);
      
      const newHistory = [...history];
      const todayEntry = newHistory.find(h => h.date === today);
      if (todayEntry) {
        todayEntry.strength += 10;
      } else {
        newHistory.push({ date: today, intelligence: 0, strength: 10 });
      }
      setHistory(newHistory);
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
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-6">
            ⚔️ RPG Задачник
          </h1>
          
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="Пароль"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
            
            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">⚔️ Система навыков</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <BarChart3 size={20} />
              Статистика
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </div>

        {showStats && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">График прогресса</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="intelligence" stroke="#43BCCD" strokeWidth={2} name="Интеллект" />
                <Line type="monotone" dataKey="strength" stroke="#ef4444" strokeWidth={2} name="Сила" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-gray-400 text-sm mt-4">Показаны последние 14 дней активности</p>
          </div>
        )}
        
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
                style={{ width: `${Math.min((intelligence % 100), 100)}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-2">Уровень: {Math.floor(intelligence / 100) + 1}</p>
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
                style={{ width: `${Math.min((strength % 100), 100)}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-2">Уровень: {Math.floor(strength / 100) + 1}</p>
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
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={addIntTask}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-2 transition-colors"
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
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => deleteIntTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={addStrTask}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-colors"
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
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => deleteStrTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border-2 border-white/30 max-w-md w-full mx-4">
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