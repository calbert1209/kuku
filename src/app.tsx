import { useState, useEffect, useRef } from 'preact/hooks';
import { type Problem, generateKuku, shuffleProblems, getDanProblems, reverseProblems, generateAddition } from './logic/kuku';
import './index.css';

type GameState = 'SELECT_MODE' | 'PLAYING' | 'RESULT' | 'REVIEW';
type PlayMode = 'SHUFFLE' | 'SEQUENTIAL' | 'REVERSE';

interface ReviewProblem extends Problem {
  consecutiveCorrect: number;
}

const GAME_DURATION = 60;

export function App() {
  const [gameState, setGameState] = useState<GameState>('SELECT_MODE');
  const [playMode, setPlayMode] = useState<PlayMode>('SHUFFLE');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [mistakes, setMistakes] = useState<Problem[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewProblem[]>([]);
  const [flashClass, setFlashClass] = useState('');
  
  // B-Side Hidden Mode States
  const [isBSide, setIsBSide] = useState(false);
  const [holdProgress, setHoldProgress] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  const currentProblem = gameState === 'REVIEW' ? reviewQueue[currentIndex] : problems[currentIndex];

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playSound = (type: 'correct' | 'wrong' | 'click') => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  };

  // Sound play during holding (rising pitch hum)
  const playHoldSound = (progress: number) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const freq = 220 + (progress / 100) * 440; // Rises from 220Hz to 660Hz
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  // Sound play when toggle completes (Cyber/Friendly Chime)
  const playToggleSound = (toBSide: boolean) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    if (toBSide) {
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.setValueAtTime(554.37, now + 0.1);
      osc1.frequency.setValueAtTime(659.25, now + 0.2);
      osc1.frequency.setValueAtTime(880, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.5);
    } else {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.15);
      osc1.frequency.setValueAtTime(440, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.5);
    }
  };

  const toggleBSide = () => {
    setIsBSide(prev => {
      const next = !prev;
      playToggleSound(next);
      setGameState('SELECT_MODE');
      setProblems([]);
      setCurrentIndex(0);
      setCurrentInput('');
      setScore({ correct: 0, wrong: 0 });
      setMistakes([]);
      setReviewQueue([]);
      return next;
    });
  };

  const startHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
    let progress = 0;
    
    playHoldSound(0);
    
    holdIntervalRef.current = window.setInterval(() => {
      progress += 3.33; // 100ms * 30 ticks = 3000ms
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        setHoldProgress(null);
        toggleBSide();
      } else {
        setHoldProgress(Math.min(100, progress));
        playHoldSound(progress);
      }
    }, 100);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setHoldProgress(null);
      handleClear();
    }
  };

  const startGame = (dan?: number) => {
    let baseProblems = isBSide ? generateAddition() : (dan ? getDanProblems(dan) : generateKuku());
    if (isBSide || playMode === 'SHUFFLE') {
      baseProblems = shuffleProblems(baseProblems);
    } else if (playMode === 'REVERSE') {
      baseProblems = reverseProblems(baseProblems);
    }
    
    setProblems(baseProblems);
    setCurrentIndex(0);
    setCurrentInput('');
    setTimeLeft(GAME_DURATION);
    setScore({ correct: 0, wrong: 0 });
    setMistakes([]);
    setGameState('PLAYING');
  };

  const startReview = () => {
    const uniqueMistakes = Array.from(new Set(mistakes.map(p => p.id)))
      .map(id => mistakes.find(p => p.id === id)!)
      .map(p => ({ ...p, consecutiveCorrect: 0 }));
    
    setReviewQueue(uniqueMistakes);
    setCurrentIndex(0);
    setCurrentInput('');
    setGameState('REVIEW');
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('RESULT');
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const checkAnswer = (input: string) => {
    if (!currentProblem) return;

    const isCorrect = parseInt(input) === currentProblem.a;
    
    if (gameState === 'PLAYING') {
      if (isCorrect) {
        playSound('correct');
        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        setFlashClass('flash-correct');
      } else {
        playSound('wrong');
        setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        setMistakes(prev => [...prev, currentProblem]);
        setFlashClass('flash-wrong');
      }

      setTimeout(() => {
        setFlashClass('');
        setCurrentInput('');
        if (currentIndex < problems.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          endGame();
        }
      }, 200);
    } else if (gameState === 'REVIEW') {
      if (isCorrect) {
        playSound('correct');
        setFlashClass('flash-correct');
        const updatedQueue = [...reviewQueue];
        updatedQueue[currentIndex].consecutiveCorrect += 1;
        
        setTimeout(() => {
          setFlashClass('');
          setCurrentInput('');
          if (updatedQueue[currentIndex].consecutiveCorrect >= 2) {
            const newQueue = updatedQueue.filter((_, i) => i !== currentIndex);
            setReviewQueue(newQueue);
            if (newQueue.length === 0) {
              setGameState('RESULT');
            } else if (currentIndex >= newQueue.length) {
              setCurrentIndex(0);
            }
          } else {
            setCurrentIndex(prev => (prev + 1) % updatedQueue.length);
            setReviewQueue(updatedQueue);
          }
        }, 200);
      } else {
        playSound('wrong');
        setFlashClass('flash-wrong');
        const updatedQueue = [...reviewQueue];
        updatedQueue[currentIndex].consecutiveCorrect = 0;
        setReviewQueue(updatedQueue);
        
        setTimeout(() => {
          setFlashClass('');
          setCurrentInput('');
          setCurrentIndex(prev => (prev + 1) % updatedQueue.length);
        }, 200);
      }
    }
  };

  const handleInput = (num: string) => {
    if ((gameState !== 'PLAYING' && gameState !== 'REVIEW') || !currentProblem) return;
    
    playSound('click');
    const nextInput = currentInput + num;
    const targetLength = currentProblem.a.toString().length;

    if (nextInput.length <= targetLength) {
      setCurrentInput(nextInput);
      
      if (nextInput.length === targetLength) {
        checkAnswer(nextInput);
      }
    }
  };

  const handleClear = () => {
    setCurrentInput('');
  };

  // Keyboard long-press and event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        if (!e.repeat) {
          startHold();
        }
        e.preventDefault();
      } else if (gameState === 'PLAYING' || gameState === 'REVIEW') {
        if (e.key >= '0' && e.key <= '9') {
          handleInput(e.key);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        cancelHold();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, currentInput, currentProblem, isBSide]);

  // Screen wrapper helper that injects holdProgress and flashing class natively
  const wrapScreen = (content: any, extraClass = '') => (
    <div className={`screen ${extraClass} ${flashClass}`}>
      {holdProgress !== null && (
        <div className="hold-overlay">
          <div className="display-text" style={{ fontSize: '1.2rem' }}>
            {isBSide ? 'せいじょうモードへ' : 'たしざんモードへ'}
          </div>
          <div className="display-text" style={{ fontSize: '2.5rem', marginTop: '10px' }}>
            {Math.max(1, Math.ceil(3 - (holdProgress / 100) * 3))}
          </div>
          <div className="hold-bar-container">
            <div className="hold-bar" style={{ width: `${holdProgress}%` }}></div>
          </div>
        </div>
      )}
      {content}
    </div>
  );

  const renderSelectMode = () => {
    if (isBSide) {
      return wrapScreen(
        <>
          <div className="display-text" style={{ fontSize: '1.4rem', letterSpacing: '2px' }}>
            たしざん B-SIDE
          </div>
          <div className="display-text" style={{ fontSize: '0.9rem', color: 'var(--lcd-text)', opacity: 0.8 }}>
            (5 〜 10) バラバラ
          </div>
          <button 
            className="lcd-button" 
            onClick={() => startGame()} 
            style={{ width: '80%', padding: '15px', fontSize: '1.5rem' }}
          >
            スタート
          </button>
        </>
      );
    }

    return wrapScreen(
      <>
        <div className="mode-toggle">
          <button 
            className={`lcd-button lcd-button-small ${playMode === 'SEQUENTIAL' ? '' : 'display-text'}`}
            style={{ backgroundColor: playMode === 'SEQUENTIAL' ? 'var(--lcd-text)' : 'transparent', color: playMode === 'SEQUENTIAL' ? 'var(--lcd-bg)' : 'var(--lcd-text)' }}
            onClick={() => setPlayMode('SEQUENTIAL')}
          >
            じゅんばん
          </button>
          <button 
            className={`lcd-button lcd-button-small ${playMode === 'REVERSE' ? '' : 'display-text'}`}
            style={{ backgroundColor: playMode === 'REVERSE' ? 'var(--lcd-text)' : 'transparent', color: playMode === 'REVERSE' ? 'var(--lcd-bg)' : 'var(--lcd-text)' }}
            onClick={() => setPlayMode('REVERSE')}
          >
            ぎゃく
          </button>
          <button 
            className={`lcd-button lcd-button-small ${playMode === 'SHUFFLE' ? '' : 'display-text'}`}
            style={{ backgroundColor: playMode === 'SHUFFLE' ? 'var(--lcd-text)' : 'transparent', color: playMode === 'SHUFFLE' ? 'var(--lcd-bg)' : 'var(--lcd-text)' }}
            onClick={() => setPlayMode('SHUFFLE')}
          >
            バラバラ
          </button>
        </div>

        <div className="dan-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dan => (
            <button 
              key={dan} 
              className="lcd-button lcd-button-small" 
              onClick={() => startGame(dan)}
            >
              {dan}だん
            </button>
          ))}
        </div>

        <button className="lcd-button lcd-button-small" onClick={() => startGame()} style={{ width: '90%' }}>
          ぜんぶまぜる
        </button>
      </>
    );
  };

  const renderPlaying = () => wrapScreen(
    <>
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${(currentIndex / problems.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="timer-text display-text">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      
      <div className="math-problem display-text">
        {currentProblem?.q}
      </div>
      
      <div className="answer-preview display-text">
        {currentInput}
      </div>

      <div className="display-text" style={{ fontSize: '1rem' }}>
        せいかい: {score.correct}
      </div>
    </>
  );

  const renderResult = () => wrapScreen(
    <>
      <div className="display-text" style={{ fontSize: '2rem' }}>おわり！</div>
      <div className="display-text" style={{ fontSize: '1.2rem', textAlign: 'center' }}>
        せいかい: {score.correct}<br />
        まちがい: {mistakes.length}
      </div>
      <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="lcd-button" onClick={() => setGameState('SELECT_MODE')}>
          もういっかい
        </button>
        {mistakes.length > 0 && (
          <button 
            className="lcd-button" 
            onClick={startReview}
            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            ふくしゅう ({new Set(mistakes.map(p => p.id)).size})
          </button>
        )}
      </div>
    </>
  );

  const renderReview = () => wrapScreen(
    <>
      <div className="display-text" style={{ fontSize: '1.2rem', color: 'var(--lcd-text)' }}>
        にがてリトライ ({reviewQueue.length}のこり)
      </div>
      
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${(currentProblem as ReviewProblem).consecutiveCorrect * 50}%`,
          }}
        ></div>
      </div>

      <div className="math-problem display-text">
        {currentProblem?.q}
      </div>
      
      <div className="answer-preview display-text">
        {currentInput}
      </div>
      
      <button 
        className="display-text" 
        style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => setGameState('RESULT')}
      >
        [ ふくしゅうを おわる ]
      </button>
    </>
  );

  const isInputActive = gameState === 'PLAYING' || gameState === 'REVIEW';

  return (
    <div className={`device-container ${isBSide ? 'b-side' : ''}`}>
      {gameState === 'SELECT_MODE' && renderSelectMode()}
      {gameState === 'PLAYING' && renderPlaying()}
      {gameState === 'RESULT' && renderResult()}
      {gameState === 'REVIEW' && renderReview()}

      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            className="key" 
            onClick={() => handleInput(num.toString())}
            disabled={!isInputActive}
          >
            {num}
          </button>
        ))}
        <button 
          className="key key-clear" 
          onPointerDown={(e) => {
            e.preventDefault();
            startHold();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            cancelHold();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            cancelHold();
          }}
        >
          C
        </button>
        <button 
          className="key" 
          onClick={() => handleInput('0')}
          disabled={!isInputActive}
        >
          0
        </button>
        <button className="key" style={{ visibility: 'hidden' }}></button>
      </div>
    </div>
  );
}
