'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswerText?: string; // The actual correct answer text
  difficulty: string;
}

const QUIZ_URL = 'https://ritual-quiz.vercel.app';

const ROLES = [
  { min: 0, max: 4, title: 'Initiate', description: 'Beginning your journey into the Ritual ecosystem' },
  { min: 5, max: 6, title: 'Ritty Bitty', description: 'Getting the hang of Ritual concepts' },
  { min: 7, max: 7, title: 'Ritty', description: 'Solid understanding of Ritual' },
  { min: 8, max: 9, title: 'Ritualist', description: 'Deep knowledge of the Ritual ecosystem' },
  { min: 10, max: 10, title: 'Mage', description: 'Master of Ritual wisdom' },
];

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'quiz' | 'result'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const response = await fetch('/questions.json');
    const data = await response.json();
    const allQuestions: Question[] = data.questions;

    const easy = allQuestions.filter(q => q.difficulty === 'easy');
    const medium = allQuestions.filter(q => q.difficulty === 'medium');
    const hard = allQuestions.filter(q => q.difficulty === 'hard');

    const selectedQuestions = [
      ...shuffleArray(easy).slice(0, 5),
      ...shuffleArray(medium).slice(0, 3),
      ...shuffleArray(hard).slice(0, 2),
    ];

    // Store the correct answer text BEFORE shuffling options
    const questionsWithShuffledOptions = selectedQuestions.map(q => {
      const correctAnswerText = q.options[q.correctAnswer];
      return {
        ...q,
        correctAnswerText, // Store the actual correct answer
        options: shuffleArray([...q.options]),
      };
    });

    setQuestions(shuffleArray(questionsWithShuffledOptions));
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = () => {
    setGameState('quiz');
    setScore(0);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    // Compare the selected option text with the stored correct answer text
    const isCorrect = currentQuestion.options[selectedAnswer] === currentQuestion.correctAnswerText;

    setAnswers([...answers, isCorrect]);
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setGameState('result');
        setShowCardForm(true);
      }
    }, 1500);
  };

  const getRoleForScore = (finalScore: number) => {
    return ROLES.find(role => finalScore >= role.min && finalScore <= role.max) || ROLES[0];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCard = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    setShowCardForm(false);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      // Force a small delay to ensure all dynamic content (score, role, image) is fully rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#050510',
        scale: 2,
        useCORS: true, // Allow cross-origin images
        logging: false, // Disable console logs
        allowTaint: true, // Allow tainted canvas
      });

      const link = document.createElement('a');
      link.download = `ritual-card-${userName || 'user'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating card:', error);
      alert('Error generating card. Please try again.');
    }
  };

  const shareToX = () => {
    const role = getRoleForScore(score);
    const text = `I just completed the Ritual Quiz and earned the ${role.title} rank 🔮 Score: ${score}/10\n\nThink you can beat me? Take the Ritual Quiz 👇 ${QUIZ_URL}\n\n@ritualfnd`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const role = getRoleForScore(score);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-ritual-purple"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-ritual-purple/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ritual-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-ritual-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold text-gradient animate-glow">
                Ritual Quiz
              </h1>
              <p className="text-xl md:text-2xl text-gray-300">
                Test Your Knowledge of the World&apos;s First Sovereign Execution Layer for AI
              </p>
            </div>

            <div className="ritual-card p-8 rounded-2xl space-y-4 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-ritual-purple">Quiz Format</h2>
              <div className="text-left space-y-2 text-gray-300">
                <p>• 10 Questions Total</p>
                <p>• 5 Easy Questions</p>
                <p>• 3 Medium Questions</p>
                <p>• 2 Hard Questions</p>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="px-12 py-4 bg-ritual-gradient rounded-full text-xl font-bold hover:scale-105 transition-transform duration-300 card-glow"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Screen */}
      {gameState === 'quiz' && currentQuestion && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-3xl space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{currentQuestion.difficulty.toUpperCase()}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ritual-gradient transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="ritual-card p-8 rounded-2xl backdrop-blur-sm space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = showFeedback && option === currentQuestion.correctAnswerText;
                  const isWrong = showFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                        isCorrect
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : isWrong
                          ? 'bg-red-500/20 border-2 border-red-500'
                          : isSelected
                          ? 'bg-ritual-purple/30 border-2 border-ritual-purple'
                          : 'bg-gray-800/50 border-2 border-gray-700 hover:border-ritual-purple/50'
                      }`}
                    >
                      <span className="text-lg">{option}</span>
                    </button>
                  );
                })}
              </div>

              {!showFeedback && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                    selectedAnswer !== null
                      ? 'bg-ritual-gradient hover:scale-105 card-glow'
                      : 'bg-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  Submit Answer
                </button>
              )}

              {showFeedback && (
                <div className={`p-4 rounded-xl text-center font-bold ${
                  answers[answers.length - 1] ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {answers[answers.length - 1] ? '✓ Correct!' : '✗ Incorrect'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Screen */}
      {gameState === 'result' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-8">
            {showCardForm ? (
              <div className="ritual-card p-8 rounded-2xl backdrop-blur-sm space-y-6">
                <h2 className="text-3xl font-bold text-center text-gradient">
                  Generate Your Ritual Card
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:border-ritual-purple outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Picture (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ritual-purple file:text-white hover:file:bg-ritual-purple/80"
                    />
                  </div>

                  <button
                    onClick={generateCard}
                    className="w-full py-3 bg-ritual-gradient rounded-xl font-bold hover:scale-105 transition-transform duration-300 card-glow"
                  >
                    Generate Card
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Ritual Card */}
                <div ref={cardRef} className="bg-gradient-to-br from-ritual-dark to-ritual-darker p-8 rounded-2xl border-2 border-ritual-purple/50 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-ritual-purple/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-ritual-blue/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10 space-y-6">
                    <div className="text-center">
                      <h1 className="text-5xl font-bold text-gradient mb-2" style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>Ritual Card</h1>
                      <div className="h-1 w-32 bg-ritual-gradient mx-auto rounded-full"></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Profile Section */}
                      <div className="flex-shrink-0">
                        {userImage ? (
                          <img
                            src={userImage}
                            alt={userName}
                            className="w-32 h-32 rounded-full border-4 border-ritual-purple object-cover"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full border-4 border-ritual-purple bg-ritual-gradient flex items-center justify-center text-4xl font-bold">
                            {userName.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                          <h2 className="text-3xl font-bold">{userName || 'Anonymous'}</h2>
                          <p className="text-ritual-purple text-xl font-semibold mt-1">{role.title}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="text-gray-400">Score:</span>
                            <span className="text-4xl font-bold text-gradient" style={{ 
                              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}>{score}/10</span>
                          </div>
                          <p className="text-sm text-gray-400 italic">{role.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-ritual-purple/30 pt-4">
                      <p className="text-center text-sm text-gray-500">
                        ritualfoundation.com • @ritualfnd
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={downloadCard}
                    className="py-4 bg-ritual-purple rounded-xl font-bold hover:scale-105 transition-transform duration-300"
                  >
                    📥 Download Card
                  </button>

                  <button
                    onClick={shareToX}
                    className="py-4 bg-blue-500 rounded-xl font-bold hover:scale-105 transition-transform duration-300"
                  >
                    🐦 Share to X
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="py-4 bg-ritual-gradient rounded-xl font-bold hover:scale-105 transition-transform duration-300"
                  >
                    🔄 Retake Quiz
                  </button>
                </div>

                {/* Score Breakdown */}
                <div className="ritual-card p-6 rounded-2xl backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 text-center">Score Breakdown</h3>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {answers.map((isCorrect, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold ${
                          isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
