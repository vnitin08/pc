import { RuntimeModule, runtimeMethod, runtimeModule, state } from '@proto-kit/module';
import {
  Field,
  PublicKey,
  Poseidon,
  Provable,
} from 'o1js';
import { State, StateMap, assert } from '@proto-kit/protocol';
import { UInt64 } from '@proto-kit/library'

@runtimeModule()
export class SlotMachine extends RuntimeModule {
  @state() public jackpot = State.from<UInt64>(UInt64);
  @state() public playerBalances = StateMap.from<PublicKey, UInt64>(PublicKey, UInt64);
  @state() public lastSpins = StateMap.from<PublicKey, Field>(PublicKey, Field);

  // Constant reel values for testing
  private readonly REEL1_VALUE = Field(0);
  private readonly REEL2_VALUE = Field(1);
  private readonly REEL3_VALUE = Field(2);

  @runtimeMethod()
  public async spin(bet: UInt64): Promise<{ reel1: Field; reel2: Field; reel3: Field }> {
    const sender = this.transaction.sender.value;
    const playerBalance = (await this.playerBalances.get(sender)).value;
    
    assert(playerBalance.greaterThanOrEqual(bet), 'Insufficient balance');

    // Deduct bet from player balance
    await this.playerBalances.set(sender, playerBalance.sub(bet));

    // Use constant values instead of random generation
    const reel1 = this.REEL1_VALUE;
    const reel2 = this.REEL2_VALUE;
    const reel3 = this.REEL3_VALUE;

    await this.lastSpins.set(sender, reel1.mul(Field(100)).add(reel2.mul(Field(10))).add(reel3));

    const isJackpot = Provable.if(
      reel1.equals(Field(0)).and(reel2.equals(Field(0))).and(reel3.equals(Field(0)))
        .or(reel1.equals(Field(1)).and(reel2.equals(Field(1))).and(reel3.equals(Field(1))))
        .or(reel1.equals(Field(2)).and(reel2.equals(Field(2))).and(reel3.equals(Field(2)))),
      Field(1),
      Field(0)
    );

    const currentJackpot = (await this.jackpot.get()).value;
    let newPlayerBalance = playerBalance;

    newPlayerBalance = Provable.if(
      isJackpot.equals(Field(1)),
      newPlayerBalance.add(currentJackpot),
      newPlayerBalance
    );

    const newJackpot = Provable.if(
      isJackpot.equals(Field(1)),
      UInt64.from(0),
      currentJackpot.add(bet)
    );

    await this.jackpot.set(newJackpot);

    const hasMatch = reel1.equals(reel2).or(reel2.equals(reel3)).or(reel1.equals(reel3));
    
    newPlayerBalance = Provable.if(
      hasMatch.and(isJackpot.equals(Field(0))),
      newPlayerBalance.add(bet.mul(UInt64.from(2))),
      newPlayerBalance
    );

    await this.playerBalances.set(sender, newPlayerBalance);

    return { reel1, reel2, reel3 };
  }

  @runtimeMethod()
  public async deposit(amount: UInt64): Promise<void> {
    const sender = this.transaction.sender.value;
    const currentBalance = (await this.playerBalances.get(sender)).value;
    await this.playerBalances.set(sender, currentBalance.add(amount));
  }

  @runtimeMethod()
  public async withdraw(amount: UInt64): Promise<void> {
    const sender = this.transaction.sender.value;
    const currentBalance = (await this.playerBalances.get(sender)).value;
    assert(currentBalance.greaterThanOrEqual(amount), 'Insufficient balance');
    await this.playerBalances.set(sender, currentBalance.sub(amount));
  }

  @runtimeMethod()
  public async getBalance(): Promise<UInt64> {
    const sender = this.transaction.sender.value;
    return (await this.playerBalances.get(sender)).value;
  }

  @runtimeMethod()
  public async getLastSpin(): Promise<Field> {
    const sender = this.transaction.sender.value;
    return (await this.lastSpins.get(sender)).value;
  }

  @runtimeMethod()
  public async getJackpot(): Promise<UInt64> {
    return (await this.jackpot.get()).value;
  }
}

export default SlotMachine;