import { useState, useEffect, useRef } from 'preact/hooks';
import { type Problem, generateKuku, shuffleProblems, getDanProblems } from './logic/kuku';
import './index.css';

type GameState = 'IDLE' | 'SELECT_MODE' | 'PLAYING' | 'RESULT' | 'REVIEW';
type PlayMode = 'SHUFFLE' | 'SEQUENTIAL';

interface ReviewProblem extends Problem {
  consecutiveCorrect: number;
}

const GAME_DURATION = 60;

export function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [playMode, setPlayMode] = useState<PlayMode>('SHUFFLE');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [mistakes, setMistakes] = useState<Problem[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewProblem[]>([]);
  const [flashClass, setFlashClass] = useState('');
  
  const timerRef = useRef<number | null>(null);

  const currentProblem = gameState === 'REVIEW' ? reviewQueue[currentIndex] : problems[currentIndex];

  const startGame = (dan?: number) => {
    let baseProblems = dan ? getDanProblems(dan) : generateKuku();
    if (playMode === 'SHUFFLE') {
      baseProblems = shuffleProblems(baseProblems);
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

  const playSound = (type: 'correct' | 'wrong' | 'click') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING' || gameState === 'REVIEW') {
        if (e.key >= '0' && e.key <= '9') {
          handleInput(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Escape') {
          handleClear();
        }
      } else if (gameState === 'IDLE') {
        if (e.key === 'Enter' || e.key === ' ') {
          setGameState('SELECT_MODE');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentInput, currentProblem]);

  const renderIdle = () => (
    <div className="screen">
      <div className="display-text" style={{ fontSize: '2rem', textAlign: 'center' }}>
        KUKU TIME ATTACK
      </div>
      <button className="lcd-button" onClick={() => setGameState('SELECT_MODE')} style={{ width: '80%' }}>
        START
      </button>
    </div>
  );

  const renderSelectMode = () => (
    <div className="screen">
      <div className="display-text" style={{ fontSize: '1.2rem' }}>SELECT MODE</div>
      
      <div className="mode-toggle">
        <button 
          className={`lcd-button lcd-button-small ${playMode === 'SHUFFLE' ? '' : 'display-text'}`}
          style={{ backgroundColor: playMode === 'SHUFFLE' ? 'var(--lcd-text)' : 'transparent', color: playMode === 'SHUFFLE' ? 'var(--lcd-bg)' : 'var(--lcd-text)' }}
          onClick={() => setPlayMode('SHUFFLE')}
        >
          SHUFFLE
        </button>
        <button 
          className={`lcd-button lcd-button-small ${playMode === 'SEQUENTIAL' ? '' : 'display-text'}`}
          style={{ backgroundColor: playMode === 'SEQUENTIAL' ? 'var(--lcd-text)' : 'transparent', color: playMode === 'SEQUENTIAL' ? 'var(--lcd-bg)' : 'var(--lcd-text)' }}
          onClick={() => setPlayMode('SEQUENTIAL')}
        >
          IN ORDER
        </button>
      </div>

      <button className="lcd-button" onClick={() => startGame()} style={{ width: '90%' }}>
        MIXED (1-9)
      </button>

      <div className="dan-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dan => (
          <button 
            key={dan} 
            className="lcd-button lcd-button-small" 
            onClick={() => startGame(dan)}
          >
            {dan}
          </button>
        ))}
      </div>
      
      <button 
        className="display-text" 
        style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => setGameState('IDLE')}
      >
        [ BACK ]
      </button>
    </div>
  );

  const renderPlaying = () => (
    <div className={`screen ${flashClass}`}>
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
        Score: {score.correct}
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="screen">
      <div className="display-text" style={{ fontSize: '2rem' }}>FINISH!</div>
      <div className="display-text" style={{ fontSize: '1.5rem', textAlign: 'center' }}>
        Correct: {score.correct}<br />
        Mistakes: {mistakes.length}
      </div>
      <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="lcd-button" onClick={() => setGameState('SELECT_MODE')}>
          NEW GAME
        </button>
        {mistakes.length > 0 && (
          <button 
            className="lcd-button" 
            onClick={startReview}
            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            REVIEW ({new Set(mistakes.map(p => p.id)).size})
          </button>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className={`screen ${flashClass}`}>
      <div className="display-text" style={{ fontSize: '1.2rem', color: 'var(--lcd-text)' }}>
        NIGATE RETRY ({reviewQueue.length} left)
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
        [ QUIT REVIEW ]
      </button>
    </div>
  );

  const isInputActive = gameState === 'PLAYING' || gameState === 'REVIEW';

  return (
    <div className="device-container">
      {gameState === 'IDLE' && renderIdle()}
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
          onClick={handleClear}
          disabled={!isInputActive}
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
