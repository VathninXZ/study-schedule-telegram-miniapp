import React, { useState } from 'react';
import { Award, TrendingUp, BarChart3, Edit3, Save } from 'lucide-react';
import { initialFocusStats } from '../mockData';

export default function Analytics({ gpaCourses, setGpaCourses, showToast }) {
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');

  const gradeValues = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0,
    'D': 1.0, 'F': 0.0,
    '': null
  };

  const gradesList = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

  // Calculate Cumulative GPA
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    gpaCourses.forEach(c => {
      if (c.status === 'Completed' && c.grade && gradeValues[c.grade] !== null) {
        totalPoints += gradeValues[c.grade] * c.credits;
        totalCredits += c.credits;
      }
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const handleEditGrade = (course) => {
    setEditingCourseId(course.id);
    setSelectedGrade(course.grade || 'A');
  };

  const handleSaveGrade = (courseId) => {
    const updated = gpaCourses.map(c => {
      if (c.id === courseId) {
        // If they select a grade, mark as Completed, else Keep In Progress
        return {
          ...c,
          grade: selectedGrade,
          status: selectedGrade ? 'Completed' : 'In Progress'
        };
      }
      return c;
    });
    setGpaCourses(updated);
    setEditingCourseId(null);
    showToast('Course grade updated!');
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  // SVG Chart Computations (Focus stats)
  const chartHeight = 120;
  const chartWidth = 320;
  const barWidth = 26;
  const gap = 16;
  const maxMinutes = Math.max(...initialFocusStats.map(s => s.minutes), 60);

  return (
    <div className="tab-content-container">
      
      {/* GPA Dashboard Circle */}
      <div className="glass-panel" style={{ 
        padding: '20px', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.15)'
      }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-secondary)' }}>Academic Standing</h3>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
            GPA Tracker
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color="var(--color-success)" />
            Target: 3.80 GPA
          </p>
        </div>

        {/* GPA Bubble */}
        <div style={{
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '3px solid var(--color-primary)',
          boxShadow: '0 0 15px var(--color-primary-glow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: 'Outfit' }}>
            {calculateGPA()}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            GPA
          </span>
        </div>
      </div>

      {/* SVG Bar Chart Card */}
      <div className="glass-panel" style={{ padding: '18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BarChart3 size={16} color="var(--color-secondary)" />
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Weekly Study Focus (minutes)</h4>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={chartWidth} height={chartHeight + 25} style={{ overflow: 'visible' }}>
            {initialFocusStats.map((s, idx) => {
              const barHeight = s.minutes > 0 ? (s.minutes / maxMinutes) * chartHeight : 4; // minimum 4px height so you see empty days
              const x = idx * (barWidth + gap) + 12;
              const y = chartHeight - barHeight;
              
              return (
                <g key={s.day}>
                  {/* Bar shadow/glow */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    fill={s.minutes > 0 ? 'url(#barGradient)' : 'rgba(255,255,255,0.05)'}
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />
                  {/* Top glowing cap */}
                  {s.minutes > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height="3"
                      rx="1.5"
                      fill="var(--color-secondary)"
                    />
                  )}
                  {/* Text value inside/above bar */}
                  {s.minutes > 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill="var(--text-secondary)"
                      fontSize="9px"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {s.minutes}m
                    </text>
                  )}
                  {/* Day Label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 16}
                    fill="var(--text-muted)"
                    fontSize="11px"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {s.day}
                  </text>
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-secondary)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Grade Listing / Semester Checklist */}
      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Course Gradebook
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {gpaCourses.map(c => {
          const isEditing = editingCourseId === c.id;
          return (
            <div key={c.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{c.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {c.credits} Credits • {c.status}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="glass-input"
                      style={{ 
                        padding: '4px 8px', 
                        width: '65px', 
                        fontSize: '13px', 
                        appearance: 'none', 
                        background: 'rgba(255, 255, 255, 0.06)',
                        height: '32px'
                      }}
                    >
                      <option value="">N/A</option>
                      {gradesList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    
                    <button 
                      onClick={() => handleSaveGrade(c.id)}
                      style={{ border: 'none', background: 'var(--color-success)', color: '#fff', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                    >
                      <Save size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '800', 
                      color: c.grade ? 'var(--color-primary)' : 'var(--text-muted)',
                      background: c.grade ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.03)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      minWidth: '35px',
                      textAlign: 'center'
                    }}>
                      {c.grade || '-'}
                    </span>
                    
                    <button 
                      onClick={() => handleEditGrade(c)}
                      style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Edit3 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
