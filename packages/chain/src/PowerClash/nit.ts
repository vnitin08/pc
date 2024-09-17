// import { state, runtimeMethod, runtimeModule } from '@proto-kit/module';
// import { State, StateMap, assert } from '@proto-kit/protocol';
// import {
//   PublicKey,
//   Struct,
//   UInt64,
//   Provable,
//   Bool,
//   UInt32,
//   Field,
// } from 'o1js';
// import { MatchMaker } from '../engine/MatchMaker';
// import { Lobby } from '../engine/LobbyManager';
// import { UInt64 as ProtoUInt64 } from '@proto-kit/library';

// export enum Move {
//   NONE = 0,
//   ROCK = 1,
//   PAPER = 2,
//   SCISSORS = 3,
//   // Reserved for future additions
//   FUTURE1 = 4,
//   FUTURE2 = 5,
// }

// export class GameInfo extends Struct({
//   player1: PublicKey,
//   player2: PublicKey,
//   player1Commitment: Field,
//   player2Commitment: Field,
//   player1Move: UInt32,
//   player2Move: UInt32,
//   player1Wins: UInt32,
//   player2Wins: UInt32,
//   currentRound: UInt32,
//   lastMoveBlockHeight: UInt64,
//   gameEnded: Bool,
//   revealPhase: Bool,
// }) {}

// @runtimeModule()
// export class PowerClashLogic extends MatchMaker {
//   @state() public games = StateMap.from<UInt64, GameInfo>(UInt64, GameInfo);
//   @state() public gamesNum = State.from<UInt64>(UInt64);

//   public override async initGame(lobby: Lobby, shouldUpdate: Bool): Promise<UInt64> {
//     const currentGameId = lobby.id;

//     await this.games.set(
//       Provable.if(shouldUpdate, currentGameId, UInt64.from(0)),
//       new GameInfo({
//         player1: lobby.players[0],
//         player2: lobby.players[1],
//         player1Commitment: Field(0),
//         player2Commitment: Field(0),
//         player1Move: UInt32.from(Move.NONE),
//         player2Move: UInt32.from(Move.NONE),
//         player1Wins: UInt32.from(0),
//         player2Wins: UInt32.from(0),
//         currentRound: UInt32.from(1),
//         lastMoveBlockHeight: this.network.block.height,
//         gameEnded: Bool(false),
//         revealPhase: Bool(false),
//       }),
//     );

//     await this.gameFund.set(
//       currentGameId,
//       ProtoUInt64.from(lobby.participationFee).mul(2),
//     );

//     return await super.initGame(lobby, shouldUpdate);
//   }

//   @runtimeMethod()
//   public async proveOpponentTimeout(gameId: UInt64): Promise<void> {
//     await super.proveOpponentTimeout(gameId, true);
//   }

//   @runtimeMethod()
//   public async commitMove(gameId: UInt64, commitment: Field): Promise<void> {
//     const sessionSender = await this.sessions.get(this.transaction.sender.value);
//     const sender = Provable.if(
//       sessionSender.isSome,
//       sessionSender.value,
//       this.transaction.sender.value,
//     );

//     const game = await this.games.get(gameId);
//     assert(game.isSome, 'Invalid game id');
//     assert(game.value.gameEnded.not(), 'Game has ended');
//     assert(game.value.revealPhase.not(), 'Currently in reveal phase');

//     const isPlayer1 = sender.equals(game.value.player1);
//     assert(
//       Bool.or(isPlayer1, sender.equals(game.value.player2)),
//       'Not a player in this game'
//     );

//     // Update the player's commitment
//     if (isPlayer1) {
//       game.value.player1Commitment = commitment;
//     } else {
//       game.value.player2Commitment = commitment;
//     }

//     // If both players have committed, move to reveal phase
//     if (game.value.player1Commitment.equals(Field(0)).not() &&
//         game.value.player2Commitment.equals(Field(0)).not()) {
//       game.value.revealPhase = Bool(true);
//     }

//     game.value.lastMoveBlockHeight = this.network.block.height;
//     await this.games.set(gameId, game.value);
//   }

//   @runtimeMethod()
//   public async revealMove(gameId: UInt64, move: UInt32, salt: Field): Promise<void> {
//     const sessionSender = await this.sessions.get(this.transaction.sender.value);
//     const sender = Provable.if(
//       sessionSender.isSome,
//       sessionSender.value,
//       this.transaction.sender.value,
//     );

