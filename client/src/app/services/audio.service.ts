import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    playSound(soundfileUrl: string) {
        const audio = new Audio();
        audio.src = soundfileUrl;
        audio.load();
        audio.play();
    }
}
