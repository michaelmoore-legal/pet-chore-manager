import React, { useState, useEffect } from 'react';

const PetCelebration = ({ employeeOfMonth, period }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [previousWinner, setPreviousWinner] = useState(null);

  // Function to generate sound using Web Audio API
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'bark') {
        // Dog bark - series of short tones with varying pitch
        playBark(audioContext);
      } else if (type === 'meow') {
        // Cat meow - smooth rising then falling tone
        playMeow(audioContext);
      } else if (type === 'cheer') {
        // Victory cheer - rising chord
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

  // Watch for changes in employeeOfMonth
  useEffect(() => {
    if (employeeOfMonth && employeeOfMonth.member) {
      // Check if winner changed
      if (!previousWinner || previousWinner.id !== employeeOfMonth.member.id) {
        setPreviousWinner(employeeOfMonth.member);
        const species = employeeOfMonth.member.species?.toLowerCase() || 'dog';
        
        // Trigger celebration if it's a dog or cat
        if (species === 'dog' || species === 'cat') {
          setShowCelebration(true);
          setConfettiPieces(generateConfetti());
          
          // Play sound
          playSound(species);
          
          // Also play generic cheer
          setTimeout(() => playSound('cheer'), 500);
          
          // Hide celebration after animation completes
          setTimeout(() => {
            setShowCelebration(false);
            setConfettiPieces([]);
          }, 5000);
        }
      }
    }
  }, [employeeOfMonth, period, previousWinner]);

  if (!showCelebration || !employeeOfMonth) {
    return null;
  }

  const species = employeeOfMonth.member.species?.toLowerCase() || 'dog';
  const emoji = species === 'dog' ? '🐕' : species === 'cat' ? '🐱' : '🎉';
  const message = species === 'dog' 
    ? `🐕 ${employeeOfMonth.member.name.toUpperCase()} WINS! 🐕` 
    : species === 'cat'
    ? `🐱 ${employeeOfMonth.member.name.toUpperCase()} REIGNS SUPREME! 🐱`
    : `🎉 ${employeeOfMonth.member.name.toUpperCase()} WINS! 🎉`;

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
