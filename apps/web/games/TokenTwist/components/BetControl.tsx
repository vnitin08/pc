import React from 'react';

interface BetControlProps {
  bet: number;
  setBet: (bet: number) => void;
  spinning: boolean;
}

const BetControl: React.FC<BetControlProps> = ({ bet, setBet, spinning }) => {
  return (
    <div className='flex flex-col'>
        <div className="flex items-center gap-2">
        <button 
            className="bg-left-accent text-black p-2 mr-2 rounded-full"
            onClick={() => setBet(bet > 1 ? bet - 1 : bet)} 
            disabled={spinning || bet <= 1}
        >
            -
        </button>
        <span className="text-xl">{bet}</span>
        <button 
            className="bg-left-accent text-black p-2 ml-2 rounded-full"
            onClick={() => setBet(bet + 1)} 
            disabled={spinning}
        >
            +
        </button>
        </div>
        <span className="text-left-accent text-xl pl-7">Bet</span>
    </div>
  );
};

export default BetControl;
