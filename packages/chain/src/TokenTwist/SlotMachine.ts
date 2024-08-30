import { RuntimeModule, runtimeModule } from '@proto-kit/module';
import {
  Field,
  PublicKey,
  UInt64,
  Poseidon,
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
  @state() commitments = StateMap.from<PublicKey, Field>(PublicKey, Field);

  private randomGen: RandomGenerator;

  constructor(config: SlotMachineConfig) {
    super();
    this.randomGen = new RandomGenerator({ seed: Field.random(), source: Field.random(), curValue: Field.random() });
  }

  private generateCommitment(): Field {
    return Field.random();
  }

  @runtimeMethod()
  public async spin(bet: UInt64) {
    const sender = this.transaction.sender.value;
    let playerBalance = await this.playerBalances.get(sender);
    
    assert(playerBalance.value.greaterThanOrEqual(bet), 'Insufficient balance');

    // Deduct bet from player balance
    await this.playerBalances.set(sender, playerBalance.value.sub(bet));

    // Internal commit-reveal process
    const commitment = this.generateCommitment();
    await this.commitments.set(sender, commitment);

    const seed = Poseidon.hash([commitment, Field.random()]); // Generate a random seed
    const randomGen = RandomGenerator.from(seed); // Use same instance of RandomGenerator

    // Generate random numbers for reels (0, 1, or 2 representing different symbols)
    const reel1 = BigInt(this.randomGen.getNumber(3).toString());
    const reel2 = BigInt(this.randomGen.getNumber(3).toString());
    const reel3 = BigInt(this.randomGen.getNumber(3).toString());

    await this.lastSpins.set(sender, Field.from(reel1 * 100n + reel2 * 10n + reel3));

    const isJackpot = (reel1 === 0n && reel2 === 0n && reel3 === 0n) ||
                      (reel1 === 1n && reel2 === 1n && reel3 === 1n) ||
                      (reel1 === 2n && reel2 === 2n && reel3 === 2n);

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

    // Clear the commitment after the spin
    await this.commitments.set(sender, Field(0));

    return { reel1, reel2, reel3 };
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
