import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ICompetition } from '@/lib/types';
import { useSwitchWidgetStorage } from '@/lib/stores/switchWidgetStorage';
import { formatUnits } from '@/lib/unit';
import { Checkbox } from '@/components/ui/games-store/shared/Checkbox';
import { Button } from '@/components/ui/games-store/shared/Button';

export const CompetitionListItem = ({
  competition,
}: {
  competition: ICompetition;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPreReg, setIsPreReg] = useState<boolean>(competition.preReg);
  const [isRegistered, setIsRegistered] = useState<boolean>(
    !!competition.registered
  );

  const switchStore = useSwitchWidgetStorage();

  return (
    <div
      className={
        'flex w-full flex-col gap-4 border-t border-left-accent pl-4 pt-4 last:border-b last:pb-4'
      }
    >
      <div className={'grid grid-cols-5 items-center gap-8'}>
        <div
          className={
            'flex flex-row items-center gap-4 text-headline-2 font-medium uppercase text-left-accent'
          }
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className={'flex cursor-pointer flex-row gap-4 hover:opacity-80'}
          >
            <span>[{competition.id}]</span>
            <span>{competition.title}</span>
          </div>
        </div>
        <div
          className={
            'col-start-2 col-end-4 flex w-full flex-row gap-0 font-plexsans text-[20px]/[20px] font-medium max-[2000px]:gap-2 min-[2000px]:gap-4'
          }
        >
          <div
            className={
              'flex w-full min-w-fit items-center justify-center rounded-2xl border border-left-accent bg-left-accent p-1 px-2 text-center text-dark-buttons-text'
            }
          >
            {formatUnits(competition.reward)} {competition.currency} REWARDS
          </div>
          <div
            className={
              'w-full min-w-fit items-center justify-center rounded-2xl border border-left-accent p-1 px-2 text-center'
            }
          >
            {formatUnits(competition.participationFee)} {competition.currency}{' '}
            Participants fee
          </div>
        </div>
        <Button
          label={'Play'}
          asLink
          href={`/games/${competition.game.id}/${competition.id}`}
          onClick={() => switchStore.setCompetitionId(competition.id)}
        />
        <div className={'flex w-full flex-col items-end justify-center'}>
          <div
            className={
              'flex h-[24px] w-[24px] cursor-pointer flex-col items-center justify-center border-2 border-left-accent hover:opacity-80'
            }
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={'h-[2px] w-full bg-left-accent'} />
            <motion.div
              animate={isOpen ? 'open' : 'close'}
              variants={{ open: { opacity: 0 }, close: { opacity: 1 } }}
              className={'h-[2px] w-full rotate-90 bg-left-accent'}
            />
          </div>
        </div>
      </div>
      <AnimatePresence initial={false} mode={'wait'}>
        {isOpen && (
          <motion.div
            className={
              'grid w-full grid-cols-5 items-center gap-8 overflow-hidden'
            }
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
          >
            <div className={'flex w-full flex-col gap-4'}>
              <div className={'grid grid-cols-2'}>
                <span
                  className={'text-buttons-menu uppercase text-left-accent'}
                >
                  Preregiatration
                </span>
                <div className={'flex w-full items-center justify-center'}>
                  <Checkbox isSelected={isPreReg} isReadonly />
                </div>
              </div>
              <div className={'grid grid-cols-2'}>
                <span
                  className={'text-buttons-menu uppercase text-left-accent'}
                >
                  Registered
                </span>
                <div className={'flex w-full items-center justify-center'}>
                  <Checkbox isSelected={isRegistered} isReadonly />
                </div>
              </div>
            </div>
            <div className={'col-start-2 col-end-4 flex flex-row gap-10'}>
              <div className={'flex w-full flex-col gap-2'}>
                <span
                  className={
                    'font-plexsans text-[16px]/[16px] font-semibold uppercase text-left-accent'
                  }
                >
                  Preregistration dates
                </span>
                <div className={'flex flex-col gap-2'}>
                  <div
                    className={
                      'flex flex-row items-center gap-4 font-plexsans text-[16px]/[16px]'
                    }
                  >
                    <span className={'font-extralight'}>Start</span>
                    <span className={'font-normal text-foreground opacity-80'}>
                      {competition.preRegDate.start.toLocaleDateString(
                        'en-US',
                        {
                          dateStyle: 'long',
                        }
                      )}
                    </span>
                  </div>
                  <div
                    className={
                      'flex flex-row items-center gap-4 font-plexsans text-[16px]/[16px]'
                    }
                  >
                    <span className={'font-extralight'}>Finish</span>
                    <span className={'font-normal text-foreground opacity-80'}>
                      {competition.preRegDate.end.toLocaleDateString('en-US', {
                        dateStyle: 'long',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className={'flex w-full flex-col gap-2'}>
                <span
                  className={
                    'font-plexsans text-[16px]/[16px] font-semibold uppercase text-left-accent'
                  }
                >
                  Competitions dates
                </span>
                <div className={'flex flex-col gap-2'}>
                  <div
                    className={
                      'flex flex-row items-center gap-4 font-plexsans text-[16px]/[16px]'
                    }
                  >
                    <span className={'font-extralight'}>Start</span>
                    <span className={'font-normal text-foreground opacity-80'}>
                      {competition.competitionDate.start.toLocaleDateString(
                        'en-US',
                        {
                          dateStyle: 'long',
                        }
                      )}
                    </span>
                  </div>
                  <div
                    className={
                      'flex flex-row items-center gap-4 font-plexsans text-[16px]/[16px]'
                    }
                  >
                    <span className={'font-extralight'}>Finish</span>
                    <span className={'font-normal text-foreground opacity-80'}>
                      {competition.competitionDate.end.toLocaleDateString(
                        'en-US',
                        {
                          dateStyle: 'long',
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
