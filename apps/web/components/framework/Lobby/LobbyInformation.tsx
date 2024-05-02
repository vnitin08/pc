import { clsx } from 'clsx';
import { Button } from '@/components/ui/games-store/shared/Button';
import { ILobby } from '@/lib/types';
import { motion } from 'framer-motion';
import { usePvpLobbyStorage } from '@/lib/stores/pvpLobbyStore';
import { Input } from '@/components/ui/games-store/shared/Input';
import { Popover } from '@/components/ui/games-store/shared/Popover';
import { RuntimeModulesRecord } from '@proto-kit/module';
import { ZkNoidGameConfig } from '@/lib/createConfig';

enum PlayerStates {
  Waiting,
  Ready,
  Connecting,
}

const PlayersListItem = ({
  index,
  account,
  state,
}: {
  index: number;
  account: string;
  state: PlayerStates;
}) => {
  return (
    <div
      className={clsx(
        'mt-3 grid grid-cols-5 border-t pt-3 text-[16px]/[16px] uppercase last:border-b last:pb-3',
        { 'text-left-accent': state === PlayerStates.Ready }
      )}
    >
      <span className={'col-start-1 col-end-1'}>[{index}]</span>
      <span className={'col-start-2 col-end-3'}>
        {account.slice(0, 5) + '...' + account.slice(-5)}
      </span>
      <span className={'col-start-4 col-end-6'}>
        {state === PlayerStates.Waiting && 'Waiting opponent'}
        {state === PlayerStates.Ready && 'Ready to play'}
        {state === PlayerStates.Connecting && 'Connecting...'}
      </span>
    </div>
  );
};

