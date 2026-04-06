import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlgorithmRoute } from '../../../core/constants/algorithms';

/**
 * useModalLogic — Shared hook for all category modals.
 * Handles selection state, navigation, and coming-soon logic.
 */
const useModalLogic = (isOpen, modalTopic) => {
  const navigate = useNavigate();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Reset on open/topic change
  useEffect(() => {
    setSelectedAlgorithm(null);
    setShowComingSoon(false);
  }, [isOpen, modalTopic]);

  const handleCardClick = (algorithm, onClose) => {
    const route = getAlgorithmRoute(algorithm.id);
    if (!route) {
      setSelectedAlgorithm(algorithm);
      setShowComingSoon(true);
    } else if (selectedAlgorithm?.id === algorithm.id || selectedAlgorithm?.name === algorithm.name) {
      onClose();
      navigate(route);
    } else {
      setSelectedAlgorithm(algorithm);
    }
  };

  const handleStartLearning = (onClose) => {
    if (!selectedAlgorithm) return;
    const route = getAlgorithmRoute(selectedAlgorithm.id);
    if (!route) {
      setShowComingSoon(true);
    } else {
      onClose();
      navigate(route);
    }
  };

  const isSelected = (algorithm) => {
    return selectedAlgorithm?.id === algorithm.id || selectedAlgorithm?.name === algorithm.name;
  };

  return {
    selectedAlgorithm,
    setSelectedAlgorithm,
    showComingSoon,
    setShowComingSoon,
    handleCardClick,
    handleStartLearning,
    isSelected,
  };
};

export default useModalLogic;
