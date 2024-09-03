import { useState } from 'react';
import Modal from '../lib/Modal';
import Button from '@/components/shared/Button';

const Rules = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const toggleRules = () => setIsOpen(!isOpen);

  return (
    <>
      <Button label="Rules" onClick={toggleRules} className='rounded-full'/>
      {isOpen && (
        <Modal onClose={toggleRules}>
          <h2 className="text-left-accent">Rules</h2>
          <ul className="text-left-accent">
            <li><strong>Objective:</strong> Spin the reels and match symbols to win prizes. The best combination is three Token symbols.</li>
          </ul>
          <Button label="Close" onClick={toggleRules} />
        </Modal>
      )}
    </>
  );
};

export default Rules;
