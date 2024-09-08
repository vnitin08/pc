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
  image: '/image/games/logo1.png',
  logoMode: LogoMode.CENTER,
  genre: ZkNoidGameGenre.Lucky,
  features: [ZkNoidGameFeature.SinglePlayer],
  isReleased: true,
  releaseDate: new Date(2024, 8, 28),
  popularity: 50,
  author: 'TokenTwist Team',
  rules:
    'Token Twist is a game where a player try their luck by spin the wheel  and win the jackpot',
  runtimeModules: {
    SlotMachine,
  },
  page: Slot_Machine,
});
