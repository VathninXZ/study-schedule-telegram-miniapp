import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Clock, MapPin, User, ChevronDown, ChevronUp } from 'lucide-react';

export default function Timetable({ classes, setClasses, showToast }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [activeDay, setActiveDay] = useState(() => {
    const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon, etc.
    const mapping = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return mapping[todayIndex];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState(null);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [subject, setSubject] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [timeStart, setTimeStart] = useState('09:00');
  const [timeEnd, setTimeEnd] = useState('10:30');
  const [room, setRoom] = useState('');
  const [type, setType] = useState('Lecture');
  const [color, setColor] = useState('#6366f1'); // Indigo default

  const colorOptions = [
    { value: '#6366f1', name: 'Indigo' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#10b981', name: 'Emerald' },
    { value: '#f59e0b', name: 'Amber' }
  ];

  // Filter classes for active day and sort by start time
  const dayClasses = classes
    .filter(c => c.day === activeDay)
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

  const toggleExpand = (id) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setSubject('');
    setLecturer('');
    setTimeStart('09:00');
    setTimeEnd('10:30');
    setRoom('');
    setType('Lecture');
    setColor('#6366f1');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls, e) => {
    e.stopPropagation(); // Avoid triggering accordion close/expand
    setEditingId(cls.id);
    setSubject(cls.subject);
    setLecturer(cls.lecturer);
    setTimeStart(cls.timeStart);
    setTimeEnd(cls.timeEnd);
    setRoom(cls.room);
    setType(cls.type);
    setColor(cls.color);
    setIsModalOpen(true);
  };

  const handleDeleteClass = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this class?')) {
      const updated = classes.filter(c => c.id !== id);
      setClasses(updated);
      showToast('Class deleted.');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Please enter a subject name');
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = classes.map(c => {
        if (c.id === editingId) {
          return {
            ...c,
            subject,
            lecturer,
            timeStart,
            timeEnd,
            room,
            type,
            color,
            day: activeDay
          };
        }
        return c;
      });
      setClasses(updated);
      showToast('Class details updated.');
    } else {
      // Create new
      const newClass = {
        id: `class-${Date.now()}`,
        subject,
        lecturer,
        timeStart,
        timeEnd,
        room,
        type,
        color,
        day: activeDay
      };
      setClasses([...classes, newClass]);
      showToast('New class scheduled!');
    }

    setIsModalOpen(false);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="tab-content-container">
      {/* Weekday Selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px', 
        overflowX: 'auto', 
        paddingBottom: '6px',
        gap: '6px'
      }}>
        {days.map(d => {
          const isActive = d === activeDay;
          return (
            <button
              key={d}
              onClick={() => {
                setActiveDay(d);
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                }
              }}
              style={{
                flex: 1,
                minWidth: '45px',
                padding: '10px 0',
                border: 'none',
                borderRadius: '12px',
                background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                boxShadow: isActive ? '0 4px 10px var(--color-primary-glow)' : 'none',
                transform: isActive ? 'scale(1.05)' : 'none'
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
          Schedule for {activeDay}
        </h3>
        <button 
          className="glass-button" 
          onClick={handleOpenAddModal}
          style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px', gap: '4px' }}
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      {/* Class Timeline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {dayClasses.length > 0 ? (
          dayClasses.map(c => {
            const isExpanded = expandedClassId === c.id;
            return (
              <div 
                key={c.id} 
                className="glass-card" 
                onClick={() => toggleExpand(c.id)}
                style={{ 
                  padding: '16px', 
                  borderLeft: `4px solid ${c.color}`,
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: c.color, background: `${c.color}15`, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {c.type}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '6px' }}>
                      {c.subject}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                      <Clock size={12} />
                      <span>{c.timeStart} - {c.timeEnd}</span>
                    </div>
                  </div>
                  
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ 
                    marginTop: '14px', 
                    paddingTop: '12px', 
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {c.lecturer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <User size={13} color="var(--color-primary)" />
                        <span>Lecturer: {c.lecturer}</span>
                      </div>
                    )}
                    {c.room && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <MapPin size={13} color="var(--color-secondary)" />
                        <span>Location: {c.room}</span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignSelf: 'flex-end' }}>
                      <button 
                        onClick={(e) => handleOpenEditModal(c, e)}
                        style={{ 
                          background: 'rgba(255,255,255,0.06)', 
                          border: 'none', 
                          borderRadius: '8px', 
                          padding: '6px 10px', 
                          color: 'var(--text-primary)', 
                          fontSize: '12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClass(c.id, e)}
                        style={{ 
                          background: 'rgba(236,72,153,0.1)', 
                          border: 'none', 
                          borderRadius: '8px', 
                          padding: '6px 10px', 
                          color: 'var(--color-accent)', 
                          fontSize: '12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', opacity: 0.8 }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
              No classes scheduled for {activeDay}
            </p>
          </div>
        )}
      </div>

      {/* Class Form Modal */}
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
              {editingId ? 'Edit Scheduled Class' : 'Schedule New Class'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Subject Name</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  placeholder="e.g. Software Engineering" 
                  className="glass-input" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Lecturer / Teacher</label>
                <input 
                  type="text" 
                  value={lecturer} 
                  onChange={e => setLecturer(e.target.value)} 
                  placeholder="e.g. Dr. Jane Smith" 
                  className="glass-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Time</label>
                  <input 
                    type="time" 
                    value={timeStart} 
                    onChange={e => setTimeStart(e.target.value)} 
                    className="glass-input" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>End Time</label>
                  <input 
                    type="time" 
                    value={timeEnd} 
                    onChange={e => setTimeEnd(e.target.value)} 
                    className="glass-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Location / Room</label>
                  <input 
                    type="text" 
                    value={room} 
                    onChange={e => setRoom(e.target.value)} 
                    placeholder="e.g. Auditorium IV / Zoom" 
                    className="glass-input" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>Class Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)} 
                    className="glass-input"
                    style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Self-Study">Self-Study</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Card Theme Accent</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {colorOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: opt.value,
                        border: color === opt.value ? '2px solid #fff' : '2px solid transparent',
                        cursor: 'pointer',
                        transform: color === opt.value ? 'scale(1.15)' : 'none',
                        transition: 'var(--transition-fast)',
                        boxShadow: color === opt.value ? `0 0 10px ${opt.value}` : 'none'
                      }}
                      title={opt.name}
                    ></button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="glass-button" 
                style={{ marginTop: '12px', width: '100%' }}
              >
                {editingId ? 'Save Changes' : 'Schedule Class'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
