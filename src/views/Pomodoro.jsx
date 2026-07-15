import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function Pomodoro({ todayFocusMinutes, setTodayFocusMinutes, showToast }) {
  // Timer States
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Audio states
  const [activeSound, setActiveSound] = useState(null); // lofi, rain, forest, noise
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const timerRef = useRef(null);
  
  // Web Audio API References
  const audioContextRef = useRef(null);
  const audioNodesRef = useRef({
    source: null,
    filter: null,
    gain: null,
    oscillators: []
  });

  const modeDurations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  useEffect(() => {
    setTimeLeft(modeDurations[mode]);
    setIsActive(false);
    clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    
    if (mode === 'focus') {
      const minutesAdded = modeDurations.focus / 60;
      setTodayFocusMinutes(prev => prev + minutesAdded);
      setCompletedSessions(prev => prev + 1);
      showToast('Focus session complete! Take a break. 🏆');
      
      // Haptic feedback if in Telegram
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setMode('shortBreak');
    } else {
      showToast('Break finished! Ready to focus? 💪');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }
      setMode('focus');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeDurations[mode]);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVG Circular progress math
  const maxSeconds = modeDurations[mode];
  const progress = (timeLeft / maxSeconds);
  const strokeDashoffset = 280 - (280 * progress); // 280 is approx circumference for radius 44

  // Web Audio Synthesizer logic (No audio file assets needed)
  const stopAmbientAudio = () => {
    // Stop noise buffer source
    if (audioNodesRef.current.source) {
      try {
        audioNodesRef.current.source.stop();
      } catch (e) {}
      audioNodesRef.current.source = null;
    }
    // Stop synthesizer oscillators
    if (audioNodesRef.current.oscillators.length > 0) {
      audioNodesRef.current.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      audioNodesRef.current.oscillators = [];
    }
    setIsAudioPlaying(false);
  };

  const startAmbientAudio = (soundId) => {
    stopAmbientAudio();

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    // Resume if suspended (browser security)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // keep it soft and background
    gainNode.connect(ctx.destination);
    audioNodesRef.current.gain = gainNode;

    if (soundId === 'noise' || soundId === 'rain') {
      // Create White Noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      if (soundId === 'rain') {
        // Rain filter: Lowpass filter to make white noise sound like rain rumbling
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(450, ctx.currentTime);
        
        whiteNoise.connect(lowpass);
        lowpass.connect(gainNode);
        audioNodesRef.current.filter = lowpass;
      } else {
        // Flat white noise
        whiteNoise.connect(gainNode);
      }

      whiteNoise.start();
      audioNodesRef.current.source = whiteNoise;
    } else if (soundId === 'forest') {
      // Deep Forest: Low atmospheric sine drone + minor wind effect
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(90, ctx.currentTime); // 90Hz base drone
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(135, ctx.currentTime); // Harmonious 5th
      
      // Gentle frequency modulation for "wind"
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      modulator.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2Hz modulation
      modGain.gain.setValueAtTime(1.5, ctx.currentTime);

      modulator.connect(modGain);
      modGain.connect(osc1.frequency);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);

      osc1.start();
      osc2.start();
      modulator.start();
      
      audioNodesRef.current.oscillators = [osc1, osc2, modulator];
    } else if (soundId === 'lofi') {
      // Lofi: Soft synthesizer chords (major 7th) playing in sequence
      const rootFreqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3 (Cmaj7 chord)
      const oscillators = [];

      rootFreqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Add a micro detune for lofi retro feel
        osc.detune.setValueAtTime(Math.random() * 15 - 7.5, ctx.currentTime);
        
        // Connect to a soft delay / filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        
        osc.connect(filter);
        filter.connect(gainNode);
        osc.start();
        oscillators.push(osc);
      });

      audioNodesRef.current.oscillators = oscillators;
    }

    setIsAudioPlaying(true);
    setActiveSound(soundId);
  };

  const handleSoundClick = (soundId) => {
    if (activeSound === soundId && isAudioPlaying) {
      stopAmbientAudio();
      setActiveSound(null);
    } else {
      startAmbientAudio(soundId);
      showToast(`Calming ${soundId} ambient audio activated 🎧`);
    }
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  // Clean up Web Audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  return (
    <div className="tab-content-container" style={{ alignItems: 'center' }}>
      
      {/* Mode Switches */}
      <div className="glass-panel" style={{ display: 'flex', width: '100%', padding: '4px', borderRadius: '14px', marginBottom: '32px' }}>
        {['focus', 'shortBreak', 'longBreak'].map((m) => {
          const isActiveMode = mode === m;
          const label = m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break';
          return (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                }
              }}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: isActiveMode ? 'rgba(255,255,255,0.08)' : 'none',
                color: isActiveMode ? '#fff' : 'var(--text-secondary)',
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: isActiveMode ? '700' : '500',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Circular Timer */}
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
        {/* Glow behind */}
        <div style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          boxShadow: isActive ? '0 0 40px 10px rgba(99, 102, 241, 0.15)' : 'none',
          transition: 'var(--transition-smooth)',
          zIndex: 1
        }}></div>

        <svg style={{ transform: 'rotate(-90deg)', width: '220px', height: '220px', position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
          {/* Base Circle */}
          <circle
            cx="110"
            cy="110"
            r="80"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="110"
            cy="110"
            r="80"
            stroke={mode === 'focus' ? 'var(--color-primary)' : 'var(--color-success)'}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="502" // 2 * pi * r (approx 502)
            strokeDashoffset={502 - (502 * progress)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>

        {/* Text Area */}
        <div style={{ zIndex: 3, textAlign: 'center' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', fontFamily: 'Outfit', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {formatTime(timeLeft)}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px', fontWeight: '600' }}>
            {mode === 'focus' ? 'Time to Focus' : 'Relaxing Break'}
          </p>
        </div>
      </div>

      {/* Timer Controls */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
        <button
          onClick={resetTimer}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          className="glass-panel-hover"
          title="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggleTimer}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            background: mode === 'focus' ? 'var(--color-primary)' : 'var(--color-success)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: mode === 'focus' ? '0 6px 20px var(--color-primary-glow)' : '0 6px 20px var(--color-success-glow)',
            transition: 'var(--transition-smooth)'
          }}
          className="animate-pulse-glow"
        >
          {isActive ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: '4px' }} />}
        </button>

        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0
          }}
        ></div>
      </div>

      {/* Ambient Sounds Panel */}
      <div className="glass-panel" style={{ width: '100%', padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={16} color="var(--color-secondary)" />
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Calming Ambient Sounds</h4>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { id: 'lofi', name: 'Lofi Beats', emoji: '🎧' },
            { id: 'rain', name: 'Soft Rain', emoji: '🌧️' },
            { id: 'forest', name: 'Deep Forest', emoji: '🌲' },
            { id: 'noise', name: 'White Noise', emoji: '💨' }
          ].map(sound => {
            const isPlaying = activeSound === sound.id && isAudioPlaying;
            return (
              <button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: isPlaying ? '1px solid var(--color-secondary)' : '1px solid var(--border-glass)',
                  background: isPlaying ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                  color: isPlaying ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <span>{sound.emoji}</span>
                <span>{sound.name}</span>
                {isPlaying && (
                  <span style={{ marginLeft: 'auto', display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-secondary)', boxShadow: '0 0 8px var(--color-secondary-glow)' }}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Session counter info */}
      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '20px', fontWeight: '500' }}>
        Completed sessions today: <span style={{ color: '#fff', fontWeight: '700' }}>{completedSessions}</span>
      </p>
    </div>
  );
}
