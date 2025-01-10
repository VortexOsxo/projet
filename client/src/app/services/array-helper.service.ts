import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ArrayHelperService {
    swapElement<Type>(array: Type[], index1: number, index2: number): void {
        if (this.isIndexOutsideOfArray(index1, array) || this.isIndexOutsideOfArray(index2, array)) return;
        const temp: Type = array[index1];
        array[index1] = array[index2];
        array[index2] = temp;
    }

    deleteElement<Type>(array: Type[], index: number): void {
        if (this.isIndexOutsideOfArray(index, array)) return;
        array.splice(index, 1);
    }

    private isIndexOutsideOfArray<Type>(index: number, array: Type[]) {
        return index < 0 || index >= array.length;
    }
}
