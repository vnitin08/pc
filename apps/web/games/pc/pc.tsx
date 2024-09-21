import { useState,useEffect, useContext} from 'react'; 
import React from 'react';
import { 
  usePowerClashMatchQueueStore,
  useObservePowerClashMatchQueue 
} from './stores/matchQueue';
import ZkNoidGameContext from '@/lib/contexts/ZkNoidGameContext';
import { useProtokitChainStore } from '@/lib/stores/protokitChain';
import { ClientAppChain } from 'zknoid-chain-dev';
import { powerclashConfig } from './config';
import { useStore } from 'zustand';
import { useSessionKeyStore } from '@/lib/stores/sessionKeyStorage';
import GamePage from '@/components/framework/GamePage';
import RandzuCoverSVG from '../randzu/assets/game-cover.svg';
import RandzuCoverMobileSVG from '../randzu/assets/game-cover-mobile.svg';
import Image from 'next/image';
import { Bool, CircuitString, UInt64 } from 'o1js';
import { useNetworkStore } from '@/lib/stores/network';
import { useToasterStore } from '@/lib/stores/toasterStore';
import { useRateGameStore } from '@/lib/stores/rateGameStore';
import { useStartGame } from './features/startGame';
import { DEFAULT_PARTICIPATION_FEE } from 'zknoid-chain-dev/dist/src/engine/LobbyManager';
import { useLobbiesStore, useObserveLobbiesStore } from '@/lib/stores/lobbiesStore';
import { api } from '@/trpc/react';
import { GameWrap } from '@/components/framework/GamePage/GameWrap';
import { Win } from '@/components/framework/GameWidget/ui/popups/Win';
import { Lost } from '@/components/framework/GameWidget/ui/popups/Lost';

enum GameState {
  WalletNotInstalled,
  WalletNotConnected,
  NotStarted,
  MatchRegistration,
  Matchmaking,
  CurrentPlayerTurn,
  OpponentTurn,
  OpponentTimeout,
  Won,
  Lost,
}

const moves = ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock'];

const pc: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.NotStarted);
  const [finalState, setFinalState] = useState<GameState>(GameState.NotStarted);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const { client } = useContext(ZkNoidGameContext);

  if (!client) {
    throw Error('Context app chain client is not set');
  }

  const networkStore = useNetworkStore();
  const toasterStore = useToasterStore();
  const rateGameStore = useRateGameStore();
  const protokitChain = useProtokitChainStore();
  useObservePowerClashMatchQueue();
  const matchQueue = usePowerClashMatchQueueStore();
  const startGame = useStartGame('global', setGameState);

  const client_ = client as ClientAppChain<
    typeof powerclashConfig.runtimeModules,
    any,
    any,
    any
  >;

  const query = networkStore.protokitClientStarted
    ? client_.query.runtime.PowerClash
    : undefined;

  useObserveLobbiesStore(query);
  const lobbiesStore = useLobbiesStore();

  console.log('Active lobby', lobbiesStore.activeLobby);

  const restart = () => {
    matchQueue.resetLastGameState();
    setGameState(GameState.NotStarted);
  };

  const sessionPrivateKey = useStore(useSessionKeyStore, (state) =>
    state.getSessionKey()
  );

  const collectPending = async () => {
    const PowerClash = client!.runtime.resolve('PowerClash');

    const tx = await client!.transaction(
      sessionPrivateKey.toPublicKey(),
      async () => {
        PowerClash.collectPendingBalance();
      }
    );

    console.log('Collect tx', tx);

    tx.transaction = tx.transaction?.sign(sessionPrivateKey);
    console.log('Sending tx', tx);
    await tx.send();
    console.log('Tx sent', tx);
  };

  const makeMove = async (move: string) => {
    if (!query || !matchQueue.gameInfo) return;

    const moveIndex = moves.indexOf(move);
    if (moveIndex === -1) return;

    const salt = Math.floor(Math.random() * 1000000);
    // const commitment = await query.commitMove(
    //   BigInt(matchQueue.gameInfo.id),
    //   BigInt(moveIndex),
    //   BigInt(salt)
    // );

    // TODO: Send the commitment to the blockchain
    setSelectedMove(move);
  };

  useEffect(() => {
    if (matchQueue.inQueue && !matchQueue.activeGameId) {
      setGameState(GameState.Matchmaking);
    } else if (matchQueue.activeGameId && Number(matchQueue.activeGameId) !== 0) {
      setGameState(GameState.CurrentPlayerTurn);
    } else {
      if (matchQueue.lastGameState === 'win') {
        setGameState(GameState.Won);
        setFinalState(GameState.Won);
      }
      if (matchQueue.lastGameState === 'lost') {
        setGameState(GameState.Lost);
        setFinalState(GameState.Lost);
      }
    }
  }, [matchQueue.activeGameId, matchQueue.inQueue, matchQueue.lastGameState]);

  return (
    <GamePage
      gameConfig={powerclashConfig}
      image={RandzuCoverSVG}
      mobileImage={RandzuCoverMobileSVG}
      defaultPage={'Game'}
    >
      <div className="flex flex-col gap-10 items-center justify-center bg-black text-white border-left-accent">
        <div className="w-full max-w-4xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              P1 Score: {matchQueue.gameInfo?.player1Wins.toString() || '0'}
            </div>
            <div className="text-3xl font-bold">
              Round: {(Number(matchQueue.gameInfo?.player1Wins || 0) + Number(matchQueue.gameInfo?.player2Wins || 0) + 1).toString()}
            </div>
            <div className="text-2xl font-bold">
              P2 Score: {matchQueue.gameInfo?.player2Wins.toString() || '0'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Move</h2>
              <div className="text-2xl">{selectedMove || 'Not selected'}</div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Opponent's Move</h2>
              <div className="text-2xl">Waiting...</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {moves.map((move) => (
              <button
                key={move}
                onClick={() => makeMove(move)}
                className={`p-4 rounded-lg text-lg font-semibold transition-colors ${
                  selectedMove === move
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {move}
              </button>
            ))}
          </div>

          {gameState === GameState.NotStarted && (
            <button
              onClick={() => startGame()}
              className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold"
            >
              Start Game
            </button>
          )}

          {gameState === GameState.Matchmaking && (
            <div className="text-center text-2xl">Finding an opponent...</div>
          )}

          {(gameState === GameState.Won || gameState === GameState.Lost) && (
            <div className="text-center text-4xl font-bold">
              {gameState === GameState.Won ? 'You Won!' : 'You Lost!'}
            </div>
          )}
        </div>
      </div>
    </GamePage>
  );
};

export default pc;