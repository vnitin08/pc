import { useState } from 'react';
import Modal from '../lib/Modal';
import Button from '@/components/shared/Button';

const Rules = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const toggleRules = () => setIsOpen(!isOpen);

  return (
    <>
      <Button label="Rules" onClick={toggleRules} className='rounded-full p-4 py-4'/>
      {isOpen && (
        <Modal onClose={toggleRules}>
          <h2 className="text-2xl font-bold text-left-accent mb-4">Game Rules</h2>
          <div className="text-left-accent space-y-4">
            <section>
              <h3 className="text-xl font-semibold mb-2">How to Play:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Connect Your Wallet:</strong> Start by connecting your Auro wallet to the game. This ensures secure transactions and identity verification.</li>
                <li><strong>Bridge MINA to ZNAKE:</strong> Convert your MINA tokens into ZNAKE tokens. This is the in-game currency you'll use to place bets.</li>
                <li><strong>Place Your Bet:</strong> Choose the amount of ZNAKE tokens you want to wager on each spin. Remember to gamble responsibly!</li>
                <li><strong>Spin the Wheel:</strong> Click the 'Spin' button to set the reels in motion. Watch as the symbols align!</li>
                <li><strong>Get Your Result:</strong> Once the reels stop, the game will automatically calculate and display your winnings (if any).</li>
              </ol>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-2">Winning and Losing:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Winning:</strong> You win when all three symbols on the payline match. The amount you win depends on the specific symbols and your bet amount.</li>
                <li><strong>Losing:</strong> If the symbols don't match, you lose your bet. But don't worry, you can always try again!</li>
                <li><strong>Jackpot:</strong> The highest payout comes from landing three Token symbols in a row. This is the combination every player dreams of!</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Tips for Success:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Start with smaller bets to get a feel for the game.</li>
                <li>Keep an eye on your ZNAKE token balance and set a budget for your gaming session.</li>
                <li>Remember that each spin is independent - previous spins don't influence future results.</li>
                <li>Most importantly, have fun and play responsibly!</li>
              </ul>
            </section>
          </div>
          <Button label="Got it!" onClick={toggleRules} className="mt-6" />
        </Modal>
      )}
    </>
  );
};

export default Rules;
