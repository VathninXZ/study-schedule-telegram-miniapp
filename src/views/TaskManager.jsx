import React, { useState } from 'react';
import { Plus, X, Calendar, CheckCircle2, Circle, AlertCircle, Trash2, Edit2 } from 'lucide-react';

export default function TaskManager({ tasks, setTasks, classes, showToast }) {
  const [activeTab, setActiveTab] = useState('Todo'); // Todo, In Progress, Completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Mid');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('Todo');

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'Todo') return t.status === 'Todo';
    if (activeTab === 'In Progress') return t.status === 'In Progress';
    return t.status === 'Completed';
  });

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'var(--color-accent)'; // Pink
      case 'Mid': return 'var(--color-warning)'; // Amber
      case 'Low': return 'var(--color-secondary)'; // Cyan
      default: return 'var(--text-secondary)';
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setPriority('Mid');
    setSubject(classes[0]?.subject || '');
    setStatus(activeTab);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t, e) => {
    e.stopPropagation();
    setEditingId(t.id);
    setTitle(t.title);
    setDueDate(t.dueDate);
    setPriority(t.priority);
    setSubject(t.subject || '');
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleToggleTaskStatus = (task, e) => {
    e.stopPropagation();
    let nextStatus = 'Completed';
    if (task.status === 'Completed') {
      nextStatus = 'Todo';
    }
    
    const updated = tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);
    
    if (nextStatus === 'Completed') {
      showToast('Task completed! Great job! 🎉');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } else {
      showToast('Task marked as incomplete.');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  };

  const handleDeleteTask = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      showToast('Task deleted.');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a task title');
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = tasks.map(t => {
        if (t.id === editingId) {
          return {
            ...t,
            title,
            dueDate,
            priority,
            subject,
            status
          };
        }
        return t;
      });
      setTasks(updated);
      showToast('Task updated successfully.');
    } else {
      // Create new
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        dueDate,
        priority,
        status,
        subject
      };
      setTasks([...tasks, newTask]);
      showToast('New homework task added!');
    }

    setIsModalOpen(false);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="tab-content-container">
      {/* Category Tabs */}
      <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '14px', marginBottom: '20px' }}>
        {['Todo', 'In Progress', 'Completed'].map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                }
              }}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'none',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
          {activeTab} List
        </h3>
        <button 
          className="glass-button" 
          onClick={handleOpenAddModal}
          style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px', gap: '4px' }}
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(t => {
            const priorityColor = getPriorityColor(t.priority);
            const isCompleted = t.status === 'Completed';
            
            return (
              <div 
                key={t.id} 
                className="glass-card"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  padding: '16px',
                  background: isCompleted ? 'rgba(22, 25, 38, 0.4)' : 'var(--bg-card)',
                  opacity: isCompleted ? 0.75 : 1
                }}
              >
                {/* Status Toggle Box */}
                <button
                  onClick={(e) => handleToggleTaskStatus(t, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isCompleted ? 'var(--color-success)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={22} color="var(--color-success)" style={{ filter: 'drop-shadow(0 0 4px var(--color-success-glow))' }} />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: isCompleted ? 'var(--text-secondary)' : '#fff',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    lineHeight: '1.4'
                  }}>
                    {t.title}
                  </h4>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                    {t.subject && (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                        {t.subject}
                      </span>
                    )}
                    
                    <span style={{ 
                      fontSize: '10px', 
                      color: priorityColor, 
                      background: `${priorityColor}15`, 
                      border: `1px solid ${priorityColor}30`,
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      {t.priority}
                    </span>

                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
                      <Calendar size={10} />
                      {t.dueDate}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Controls */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => handleOpenEditModal(t, e)}
                    style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTask(t.id, e)}
                    style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', opacity: 0.8 }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
              No tasks in this category
            </p>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.65)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '400px', 
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
              {editingId ? 'Edit Homework Task' : 'Add Homework Task'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Task Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Write database lab report" 
                  className="glass-input" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Class / Course Link</label>
                <select 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  className="glass-input"
                  style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <option value="">No linked class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.subject}>{c.subject}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    className="glass-input" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Priority</label>
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)} 
                    className="glass-input"
                    style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    <option value="High">🔴 High</option>
                    <option value="Mid">🟡 Mid</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>
              </div>

              {editingId && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="glass-input"
                    style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="glass-button" 
                style={{ marginTop: '12px', width: '100%' }}
              >
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