//     const game = await this.games.get(gameId);
//     assert(game.isSome, 'Invalid game id');
//     assert(game.value.gameEnded.not(), 'Game has ended');
//     assert(game.value.revealPhase, 'Not in reveal phase');

//     const isPlayer1 = sender.equals(game.value.player1);
//     assert(
//       Bool.or(isPlayer1, sender.equals(game.value.player2)),
//       'Not a player in this game'
//     );

//     // Verify the commitment
//     const commitment = Provable.if(isPlayer1, game.value.player1Commitment, game.value.player2Commitment);
//     const calculatedCommitment = this.calculateCommitment(move, salt);
//     assert(commitment.equals(calculatedCommitment), 'Invalid move reveal');

//     // Update the player's move
//     if (isPlayer1) {
//       game.value.player1Move = move;
//     } else {
//       game.value.player2Move = move;
//     }

//     // If both players have revealed, resolve the round
//     if (game.value.player1Move.equals(UInt32.from(Move.NONE)).not() &&
//         game.value.player2Move.equals(UInt32.from(Move.NONE)).not()) {
//       const roundWinner = this.resolveRound(game.value.player1Move, game.value.player2Move);
      
//       if (roundWinner.equals(UInt32.from(1))) {
//         game.value.player1Wins = game.value.player1Wins.add(1);
//       } else if (roundWinner.equals(UInt32.from(2))) {
//         game.value.player2Wins = game.value.player2Wins.add(1);
//       }

//       game.value.currentRound = game.value.currentRound.add(1);
//       game.value.player1Move = UInt32.from(Move.NONE);
//       game.value.player2Move = UInt32.from(Move.NONE);
//       game.value.player1Commitment = Field(0);
//       game.value.player2Commitment = Field(0);
//       game.value.revealPhase = Bool(false);

//       // Check if the game has ended
//       const gameEnded = Bool.or(
//         game.value.player1Wins.equals(UInt32.from(3)),
//         game.value.player2Wins.equals(UInt32.from(3)),
//         game.value.currentRound.equals(UInt32.from(6))
//       );

//       if (gameEnded) {
//         game.value.gameEnded = Bool(true);
//         const winner = Provable.switch([
//           game.value.player1Wins.equals(UInt32.from(3)),
//           game.value.player2Wins.equals(UInt32.from(3)),
//         ], PublicKey, [
//           game.value.player1,
//           game.value.player2,
//           PublicKey.empty() // Draw
//         ]);

//         // Distribute funds (full amount to winner, or split if draw)
//         const winnerShare = Provable.if(
//           winner.equals(PublicKey.empty()),
//           ProtoUInt64.from(0.5),
//           ProtoUInt64.from(1)
//         );
//         const loserShare = Provable.if(
//           winner.equals(PublicKey.empty()),
//           ProtoUInt64.from(0.5),
//           ProtoUInt64.from(0)
//         );

//         await this.acquireFunds(
//           gameId,
//           winner,
//           Provable.if(winner.equals(game.value.player1), game.value.player2, game.value.player1),
//           winnerShare,
//           loserShare,
//           ProtoUInt64.from(1)
//         );

//         // Remove active game for players
//         await this.activeGameId.set(game.value.player1, UInt64.from(0));
//         await this.activeGameId.set(game.value.player2, UInt64.from(0));

//         await this._onLobbyEnd(gameId, Bool(true));
//       }
//     }

//     game.value.lastMoveBlockHeight = this.network.block.height;
//     await this.games.set(gameId, game.value);
//   }

//   private calculateCommitment(move: UInt32, salt: Field): Field {
//     return Poseidon.hash([Field(move), salt]);
//   }

//   private resolveRound(player1Move: UInt32, player2Move: UInt32): UInt32 {
//     // 0 = draw, 1 = player1 wins, 2 = player2 wins
//     return Provable.switch(
//       [
//         player1Move.equals(player2Move),
//         Bool.and(player1Move.equals(UInt32.from(Move.ROCK)), player2Move.equals(UInt32.from(Move.SCISSORS))),
//         Bool.and(player1Move.equals(UInt32.from(Move.PAPER)), player2Move.equals(UInt32.from(Move.ROCK))),
//         Bool.and(player1Move.equals(UInt32.from(Move.SCISSORS)), player2Move.equals(UInt32.from(Move.PAPER))),
//       ],
//       UInt32,
//       [
//         UInt32.from(0),
//         UInt32.from(1),
//         UInt32.from(1),
//         UInt32.from(1),
//       ],
//       UInt32.from(2)
//     );
//   }
// }