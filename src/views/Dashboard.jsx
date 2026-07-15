import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, BookOpen, Flame, Bell, Play } from 'lucide-react';

export default function Dashboard({ 
  user, 
  classes, 
  tasks, 
  todayFocusMinutes, 
  setView, 
  showToast 
}) {
  const [nextClass, setNextClass] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

  // Get current day abbreviation (e.g. "Mon")
  const getTodayAbbr = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  useEffect(() => {
    // Find next class for today
    const todayAbbr = getTodayAbbr();
    const todayClasses = classes.filter(c => c.day === todayAbbr);
    
    if (todayClasses.length > 0) {
      // Sort today's classes by start time
      const sorted = [...todayClasses].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
      
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
      
      // Find the first class that starts after the current time
      const upcoming = sorted.find(c => c.timeStart > currentTimeStr);
      
      if (upcoming) {
        setNextClass(upcoming);
        
        // Calculate remaining time
        const [sh, sm] = upcoming.timeStart.split(':').map(Number);
        const targetDate = new Date();
        targetDate.setHours(sh, sm, 0, 0);
        
        const diffMs = targetDate - now;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins > 60) {
          const hrs = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          setTimeRemaining(`starts in ${hrs}h ${mins}m`);
        } else {
          setTimeRemaining(`starts in ${diffMins} mins`);
        }
      } else {
        // No more classes today, show the first class of tomorrow (or next class overall)
        setNextClass(sorted[0] || null);
        setTimeRemaining('completed for today');
      }
    } else {
      // Find the first available class in the week
      const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const sortedClasses = [...classes].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.timeStart.localeCompare(b.timeStart);
      });
      if (sortedClasses.length > 0) {
        setNextClass(sortedClasses[0]);
        setTimeRemaining(`on ${sortedClasses[0].day} at ${sortedClasses[0].timeStart}`);
      } else {
        setNextClass(null);
        setTimeRemaining('No classes scheduled');
      }
    }
  }, [classes]);

  // Calculate task counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate classes counts
  const todayAbbr = getTodayAbbr();
  const todayClassesCount = classes.filter(c => c.day === todayAbbr).length;

  // Send real Telegram notification using HTTP API and user chat_id
  const sendTelegramReminder = async () => {
    if (sendingNotification) return;
    setSendingNotification(true);
    
    // Telegram Bot configuration from user request
    const botToken = '8919917581:AAElpriRpPugErdJyrtHMrtvWyl62DXFhN8';
    const chatId = '906605365';
    
    const messageText = `🔔 *StudySync Reminder*\n\nHey ${user?.first_name || 'Student'}! 👋\n` + 
      (nextClass 
        ? `Your next class *${nextClass.subject}* is scheduled for *${nextClass.timeStart}* (${timeRemaining}) in *${nextClass.room}*.\nLecturer: _${nextClass.lecturer}_`
        : `You have no upcoming classes scheduled right now. Go conquer your homework task list! 🚀`);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();
      if (data.ok) {
        showToast('Notification sent to Telegram! Check your bot. 💬');
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } else {
        showToast('Error sending bot message: ' + data.description);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while sending notification.');
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="tab-content-container">
      {/* Top Banner / Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(90deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hey, {user?.first_name || 'Guest'}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        
        {/* Streak 🔥 */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <Flame size={18} color="var(--color-warning)" style={{ animation: 'float 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-warning)' }}>5 Days</span>
        </div>
      </div>

      {/* Up Next Class Card */}
      <div className="glass-panel glass-panel-hover" style={{ padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${nextClass?.color || 'var(--color-primary)'} 0%, transparent 70%)`, opacity: 0.15, pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '6px' }}>
            Up Next
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {timeRemaining}
          </span>
        </div>

        {nextClass ? (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#fff' }}>{nextClass.subject}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              {nextClass.lecturer} • {nextClass.room}
            </p>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff', background: `${nextClass.color}40`, border: `1px solid ${nextClass.color}60`, padding: '4px 10px', borderRadius: '20px' }}>
                {nextClass.type}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                {nextClass.timeStart} - {nextClass.timeEnd}
              </span>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No upcoming classes scheduled.</p>
        )}
      </div>

      {/* Grid: Overview Rings */}
      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Today's Stats
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {/* Classes Attended Card */}
        <div className="glass-panel" style={{ padding: '16px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
            <BookOpen size={20} color="var(--color-primary)" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{todayClassesCount}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Classes</span>
        </div>

        {/* Tasks Completed Card */}
        <div className="glass-panel" style={{ padding: '16px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
            <CheckSquare size={20} color="var(--color-success)" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
            {completedTasks}/{totalTasks}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Tasks ({taskProgressPercent}%)
          </span>
        </div>

        {/* Study Hours Card */}
        <div className="glass-panel" style={{ padding: '16px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
            <Clock size={20} color="var(--color-secondary)" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{todayFocusMinutes}m</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Focus</span>
        </div>
      </div>

      {/* Focus Promotion Card */}
      <div className="glass-panel" style={{ 
        padding: '18px', 
        marginBottom: '20px', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)', 
        border: '1px solid rgba(99, 102, 241, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setView('pomodoro')}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Focus Study Session</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Start a Pomodoro timer and block out distractions.
          </p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)', transition: 'var(--transition-smooth)' }}>
          <Play size={16} fill="#fff" color="#fff" />
        </div>
      </div>

      {/* Telegram Action Section */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={15} color="var(--color-accent)" />
            Telegram Bot Linkage
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Test your StudySync Telegram bot reminder triggers directly on your device.
          </p>
        </div>
        
        <button 
          className="glass-button" 
          style={{ 
            background: 'linear-gradient(90deg, #0088cc, #00a2ed)', 
            boxShadow: '0 4px 12px rgba(0, 136, 204, 0.25)',
            marginTop: '4px',
            fontSize: '13px',
            padding: '10px 16px',
            width: '100%',
            fontWeight: '600'
          }}
          onClick={sendTelegramReminder}
          disabled={sendingNotification}
        >
          {sendingNotification ? 'Triggering...' : 'Send Live Telegram Alert'}
        </button>
      </div>
    </div>
  );
}
