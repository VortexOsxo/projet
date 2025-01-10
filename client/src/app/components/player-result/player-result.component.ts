import { Component, Input, OnInit } from '@angular/core';
import { BAN_ICON, NOT_BAN_ICON } from '@app/consts/file-consts';
import { ChatBanManagerService } from '@app/services/chat-services/chat-ban-manager.service';
import { Player } from '@common/interfaces/player';

@Component({
    selector: 'app-player-result',
    templateUrl: './player-result.component.html',
    styleUrls: ['./player-result.component.scss'],
})
export class PlayerResultComponent implements OnInit {
    @Input() player: Player;
    @Input() canBanUser: boolean;
    iconPath: string;

    constructor(private chatBanService: ChatBanManagerService) {}

    ngOnInit() {
        this.updateIcon();
    }

    banPlayer() {
        if (!this.canBanUser) return;
        this.chatBanService.banUser(this.player.name);
        this.updateIcon();
    }

    private updateIcon() {
        this.iconPath = this.chatBanService.isUserBanned(this.player.name) ? BAN_ICON : NOT_BAN_ICON;
    }
}
