import React, { useState, useEffect } from 'react';
import { initialClasses, initialTasks, initialGPACourses } from './mockData';

// Import Views
import Dashboard from './views/Dashboard';
import Timetable from './views/Timetable';
import TaskManager from './views/TaskManager';
import Pomodoro from './views/Pomodoro';
import Analytics from './views/Analytics';

// Import Icons for Navigation
import { Home, Calendar, CheckSquare, Clock, BarChart2 } from 'lucide-react';

export default function App() {
  const tg = window.Telegram?.WebApp;

  // Telegram theme class mapping
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Set main colors
      tg.setHeaderColor('#08090d');
      tg.setBackgroundColor('#08090d');
      
      // Inject telegram-app class onto body to trigger override CSS variables
      document.body.classList.add('telegram-app');
    }
  }, [tg]);

  // Retrieve user details from Telegram SDK, or fallback to mock
  const user = tg?.initDataUnsafe?.user || {
    id: 906605365,
    first_name: 'Alex',
    last_name: 'Developer',
    username: 'alex_dev'
  };

  // State initialization with localStorage
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('studysync_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('studysync_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [todayFocusMinutes, setTodayFocusMinutes] = useState(() => {
    const saved = localStorage.getItem('studysync_focus');
    return saved ? Number(saved) : 45;
  });

  const [gpaCourses, setGpaCourses] = useState(() => {
    const saved = localStorage.getItem('studysync_gpa');
    return saved ? JSON.parse(saved) : initialGPACourses;
  });

  // Current Screen / Tab View
  const [view, setView] = useState('dashboard'); // dashboard, timetable, tasks, pomodoro, analytics

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('studysync_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('studysync_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studysync_focus', String(todayFocusMinutes));
  }, [todayFocusMinutes]);

  useEffect(() => {
    localStorage.setItem('studysync_gpa', JSON.stringify(gpaCourses));
  }, [gpaCourses]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('studysync_classes');
    localStorage.removeItem('studysync_tasks');
    localStorage.removeItem('studysync_focus');
    localStorage.removeItem('studysync_gpa');
    setClasses(initialClasses);
    setTasks(initialTasks);
    setTodayFocusMinutes(45);
    setGpaCourses(initialGPACourses);
    triggerToast('App reset to beautiful default mock data! 🔄');
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  };

  const handleTabChange = (targetView) => {
    setView(targetView);
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  };

  // Render current view
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            classes={classes} 
            tasks={tasks} 
            todayFocusMinutes={todayFocusMinutes} 
            setView={setView}
            showToast={triggerToast}
            resetToDefaults={resetToDefaults}
          />
        );
      case 'timetable':
        return (
          <Timetable 
            classes={classes} 
            setClasses={setClasses} 
            showToast={triggerToast} 
          />
        );
      case 'tasks':
        return (
          <TaskManager 
            tasks={tasks} 
            setTasks={setTasks} 
            classes={classes} 
            showToast={triggerToast} 
          />
        );
      case 'pomodoro':
        return (
          <Pomodoro 
            todayFocusMinutes={todayFocusMinutes} 
            setTodayFocusMinutes={setTodayFocusMinutes} 
            showToast={triggerToast} 
          />
        );
      case 'analytics':
        return (
          <Analytics 
            gpaCourses={gpaCourses} 
            setGpaCourses={setGpaCourses} 
            showToast={triggerToast} 
          />
        );
      default:
        return <div style={{ color: '#fff', padding: '20px' }}>Loading...</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notice */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      {/* Render Active Page Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </div>

      {/* Glassmorphic Bottom Navigation Bar */}
      <nav className="glass-panel" style={{ 
        position: 'fixed', 
        bottom: '16px', 
        left: '16px', 
        right: '16px', 
        height: '66px', 
        borderRadius: '20px', 
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        padding: '0 8px',
        zIndex: 999,
        background: 'rgba(15, 17, 26, 0.85)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Dashboard Tab */}
        <button 
          onClick={() => handleTabChange('dashboard')}
          style={navButtonStyle(view === 'dashboard', 'var(--color-primary)')}
        >
          <Home size={20} color={view === 'dashboard' ? 'var(--color-primary)' : 'var(--text-secondary)'} />
          <span style={navSpanStyle(view === 'dashboard')}>Home</span>
          {view === 'dashboard' && <span style={glowIndicatorStyle('var(--color-primary)')}></span>}
        </button>

        {/* Timetable Tab */}
        <button 
          onClick={() => handleTabChange('timetable')}
          style={navButtonStyle(view === 'timetable', 'var(--color-secondary)')}
        >
          <Calendar size={20} color={view === 'timetable' ? 'var(--color-secondary)' : 'var(--text-secondary)'} />
          <span style={navSpanStyle(view === 'timetable')}>Schedule</span>
          {view === 'timetable' && <span style={glowIndicatorStyle('var(--color-secondary)')}></span>}
        </button>

        {/* Tasks Tab */}
        <button 
          onClick={() => handleTabChange('tasks')}
          style={navButtonStyle(view === 'tasks', 'var(--color-accent)')}
        >
          <CheckSquare size={20} color={view === 'tasks' ? 'var(--color-accent)' : 'var(--text-secondary)'} />
          <span style={navSpanStyle(view === 'tasks')}>Tasks</span>
          {view === 'tasks' && <span style={glowIndicatorStyle('var(--color-accent)')}></span>}
        </button>

        {/* Pomodoro Tab */}
        <button 
          onClick={() => handleTabChange('pomodoro')}
          style={navButtonStyle(view === 'pomodoro', 'var(--color-primary)')}
        >
          <Clock size={20} color={view === 'pomodoro' ? 'var(--color-primary)' : 'var(--text-secondary)'} />
          <span style={navSpanStyle(view === 'pomodoro')}>Focus</span>
          {view === 'pomodoro' && <span style={glowIndicatorStyle('var(--color-primary)')}></span>}
        </button>

        {/* Analytics Tab */}
        <button 
          onClick={() => handleTabChange('analytics')}
          style={navButtonStyle(view === 'analytics', 'var(--color-secondary)')}
        >
          <BarChart2 size={20} color={view === 'analytics' ? 'var(--color-secondary)' : 'var(--text-secondary)'} />
          <span style={navSpanStyle(view === 'analytics')}>Stats</span>
          {view === 'analytics' && <span style={glowIndicatorStyle('var(--color-secondary)')}></span>}
        </button>
      </nav>
    </div>
  );
}

// Inline Styles Helper functions
const navButtonStyle = (isActive, activeColor) => ({
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  gap: '4px',
  flex: 1,
  height: '100%',
  position: 'relative',
  padding: '6px 0',
  transition: 'all 0.3s ease',
  transform: isActive ? 'scale(1.08) translateY(-2px)' : 'none'
});

const navSpanStyle = (isActive) => ({
  fontSize: '10px',
  fontWeight: isActive ? '700' : '500',
  color: isActive ? '#fff' : 'var(--text-muted)',
  transition: 'all 0.3s ease'
});

const glowIndicatorStyle = (color) => ({
  position: 'absolute',
  top: '2px',
  width: '18px',
  height: '3px',
  borderRadius: '2px',
  background: color,
  boxShadow: `0 0 10px 2px ${color}`,
  animation: 'pulseGlow 2.5s infinite'
});
