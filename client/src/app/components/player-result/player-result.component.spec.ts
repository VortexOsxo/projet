import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BAN_ICON, NOT_BAN_ICON } from '@app/consts/file-consts';
import { ChatBanManagerService } from '@app/services/chat-services/chat-ban-manager.service';
import { PlayerState } from '@common/enums/user-answer-state';
import { Player } from '@common/interfaces/player';
import { PlayerResultComponent } from './player-result.component';

describe('PlayerResultComponent', () => {
    let component: PlayerResultComponent;
    let fixture: ComponentFixture<PlayerResultComponent>;
    let chatServiceMock: jasmine.SpyObj<ChatBanManagerService>;

    beforeEach(() => {
        chatServiceMock = jasmine.createSpyObj(ChatBanManagerService, ['banUser', 'isUserBanned']);

        TestBed.configureTestingModule({
            declarations: [PlayerResultComponent],
            providers: [{ provide: ChatBanManagerService, useValue: chatServiceMock }],
        });
        fixture = TestBed.createComponent(PlayerResultComponent);
        component = fixture.componentInstance;
        component.player = { name: 'name' } as Player;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display player name, score, and bonus count', () => {
        const player: Player = {
            name: 'John Doe',
            score: 100,
            bonusCount: 3,
            answerState: PlayerState.ANSWERED,
        };
        component.player = player;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('h2').textContent).toContain(player.name);
        expect(compiled.querySelector('p:nth-of-type(1)').textContent).toContain(player.score + ' pts');
        expect(compiled.querySelector('p:nth-of-type(2)').textContent).toContain(player.bonusCount);
    });

    it('should display correct values when player data changes', () => {
        let player: Player = {
            name: 'John Doe',
            score: 100,
            bonusCount: 3,
            answerState: PlayerState.ANSWERED,
        };
        component.player = player;
        fixture.detectChanges();

        let compiled = fixture.nativeElement;
        expect(compiled.querySelector('h2').textContent).toContain(player.name);
        expect(compiled.querySelector('p:nth-of-type(1)').textContent).toContain(player.score + ' pts');
        expect(compiled.querySelector('p:nth-of-type(2)').textContent).toContain(player.bonusCount);

        player = {
            name: 'Jane Smith',
            score: 150,
            bonusCount: 5,
            answerState: PlayerState.ANSWERED,
        };
        component.player = player;
        fixture.detectChanges();

        compiled = fixture.nativeElement;
        expect(compiled.querySelector('h2').textContent).toContain(player.name);
        expect(compiled.querySelector('p:nth-of-type(1)').textContent).toContain(player.score + ' pts');
        expect(compiled.querySelector('p:nth-of-type(2)').textContent).toContain(player.bonusCount);
    });

    it('should be able to ban the player', () => {
        const name = 'mockName';
        const mockPlayer = { name } as Player;

        component['canBanUser'] = true;
        component['player'] = mockPlayer;
        component.banPlayer();

        expect(chatServiceMock.banUser).toHaveBeenCalledWith(name);
    });

    it('should only ban the player if allowed', () => {
        const name = 'mockName';
        const mockPlayer = { name } as Player;

        component['player'] = mockPlayer;
        component['canBanUser'] = false;
        component.banPlayer();

        expect(chatServiceMock.banUser).not.toHaveBeenCalled();
    });

    it('should properly update the ban icon button', () => {
        chatServiceMock.isUserBanned.and.returnValue(true);
        component['updateIcon']();
        expect(component.iconPath).toEqual(BAN_ICON);

        chatServiceMock.isUserBanned.and.returnValue(false);
        component['updateIcon']();
        expect(component.iconPath).toEqual(NOT_BAN_ICON);
    });
});
