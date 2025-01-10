import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should play panic sound', () => {
        const mockUrl = 'fakeFile.mp3';
        const audioPlaySpy = jasmine.createSpyObj('HTMLAudioElement', ['play', 'load']);
        spyOn(window, 'Audio').and.returnValue(audioPlaySpy);

        document.body.dispatchEvent(new Event('click'));

        service.playSound(mockUrl);

        expect(window.Audio).toHaveBeenCalled();
        expect(audioPlaySpy.load).toHaveBeenCalled();
        expect(audioPlaySpy.play).toHaveBeenCalled();
    });
});
