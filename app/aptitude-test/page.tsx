// app/aptitude/page.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import questions from '@/lib/aptitudeqns.json';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { cn } from '@/lib/utils';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { supabase } from '@/lib/supabaseClient';

interface Question {
  id: number;
  difficulty: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: keyof Question['options'];
  explanation: string;
  hint?: string; // Added optional hint property
}

const AptitudeQuiz = () => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [id: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [hintsVisibility, setHintsVisibility] = useState<{ [id: number]: boolean }>({}); // State for hints


  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!isAutoSubmit && Object.keys(userAnswers).length < quizQuestions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitted(true);

    // Insert score into supabase if user is logged in
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (userId && /^[0-9a-fA-F-]{36}$/.test(userId)) {
      const score = quizQuestions.reduce((acc, q) => acc + (userAnswers[q.id] === q.correct_answer ? 1 : 0), 0);
      const { error } = await supabase.from('aptitude_scores').insert([
        {
          user_id: userId,
          score,
          total: quizQuestions.length,
          taken_at: new Date().toISOString()
        }
      ]);
      if (error) {
        console.error('Supabase insert error:', error.message);
      }
    } else if (userId) {
      console.warn('Invalid userId format, not inserting score:', userId);
    }
  }, [userAnswers, quizQuestions]);


  const startNewQuiz = useCallback(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const fixedQuestions = shuffled.slice(0, 10).map(q => ({
      ...q,
      correct_answer: q.correct_answer as keyof Question['options'],
    }));
    setQuizQuestions(fixedQuestions);
    setUserAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
    setTimeLeft(300); // Reset timer
    setHintsVisibility({}); // Reset hints
  }, []);

  // Effect for starting the quiz initially
  useEffect(() => {
    startNewQuiz();
  }, [startNewQuiz]);

  // Effect for the countdown timer
  useEffect(() => {
    if (submitted || timeLeft <= 0) {
      if (timeLeft <= 0 && !submitted) {
        handleSubmit(true);
      }
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, submitted, handleSubmit]);


  const handleOptionClick = (questionId: number, option: string) => {
    if (!submitted) {
      setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    }
  };

  const handleShowHint = (questionId: number) => {
    setHintsVisibility(prev => ({ ...prev, [questionId]: true }));
  };

  const getScore = () => {
    return quizQuestions.reduce((score, q) => {
      return score + (userAnswers[q.id] === q.correct_answer ? 1 : 0);
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const difficultyColors: { [key: string]: string } = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  if (quizQuestions.length === 0) {
    return <div>Loading Quiz...</div>;
  }

  function printResult(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    window.print();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {!submitted ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-xl md:text-2xl">🧠 Aptitude Quiz</CardTitle>
                    <div
                      className={cn(
                        'text-lg font-bold px-4 py-1 rounded-full',
                        timeLeft <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-700 dark:text-gray-200'
                      )}
                    >
                      ⏳ {formatTime(timeLeft)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
                  </div>
                </CardHeader>
                <CardContent>
                  {quizQuestions.map((q, index) => (
                    <div key={q.id} className={index === currentQuestionIndex ? 'block' : 'hidden'}>
                      <div className="flex justify-between items-start mb-4">
                        <p className="font-semibold text-lg pr-4">{q.question}</p>
                        <span className={cn(
                          'text-xs font-semibold capitalize px-2 py-1 rounded-md whitespace-nowrap',
                          difficultyColors[q.difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800'
                        )}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(q.options).map(([key, value]) => {
                          const isSelected = userAnswers[q.id] === key;
                          return (
                            <button
                              key={key}
                              className={cn(
                                'p-4 text-left rounded-lg border-2 transition-all duration-200 disabled:opacity-50',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                isSelected ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700'
                              )}
                              onClick={() => handleOptionClick(q.id, key)}
                            >
                              <span className="font-bold mr-2">{key}.</span> {value}
                            </button>
                          );
                        })}
                      </div>

                      {/* Hint Section */}
                      <div className="mt-5 text-center">
                        {q.hint && !hintsVisibility[q.id] && (
                          <button
                            onClick={() => handleShowHint(q.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            💡 Show Hint
                          </button>
                        )}
                        {q.hint && hintsVisibility[q.id] && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-300 text-left">
                            <strong>Hint:</strong> {q.hint}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button onClick={() => handleSubmit(false)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Submit
                  </button>
                )}
              </div>
            </>
          ) : (
             <Card className="text-center p-6">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">🏁 Quiz Complete!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold my-4">{getScore()} / {quizQuestions.length}</p>
                    <p className="text-lg text-muted-foreground mb-6">
                        {getScore() > 7 ? "Excellent work! 🎉" : getScore() > 4 ? "Good job, keep practicing! 👍" : "Don't worry, try again! 💪"}
                    </p>
                    <button onClick={startNewQuiz} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Try Again
                    </button>
                    <button onClick={printResult} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 ml-3 px-6 rounded-lg transition-colors">
                        Print Results
                    </button>
                </CardContent>

                <div className="mt-8 text-left">
                    <h3 className="text-xl font-bold mb-4">Review Your Answers</h3>
                    {quizQuestions.map((q, index) => {
                        const userAnswer = userAnswers[q.id];
                        const isCorrect = userAnswer === q.correct_answer;
                        return (
                            <div key={q.id} className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-900">
                                <p className="font-medium">Q{index + 1}. {q.question}</p>
                                <p className={`mt-2 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    Your answer: {userAnswer ? `${userAnswer}. ${q.options[userAnswer as keyof Question['options']]}` : 'Not Answered'} {isCorrect ? '✅' : '❌'}
                                </p>
                                {!isCorrect && (
                                     <p className="mt-1 font-semibold text-green-600">
                                        Correct answer: {q.correct_answer}. {q.options[q.correct_answer]}
                                     </p>
                                )}
                                <div className="mt-2 text-sm text-muted-foreground p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <strong>Explanation:</strong> {q.explanation}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AptitudeQuiz;
