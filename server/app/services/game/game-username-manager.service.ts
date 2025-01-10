import { Service } from 'typedi';
import { Player } from '@app/interfaces/users/player';
import { ORGANIZER_USERNAME } from '@common/config/game-config';

@Service({ transient: true })
export class GameUsernameManager {
    private usernames: Set<string>;

    constructor() {
        this.usernames = new Set();
        this.addBannedUsername(ORGANIZER_USERNAME);
    }

    attemptSetUsername(player: Player, desiredUsername: string): boolean {
        if (this.usernames.has(this.toLowerCase(desiredUsername))) return false;
        this.addBannedUsername(desiredUsername);
        player.name = desiredUsername;
        return true;
    }

    addBannedUsername(usernameToAdd: string): void {
        this.usernames.add(this.toLowerCase(usernameToAdd));
    }

    removeBannedUsername(usernameToDelete: string): void {
        this.usernames.delete(this.toLowerCase(usernameToDelete));
    }

    private toLowerCase(username: string): string {
        return username.toLowerCase();
    }
}
