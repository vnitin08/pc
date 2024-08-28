import { RuntimeModule, runtimeModule } from '@proto-kit/module';
import {
  Field,
  PublicKey,
  UInt64,
} from 'o1js';
import { state, runtimeMethod } from '@proto-kit/module';
import { State, StateMap, assert } from '@proto-kit/protocol';
import { RandomGenerator } from '../engine';

interface SlotMachineConfig {}

@runtimeModule()
export class SlotMachine extends RuntimeModule<SlotMachineConfig> {
  @state() jackpot = State.from<UInt64>(UInt64);
  @state() playerBalances = StateMap.from<PublicKey, UInt64>(PublicKey, UInt64);
  @state() lastSpins = StateMap.from<PublicKey, Field>(PublicKey, Field);
  randomGen: any;

  @runtimeMethod()
  public async spin(bet: UInt64) {
    const sender = this.transaction.sender.value;
    let playerBalance = await this.playerBalances.get(sender);
    
    assert(playerBalance.value.greaterThanOrEqual(bet), 'Insufficient balance');

    // Deduct bet from player balance
    await this.playerBalances.set(sender, playerBalance.value.sub(bet));

    const seed = Field.random();  // Generate a random seed
    const randomGen = RandomGenerator.from(seed); // Use same instance of RandomGenerator

    // Generate random numbers for reels (0, 1, or 2 representing different symbols)
    const reel1 = this.randomGen.getNumber(3).toBigInt();
    const reel2 = this.randomGen.getNumber(3).toBigInt();
    const reel3 = this.randomGen.getNumber(3).toBigInt();

    await this.lastSpins.set(sender, Field.from(reel1 * 100n + reel2 * 10n + reel3));

    const isJackpot = reel1 === 0n && reel2 === 0n && reel3 === 0n;

    if (isJackpot) {
      let currentJackpot = await this.jackpot.get();
      await this.playerBalances.set(sender, playerBalance.value.add(currentJackpot.value));
      await this.jackpot.set(UInt64.from(0));
    } else {
      let currentJackpot = await this.jackpot.get();
      await this.jackpot.set(currentJackpot.value.add(bet));

      if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
        await this.playerBalances.set(sender, playerBalance.value.add(bet.mul(2)));
      }
    }
  }

  @runtimeMethod()
  public async deposit(amount: UInt64) {
    const sender = this.transaction.sender.value;
    let currentBalance = await this.playerBalances.get(sender);
    await this.playerBalances.set(sender, currentBalance.value.add(amount));
  }

  @runtimeMethod()
  public async withdraw(amount: UInt64) {
    const sender = this.transaction.sender.value;
    let currentBalance = await this.playerBalances.get(sender);
    assert(currentBalance.value.greaterThanOrEqual(amount), 'Insufficient balance');
    await this.playerBalances.set(sender, currentBalance.value.sub(amount));
  }

  @runtimeMethod()
  public async getBalance(): Promise<UInt64> {
    const sender = this.transaction.sender.value;
    let balance = await this.playerBalances.get(sender);
    return balance.value;
  }

  @runtimeMethod()
  public async getLastSpin(): Promise<Field> {
    const sender = this.transaction.sender.value;
    let lastSpin = await this.lastSpins.get(sender);
    return lastSpin.value;
  }

  @runtimeMethod()
  public async getJackpot(): Promise<UInt64> {
    let jackpot = await this.jackpot.get();
    return jackpot.value;
  }
}

export default SlotMachine; 
