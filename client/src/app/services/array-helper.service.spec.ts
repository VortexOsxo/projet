import { TestBed } from '@angular/core/testing';

import { ArrayHelperService } from './array-helper.service';

describe('ArrayHelperService', () => {
    let service: ArrayHelperService;

    let testArray: string[];
    let originalArray: string[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ArrayHelperService);
        testArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        originalArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('swapElement test', () => {
        it('should swap the two value', () => {
            const index1 = 3;
            const index2 = 6;

            service.swapElement(testArray, index1, index2);
            expect(originalArray[index1]).toEqual(testArray[index2]);
            expect(originalArray[index2]).toEqual(testArray[index1]);
        });

        it('should not modify the array with invalid input', () => {
            const invalidIndex1 = -1;
            const invalidIndex2 = testArray.length + 1;
            service.swapElement(testArray, invalidIndex1, invalidIndex2);
            expect(originalArray).toEqual(testArray);
        });
    });

    describe('delete element test', () => {
        it('should delete the element', () => {
            const index = 3;

            service.deleteElement(testArray, index);
            expect(testArray.find((element) => element === originalArray[index])).not.toBeDefined();
            expect(testArray.length).toEqual(originalArray.length - 1);
        });

        it('should not modify the array with invalid input', () => {
            const invalidIndex = -1;
            service.deleteElement(testArray, invalidIndex);
            expect(originalArray).toEqual(testArray);
        });
    });
});
