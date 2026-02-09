import React, { useState, useEffect } from 'react';

const PetCelebration = ({ winner, onComplete }) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Function to generate sound using Web Audio API
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'bark') {
        playBark(audioContext);
      } else if (type === 'meow') {
        playMeow(audioContext);
      } else if (type === 'chirp') {
        playChirp(audioContext);
      } else if (type === 'squeak') {
        playSqueak(audioContext);
      } else if (type === 'hiss') {
        playHiss(audioContext);
      } else if (type === 'cheer') {
        playCheer(audioContext);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playBark = (audioContext) => {
    const now = audioContext.currentTime;
    const notes = [200, 250, 200, 280]; // Frequency in Hz
    const duration = 0.15;
    const gap = 0.1;

    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.3, now + (index * (duration + gap)));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (index * (duration + gap)) + duration);
      
      osc.start(now + (index * (duration + gap)));
      osc.stop(now + (index * (duration + gap)) + duration);
    });
  };

  const playMeow = (audioContext) => {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    
    // Rising then falling frequency (meow sound)
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.6);
    
    // Envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  };

  const playCheer = (audioContext) => {
    const now = audioContext.currentTime;
    const frequencies = [262, 330, 392]; // C major chord
    const duration = 1;

    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq * (1 + index * 0.3);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.start(now);
      osc.stop(now + duration);
    });
  };

  const playChirp = (audioContext) => {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  };

  const playSqueak = (audioContext) => {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  };

  const playHiss = (audioContext) => {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, now);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  };

  // Generate confetti pieces
  const generateConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.2,
        duration: 2 + Math.random() * 1
      });
    }
    return pieces;
  };

  // Watch for changes in winner (month-end celebration)
  useEffect(() => {
    if (winner && winner.member) {
      const species = winner.species?.toLowerCase() || 'dog';
      
      setShowCelebration(true);
      setConfettiPieces(generateConfetti());
      
      // Play species-specific sound
      const soundMap = {
        dog: 'bark',
        cat: 'meow',
        parrot: 'chirp',
        hamster: 'squeak',
        rabbit: 'squeak',
        snake: 'hiss',
        lizard: 'hiss',
        goldfish: 'chirp'
      };
      
      const sound = soundMap[species] || 'cheer';
      playSound(sound);
      
      // Also play generic cheer after a brief delay
      setTimeout(() => playSound('cheer'), 500);
      
      // Hide celebration after animation completes
      setTimeout(() => {
        setShowCelebration(false);
        setConfettiPieces([]);
        if (onComplete) {
          onComplete();
        }
      }, 5000);
    }
  }, [winner, onComplete]);

  if (!showCelebration || !winner) {
    return null;
  }

  const species = winner.species?.toLowerCase() || 'dog';
  const emojiMap = {
    dog: '🐕',
    cat: '🐱',
    parrot: '🦜',
    hamster: '🐹',
    rabbit: '🐰',
    snake: '🐍',
    lizard: '🦎',
    goldfish: '🐠'
  };
  const emoji = emojiMap[species] || '🎉';
  const memberName = winner.member?.name || 'Mystery Winner';
  const message = `${emoji} ${memberName.toUpperCase()} WINS! ${emoji}`;

  return (
    <div className="pet-celebration-overlay">
      {/* Celebration text */}
      <div className="celebration-text">{message}</div>

      {/* Running pet character */}
      <div className={`pet-celebration-character ${species}`}>
        {emoji}
      </div>

      {/* Confetti pieces */}
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="pet-celebration-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            animation: `confetti-fall ${piece.duration}s ease-in forwards`,
            animationDelay: `${piece.delay}s`,
            backgroundColor: ['#FFD700', '#FF1493', '#00CED1', '#32CD32', '#FFB6C1'][
              Math.floor(Math.random() * 5)
            ]
          }}
        />
      ))}
    </div>
  );
};

export default PetCelebration;
