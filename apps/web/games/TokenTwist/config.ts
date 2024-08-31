import { createZkNoidGameConfig } from '@/lib/createConfig';
import { ZkNoidGameType } from '@/lib/platform/game_types';
import { ZkNoidGameFeature, ZkNoidGameGenre } from '@/lib/platform/game_tags';
import { SlotMachine} from 'zknoid-chain-dev'
import { LogoMode } from '@/app/constants/games';
import Slot_Machine from './Slot_Machine';

export const tokenTwistConfig = createZkNoidGameConfig({
  id: 'token-twist',
  type: ZkNoidGameType.SinglePlayer,
  name: 'TokenTwist : Try your luck',
  description: 'Player try their luck to win the jackpot',
  image: '/image/games/soon.svg',
  logoMode: LogoMode.CENTER,
  genre: ZkNoidGameGenre.Lucky,
  features: [ZkNoidGameFeature.SinglePlayer],
  isReleased: true,
  releaseDate: new Date(2024, 8, 28),
  popularity: 50,
  author: 'TokenTwist Team',
  rules:
    'Number guessing is a game where a player hides a number and gives the PC to another player. Other player tries to guess the number',
  runtimeModules: {
    SlotMachine,
  },
  page: Slot_Machine,
});
