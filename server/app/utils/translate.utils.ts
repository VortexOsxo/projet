import { Player as PlayerClient } from '@common/interfaces/player';
import { Player } from '@app/interfaces/users/player';
export const translatePlayer = (player: Player): PlayerClient => {
    return {
        name: player.name,
        score: player.score,
        bonusCount: player.bonusCount,
        answerState: player.answerState,
    };
};

export const translatePlayers = (players: Player[]): PlayerClient[] => {
    return players.map((player) => translatePlayer(player));
};
