import React, { useState } from 'react';
import ChooseYourPath from './ChooseYourPath';
import TrackSelection from './TrackSelection';
import BeginnerFlow from './BeginnerFlow';
import ExperiencedFlow from './ExperiencedFlow';
import ResultScreen from './ResultScreen';

export default function OnboardingQuiz({ onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState('choose-path');
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [trackId, setTrackId] = useState(null);
  const [quizData, setQuizData] = useState({});

  const handleChoosePath = (level) => {
    setExperienceLevel(level);
    setCurrentStep('track-selection');
  };

  const handleTrackSelection = (track) => {
    setTrackId(track);
    
    if (experienceLevel === 'beginner') {
      setCurrentStep('beginner-flow');
    } else {
      setCurrentStep('experienced-flow');
    }
  };

  const handleBeginnerComplete = (data) => {
    const result = {
      ...data,
      completedAt: new Date().toISOString()
    };
    setQuizData(result);
    setCurrentStep('result');
  };

  const handleExperiencedComplete = (data) => {
    const result = {
      ...data,
      completedAt: new Date().toISOString()
    };
    setQuizData(result);
    setCurrentStep('result');
  };

  const handleResultComplete = (finalResult) => {
    // Save the complete onboarding data
    const completeData = {
      ...finalResult,
      onboardingCompleted: true,
      onboardingVersion: '1.0'
    };
    onComplete(completeData);
  };

  const handleTryDifferentTrack = () => {
    setCurrentStep('track-selection');
    setTrackId(null);
    // Keep experience level but reset track selection
  };

  const handleBack = () => {
    if (currentStep === 'track-selection') {
      setCurrentStep('choose-path');
      setExperienceLevel(null);
    } else if (currentStep === 'beginner-flow' || currentStep === 'experienced-flow') {
      setCurrentStep('track-selection');
      setTrackId(null);
    } else if (currentStep === 'result') {
      // From result screen, exit onboarding completely
      onBack();
    } else {
      onBack();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'choose-path':
        return (
          <ChooseYourPath
            onNext={handleChoosePath}
            onBack={onBack}
          />
        );
      
      case 'track-selection':
        return (
          <TrackSelection
            onNext={handleTrackSelection}
            onBack={handleBack}
            experienceLevel={experienceLevel}
          />
        );
      
      case 'beginner-flow':
        return (
          <BeginnerFlow
            onNext={handleBeginnerComplete}
            onBack={handleBack}
            trackId={trackId}
          />
        );
      
      case 'experienced-flow':
        return (
          <ExperiencedFlow
            onNext={handleExperiencedComplete}
            onBack={handleBack}
            trackId={trackId}
          />
        );
      
      case 'result':
        return (
          <ResultScreen
            onComplete={handleResultComplete}
            onBack={handleBack}
            onTryDifferentTrack={handleTryDifferentTrack}
            result={quizData}
          />
        );
      
      default:
        return null;
    }
  };

  return renderCurrentStep();
}
