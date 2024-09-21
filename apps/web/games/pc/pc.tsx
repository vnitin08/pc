import { useContext, useEffect, useState } from 'react';
import { PublicKey, UInt64 } from 'o1js';
import { useNetworkStore } from '@/lib/stores/network';
import { ClientAppChain , PowerClash } from 'zknoid-chain-dev';
import GamePage from '@/components/framework/GamePage';
import { powerclashConfig } from './config'; // Game configuration for Power Clash
import ZkNoidGameContext from '@/lib/contexts/ZkNoidGameContext';
import { useProtokitChainStore } from '@/lib/stores/protokitChain';
import CoverSVG from './assets/game-cover.svg';
import { motion } from 'framer-motion';
import Button from '@/components/shared/Button';
import toast from '@/components/shared/Toast';
import { useToasterStore } from '@/lib/stores/toasterStore';

export default function pc({ params }: { params: { competitionId: string } }) {
  const [player1Move, setPlayer1Move] = useState<number | null>(null);
  const [player2Move, setPlayer2Move] = useState<number | null>(null);
  const [inputMove, setInputMove] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState('waiting');

  const { client } = useContext(ZkNoidGameContext);
  if (!client) {
    throw Error('Context app chain client is not set');
  }

  const networkStore = useNetworkStore();
  const protokitChain = useProtokitChainStore();
  const toasterStore = useToasterStore();

  const client_ = client as ClientAppChain<typeof powerclashConfig.runtimeModules, any, any, any>;

  const query = networkStore.protokitClientStarted ? client_.query.runtime.PowerClash : undefined;

  // Submit move to the backend without hashing/salting
  const submitMove = async (move: number) => {
    const clashLogic = client_.runtime.resolve('PowerClash');
    const tx = await client.transaction(PublicKey.fromBase58(networkStore.address!), async () => {
      await clashLogic.submitMove(UInt64.from(move));
    });
    await tx.sign();
    await tx.send();
    toast.success(toasterStore, `Move submitted successfully!`, true);
  };

  useEffect(() => {
    // Fetch player moves directly from the backend
    query?.player1Move.get().then((move) => setPlayer1Move(move ? move.toNumber() : null));
    query?.player2Move.get().then((move) => setPlayer2Move(move ? move.toNumber() : null));
    setGameStatus(player1Move !== null && player2Move !== null ? 'reveal' : 'submit');
  }, [protokitChain.block]);

  return (
    <GamePage
      gameConfig={powerclashConfig}
      image={CoverSVG}
      mobileImage={CoverSVG}
      defaultPage={'Game'}
    >
      <motion.div className="flex flex-col-reverse lg:grid lg:grid-cols-4 gap-4 pt-10">
        <div className="lg:hidden flex flex-col gap-4">
          <span className="font-bold text-headline-2">Rules</span>
          <span className="font-plexsans text-buttons-menu">
            {powerclashConfig.rules}
          </span>
        </div>
        
        <div className="hidden lg:flex flex-col gap-4 h-full">
          <div className="flex w-full gap-2 text-[20px] font-plexsans uppercase">
            <span>Game status:</span>
            <span>{gameStatus === 'submit' ? 'Submit Moves' : 'Reveal Moves'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span>{gameStatus === 'submit' ? 'Enter your move to submit:' : 'Moves have been submitted!'}</span>
            {gameStatus === 'submit' && (
              <input
                type="number"
                className="text-black"
                placeholder="Move (0-4)"
                value={inputMove ?? ''}
                onChange={(e) => setInputMove(parseInt(e.target.value))}
              />
            )}
            <Button
              label={gameStatus === 'submit' ? 'Submit Move' : 'Moves Submitted'}
              disabled={gameStatus !== 'submit'}
              onClick={() => inputMove !== null && submitMove(inputMove)}
            />
          </div>
        </div>
      </motion.div>
    </GamePage>
  );
}
