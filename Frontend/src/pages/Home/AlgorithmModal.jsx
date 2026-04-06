import React from 'react';
import ArraysModal from './modals/ArraysModal';
import TreesModal from './modals/TreesModal';
import DPModal from './modals/DPModal';
import SearchModal from './modals/SearchModal';
import GreedyModal from './modals/GreedyModal';
import BacktrackingModal from './modals/BacktrackingModal';

/**
 * AlgorithmModal — Thin router that selects the correct category modal.
 * Each category has its own unique visual personality.
 */
const modalMap = {
  arrays: ArraysModal,
  trees: TreesModal,
  dynamic: DPModal,
  searching: SearchModal,
  greedy: GreedyModal,
  backtracking: BacktrackingModal,
};

const AlgorithmModal = ({ isOpen, onClose, modalTopic }) => {
  if (!isOpen || !modalTopic) return null;

  const SelectedModal = modalMap[modalTopic.id] || ArraysModal;

  return (
    <SelectedModal
      isOpen={isOpen}
      onClose={onClose}
      modalTopic={modalTopic}
    />
  );
};

export default AlgorithmModal;