export const LobbyInformation = <RuntimeModules extends RuntimeModulesRecord>({
  gameName,
  lobby,
  config,
  joinLobby,
  leaveLobby,
  ready,
  currentLobbyId,
  selfReady,
}: {
  gameName: string;
  lobby: ILobby;
  config: ZkNoidGameConfig<RuntimeModules>;
  joinLobby: (lobbyId: number) => Promise<void>;
  leaveLobby: () => Promise<void>;
  ready: () => Promise<void>;
  currentLobbyId?: number;
  selfReady: boolean;
}) => {
  return (
    <motion.div
      className={'col-start-4 col-end-6 row-span-4 h-full w-full'}
      initial={'hidden'}
      animate={'visible'}
      exit={'hidden'}
      transition={{ type: 'spring', duration: 0.8, bounce: 0 }}
      variants={{
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
      }}
    >
      <div
        className={
          'flex h-full w-full flex-col rounded-[5px] border border-foreground bg-[#252525] p-2'
        }
      >
        <div className={'flex flex-col gap-2'}>
          <span className={'text-headline-3 uppercase text-left-accent'}>
            {lobby.name}
          </span>
          {/*{lobbyStorage.currentLobby?.id === lobby.id && (*/}
          {/*  <span className={'py-2 font-plexsans text-[16px]/[16px]'}>*/}
          {/*    Your lobby is create correctly! Now you can share it with you*/}
          {/*    friends in any way you like.*/}
          {/*  </span>*/}
          {/*)}*/}
          <div
            className={
              'grid grid-cols-4 gap-2 font-plexsans text-[16px]/[16px]'
            }
          >
            <span className={'font-medium uppercase text-left-accent'}>
              Game Name
            </span>
            <span className={'col-start-2 col-end-5'}>{gameName}</span>
            <span className={'font-medium uppercase text-left-accent'}>
              Participants fee
            </span>
            <span className={'col-start-2 col-end-5'}>
              {lobby.reward.toString()} {lobby.currency}
            </span>
            <span className={'font-medium uppercase text-left-accent'}>
              Max Funds
            </span>
            <span className={'col-start-2 col-end-5'}>
              {lobby.fee.toString()} {lobby.currency}
            </span>
          </div>
        </div>
        {currentLobbyId === lobby.id && (
          <div className={'flex w-full max-w-[80%] flex-row gap-2 py-8'}>
            <div className={'w-full'}>
              <Input
                value={`https://app.zknoid.io/games/${config.id}/lobby/${lobby.id}?key=${lobby.accessKey}`}
                isReadonly={true}
                title={'Copy invite link'}
              />
            </div>
            <div className={'flex flex-col justify-end'}>
              <div />
              <Popover
                trigger={
                  <div
                    className={
                      'group flex cursor-copy flex-col items-center justify-center rounded-[5px] border border-foreground p-2 hover:border-left-accent'
                    }
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://app.zknoid.io/games/${config.id}/lobby/${lobby.id}?key=${lobby.accessKey}`
                      );
                    }}
                  >
                    <svg
                      width="20"
                      height="24"
                      viewBox="0 0 20 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={'h-[29px] w-[29px]'}
                    >
                      <path
                        d="M11 20C12.3256 19.9984 13.5964 19.4711 14.5338 18.5338C15.4711 17.5965 15.9984 16.3256 16 15V6.24302C16.0016 5.71738 15.8988 5.19665 15.6976 4.71104C15.4964 4.22542 15.2008 3.78456 14.828 3.41402L12.586 1.17202C12.2155 0.799191 11.7746 0.50362 11.289 0.302438C10.8034 0.101255 10.2826 -0.00153795 9.757 1.73896e-05H5C3.67441 0.00160525 2.40356 0.528899 1.46622 1.46624C0.528882 2.40358 0.00158786 3.67442 0 5.00002V15C0.00158786 16.3256 0.528882 17.5965 1.46622 18.5338C2.40356 19.4711 3.67441 19.9984 5 20H11ZM2 15V5.00002C2 4.20437 2.31607 3.44131 2.87868 2.8787C3.44129 2.31609 4.20435 2.00002 5 2.00002C5 2.00002 9.919 2.01402 10 2.02402V4.00002C10 4.53045 10.2107 5.03916 10.5858 5.41423C10.9609 5.7893 11.4696 6.00002 12 6.00002H13.976C13.986 6.08102 14 15 14 15C14 15.7957 13.6839 16.5587 13.1213 17.1213C12.5587 17.6839 11.7956 18 11 18H5C4.20435 18 3.44129 17.6839 2.87868 17.1213C2.31607 16.5587 2 15.7957 2 15ZM20 8.00002V19C19.9984 20.3256 19.4711 21.5965 18.5338 22.5338C17.5964 23.4711 16.3256 23.9984 15 24H6C5.73478 24 5.48043 23.8947 5.29289 23.7071C5.10536 23.5196 5 23.2652 5 23C5 22.7348 5.10536 22.4804 5.29289 22.2929C5.48043 22.1054 5.73478 22 6 22H15C15.7956 22 16.5587 21.6839 17.1213 21.1213C17.6839 20.5587 18 19.7957 18 19V8.00002C18 7.7348 18.1054 7.48045 18.2929 7.29291C18.4804 7.10537 18.7348 7.00002 19 7.00002C19.2652 7.00002 19.5196 7.10537 19.7071 7.29291C19.8946 7.48045 20 7.7348 20 8.00002Z"
                        fill="#F9F8F4"
                        className={'group-hover:fill-left-accent'}
                      />
                    </svg>
                  </div>
                }
              >
                <div className={'min-w-[200px] text-center'}>Link copied!</div>
              </Popover>
            </div>
          </div>
        )}
        <div className={'flex-grow'} />
        <div className={'flex flex-col gap-2 pt-4'}>
          <span className={'text-[16px]/[16px] font-medium uppercase'}>
            Players list
          </span>
          <div className={'grid grid-cols-5 font-plexsans text-[16px]/[16px]'}>
            <span className={'col-start-1 col-end-1'}>Index</span>
            <span className={'col-start-2 col-end-3'}>Nickname\Adress</span>
            <span className={'col-start-4 col-end-6'}>Status</span>
          </div>
          <div className={'flex flex-col'}>
            {lobby.playersAddresses &&
              lobby.playersAddresses.map((player, index) => {
                return (
                  <PlayersListItem
                    key={player.toBase58()}
                    account={player.toBase58()}
                    state={
                      lobby.playersReady![index]
                        ? PlayerStates.Ready
                        : PlayerStates.Waiting
                    }
                    index={index}
                  />
                );
              })}
          </div>
        </div>
        <div className={'flex-grow'} />
        {currentLobbyId == lobby.id ? (
          <div className={'flex flex-row gap-2 pt-2'}>
            <Button
              label={selfReady ? 'Not ready' : 'Ready to play'}
              onClick={ready}
            />
            <Button
              label={'Leave lobby'}
              onClick={leaveLobby}
              color={'tertiary'}
            />
          </div>
        ) : (
          <Button
            label={'Connect to lobby'}
            onClick={() => {
              joinLobby(lobby.id);
              // pvpLobbyStorage.setConnectedLobbyId(lobby.id);
              // pvpLobbyStorage.setConnectedLobbyKey(lobby.accessKey);
            }}
          />
        )}
      </div>
    </motion.div>
  );
};
