import { useState } from 'react';
import Modal from '../lib/Modal';
import Button from '@/components/shared/Button';

const HowToPlay = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const toggleHowToPlay = () => setIsOpen(!isOpen);

  return (
    <>
      <Button className='px-6 rounded-full' label="How to Play" onClick={toggleHowToPlay} />
      {isOpen && (
        <Modal onClose={toggleHowToPlay}>
          <h2 className="text-left-accent">How to Play</h2>
          <p className="text-left-accent">
            To play the game, click the "Spin" button to start spinning the reels. The goal is to match symbols on the payline. The payout depends on the symbols that align. Adjust your bet amount before spinning to increase your chances.
          </p>
          <Button label="Close" onClick={toggleHowToPlay} />
        </Modal>
      )}
    </>
  );
};

export default HowToPlay;
