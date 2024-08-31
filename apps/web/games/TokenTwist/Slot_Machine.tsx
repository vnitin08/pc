import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import { Field, UInt64, PublicKey, Poseidon } from 'o1js';
import { useNetworkStore } from '@/lib/stores/network';
import { ClientAppChain } from 'zknoid-chain-dev';
import GamePage from '@/components/framework/GamePage';
import { tokenTwistConfig } from './config';
import ZkNoidGameContext from '@/lib/contexts/ZkNoidGameContext';
import { useProtokitChainStore } from '@/lib/stores/protokitChain';
import CoverSVG from './assets/game-cover.svg';
import { DEFAULT_PARTICIPATION_FEE } from 'zknoid-chain-dev/dist/src/engine/LobbyManager';
import { motion } from 'framer-motion';
import Button from '@/components/shared/Button';
import toast from '@/components/shared/Toast';
import { useToasterStore } from '@/lib/stores/toasterStore';

interface SlotMachineModule {
  getBalance: () => Promise<UInt64>;
  getJackpot: () => Promise<UInt64>;
  spin: (bet: UInt64) => Promise<void>;
  deposit: (amount: UInt64) => Promise<void>;
  withdraw: (amount: UInt64) => Promise<void>;
  getLastSpin: () => Promise<Field>;
}

const competition = {
  id: 'global',
  name: 'Global competition',
  enteringPrice: BigInt(+DEFAULT_PARTICIPATION_FEE.toString()),
  prizeFund: 0n,
};

export default function Slot_Machine({
  params,
}: {
  params: { competitionId: string };
}){
  const [balance, setBalance] = useState<string>('0');
  const [bet, setBet] = useState<string>('1');
  const [jackpot, setJackpot] = useState<string>('0');
  const [lastSpin, setLastSpin] = useState<string>('');
  const [message, setMessage] = useState<string>('');

//   const { client } = useContext(ZkNoidGameContext);
//   const slotMachine = client?.runtime.getModule('SlotMachine') as SlotMachineModule | undefined;

  const { client } = useContext(ZkNoidGameContext);
  let slotMachine: SlotMachineModule | undefined;

  if (!client) {
    throw Error('Context app chain client is not set');
  }

  useEffect(() => {
    if (slotMachine) {
      fetchBalance();
      fetchJackpot();
    }
  }, [slotMachine]);

  const fetchBalance = async (): Promise<void> => {
    if (!slotMachine) return;
    try {
      const balance = await slotMachine.getBalance();
      setBalance(balance.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchJackpot = async (): Promise<void> => {
    if (!slotMachine) return;
    try {
      const jackpot = await slotMachine.getJackpot();
      setJackpot(jackpot.toString());
    } catch (error) {
      console.error('Error fetching jackpot:', error);
    }
  };

  const handleSpin = async (): Promise<void> => {
    if (!slotMachine) return;
    try {
      await slotMachine.spin(UInt64.from(bet));
      fetchBalance();
      fetchJackpot();
      const lastSpin = await slotMachine.getLastSpin();
      setLastSpin(lastSpin.toString());
      setMessage('Spin complete! Check your results.');
    } catch (error) {
      console.error('Error spinning:', error);
      setMessage('Error spinning. Please try again.');
    }
  };

  const handleDeposit = async (): Promise<void> => {
    if (!slotMachine) return;
    try {
      await slotMachine.deposit(UInt64.from(bet));
      fetchBalance();
      setMessage('Deposit successful!');
    } catch (error) {
      console.error('Error depositing:', error);
      setMessage('Error depositing. Please try again.');
    }
  };

  const handleWithdraw = async (): Promise<void> => {
    if (!slotMachine) return;
    try {
      await slotMachine.withdraw(UInt64.from(bet));
      fetchBalance();
      setMessage('Withdrawal successful!');
    } catch (error) {
      console.error('Error withdrawing:', error);
      setMessage('Error withdrawing. Please try again.');
    }
  };

  const renderReels = (): JSX.Element | null => {
    if (!lastSpin) return null;
    const reels = lastSpin.padStart(3, '0').split('').map(Number);
    const symbols = ['🍒', '🍋', '7️⃣'];
    return (
      <>
        {reels.map((reel, index) => (
          <span key={index} className="reel">
            {symbols[reel]}
          </span>
        ))}
      </>
    );
  };

  return (
    <GamePage
      gameConfig={tokenTwistConfig}
      image={CoverSVG}
      mobileImage={CoverSVG}
      defaultPage={'Game'}
    >
      <div className="slot-machine">
        <h1>Mina Protocol Slot Machine</h1>
        <div className="info">
          <p>Balance: {balance} MINA</p>
          <p>Jackpot: {jackpot} MINA</p>
        </div>
        <div className="controls">
          <div className='text-black'>
          <input
            type="number"
            value={bet}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBet(e.target.value)}
            min="1"
            
          />
          </div>
          <div className='flex gap-5 bg-green-500'>
            <button onClick={handleSpin}>Spin</button>
            <button onClick={handleDeposit}>Deposit</button>
            <button onClick={handleWithdraw}>Withdraw</button>
          </div>
          
        </div>
        <div className="reels">{renderReels()}</div>
        <p className="message">{message}</p>
      </div>
    </GamePage>
  );
};

