'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswerText?: string;
  difficulty: string;
}

const QUIZ_URL = 'https://ritual-quiz.vercel.app';

const ROLES = [
  { min: 0, max: 4, title: 'Initiate', description: 'Beginning your journey into the Ritual ecosystem', color: '#FF5757' },
  { min: 5, max: 6, title: 'Ritty Bitty', description: 'Getting the hang of Ritual concepts', color: '#E88239' },
  { min: 7, max: 7, title: 'Ritty', description: 'Solid understanding of Ritual', color: '#F6BE4F' },
  { min: 8, max: 9, title: 'Ritualist', description: 'Deep knowledge of the Ritual ecosystem', color: '#00C2FF' },
  { min: 10, max: 10, title: 'Mage', description: 'Master of Ritual wisdom', color: '#40FFAF' },
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
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
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

    const shuffle = (arr: Question[]) => arr.sort(() => Math.random() - 0.5);
    
    const selectedQuestions = [
      ...shuffle(easy).slice(0, 4),
      ...shuffle(medium).slice(0, 4),
      ...shuffle(hard).slice(0, 2)
    ];

    setQuestions(shuffle(selectedQuestions));
  };

  const handleStartQuiz = () => {
    setGameState('quiz');
  };

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    setAnswers([...answers, isCorrect]);
    if (isCorrect) setScore(score + 1);
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
    }, 2000);
  };

  const getRoleInfo = () => {
    return ROLES.find(role => score >= role.min && score <= role.max) || ROLES[0];
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

  const generateCard = async () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsGeneratingCard(true);
    setShowCardForm(false);

    setTimeout(async () => {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: '#000000',
          logging: false,
        });

        const link = document.createElement('a');
        link.download = `ritual-quiz-${userName.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        setIsGeneratingCard(false);
      }
    }, 100);
  };

  const shareToTwitter = () => {
    const roleInfo = getRoleInfo();
    const text = `I just completed the Ritual Quiz and got ${score}/10! My role: ${roleInfo.title} 🎮✨\n\nTry it yourself: ${QUIZ_URL}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const restartQuiz = () => {
    setGameState('start');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setShowFeedback(false);
    setUserName('');
    setUserImage(null);
    setShowCardForm(false);
    loadQuestions();
  };

  const roleInfo = getRoleInfo();

  // START SCREEN
  if (gameState === 'start') {
    return (
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-black">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, #8840FF 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400 rounded-full filter blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, #40FFAF 0%, transparent 70%)', animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, #E554E8 0%, transparent 70%)', animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-green-400 bg-clip-text text-transparent animate-gradient">
                  RITUAL
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white/90">
                Knowledge Quiz
              </div>
            </div>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Test your knowledge of the Ritual ecosystem and discover your role in the community
            </p>

            {/* Quick Navigation */}
            <div className="flex justify-center gap-4 mb-12">
              <Link href="/game">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/50">
                  🎮 Play Merge Game
                </button>
              </Link>
            </div>
          </div>

          {/* Quiz Start Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
              {/* Quiz Info */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/50 rounded-xl p-4 border border-green-400/30 text-center">
                  <div className="text-green-400 text-3xl font-black">10</div>
                  <div className="text-white/60 text-sm mt-1">Questions</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 border border-blue-400/30 text-center">
                  <div className="text-blue-400 text-3xl font-black">3</div>
                  <div className="text-white/60 text-sm mt-1">Difficulty Levels</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 border border-pink-400/30 text-center">
                  <div className="text-pink-400 text-3xl font-black">5</div>
                  <div className="text-white/60 text-sm mt-1">Roles</div>
                </div>
              </div>

              {/* Roles Preview */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Unlock Your Role</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {ROLES.map((role, index) => (
                    <div key={index} className="bg-black/40 rounded-lg p-3 border border-white/10 text-center group hover:border-purple-500/50 transition-all">
                      <div className="text-2xl mb-1">
                        {index === 0 && '🌱'}
                        {index === 1 && '⭐'}
                        {index === 2 && '🔮'}
                        {index === 3 && '👑'}
                        {index === 4 && '🧙'}
                      </div>
                      <div className="text-xs font-bold" style={{ color: role.color }}>
                        {role.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                disabled={questions.length === 0}
                className="w-full py-5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl font-black text-xl text-black hover:scale-105 transition-transform shadow-xl shadow-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {questions.length === 0 ? 'Loading Questions...' : 'START QUIZ ⚡'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-white mb-2">Curated Questions</h3>
              <p className="text-white/60 text-sm">200+ questions covering all aspects of Ritual</p>
            </div>
            <div className="bg-black/40 border border-green-400/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-bold text-white mb-2">Custom Card</h3>
              <p className="text-white/60 text-sm">Generate and share your personalized result card</p>
            </div>
            <div className="bg-black/40 border border-pink-400/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-white mb-2">Earn Your Role</h3>
              <p className="text-white/60 text-sm">Progress from Initiate to Mage based on your score</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </main>
    );
  }

  // QUIZ SCREEN
  if (gameState === 'quiz' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <main className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-green-400"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <button className="px-4 py-2 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 transition-colors border border-white/10">
                ← Back
              </button>
            </Link>
            <div className="text-center">
              <div className="text-sm text-white/50">Question {currentQuestionIndex + 1} of {questions.length}</div>
              <div className="text-2xl font-black text-white">{score} / {currentQuestionIndex}</div>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              {/* Difficulty Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1 rounded-full text-xs font-bold ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                  'bg-red-400/20 text-red-400 border border-red-400/30'
                }`}>
                  {currentQuestion.difficulty.toUpperCase()}
                </div>
              </div>

              {/* Question */}
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showResult = showFeedback;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full p-5 rounded-xl text-left font-semibold transition-all border-2 ${
                        showResult
                          ? isCorrect
                            ? 'bg-green-500/20 border-green-400 text-white'
                            : isSelected
                            ? 'bg-red-500/20 border-red-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/50'
                          : isSelected
                          ? 'bg-purple-500/20 border-purple-400 text-white scale-105'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                          showResult && isCorrect ? 'bg-green-400 text-black' :
                          showResult && isSelected && !isCorrect ? 'bg-red-400 text-black' :
                          isSelected ? 'bg-purple-400 text-black' :
                          'bg-white/10 text-white/50'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!showFeedback && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl font-black text-lg text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-400/20"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'FINISH QUIZ' : 'SUBMIT ANSWER'}
                </button>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className={`p-4 rounded-xl text-center font-bold ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-green-400/20 text-green-400 border-2 border-green-400/30'
                    : 'bg-red-400/20 text-red-400 border-2 border-red-400/30'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect!'}
                  {selectedAnswer !== currentQuestion.correctAnswer && (
                    <div className="mt-2 text-sm text-white/70">
                      Correct answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // RESULTS SCREEN - continuing in next message due to length...
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Results implementation */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black mb-8">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-green-400 bg-clip-text text-transparent">
              Quiz Complete!
            </span>
          </h1>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 rounded-3xl p-12">
            <div className="text-6xl mb-4">{roleInfo.title === 'Mage' ? '🧙' : roleInfo.title === 'Ritualist' ? '👑' : '⭐'}</div>
            <h2 className="text-4xl font-black mb-4" style={{ color: roleInfo.color }}>{roleInfo.title}</h2>
            <p className="text-xl text-white/70 mb-8">{roleInfo.description}</p>
            <div className="text-5xl font-black text-white mb-8">{score} / 10</div>
            
            {showCardForm && (
              <div className="max-w-md mx-auto mb-8 space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white"
                />
                <button
                  onClick={generateCard}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white"
                >
                  Generate Card
                </button>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={shareToTwitter} className="px-6 py-3 bg-blue-500 rounded-xl font-bold text-white">
                Share on 𝕏
              </button>
              <button onClick={restartQuiz} className="px-6 py-3 bg-green-400 rounded-xl font-bold text-black">
                Restart Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Card for Generation */}
      <div className="fixed -left-[9999px]">
        <div ref={cardRef} className="w-[600px] h-[600px] bg-gradient-to-br from-purple-600 to-pink-600 p-12">
          {/* Card content */}
        </div>
      </div>
    </main>
  );
}
