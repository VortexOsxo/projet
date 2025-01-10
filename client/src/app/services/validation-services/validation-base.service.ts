import { Injectable } from '@angular/core';
import { InputValidity } from '@app/interfaces/input-validity';

@Injectable()
export class ValidationBaseService {
    protected createValidInputValidity(): InputValidity {
        return { isValid: true, errorMessage: '' };
    }

    protected createInvalidInputValidity(errorMessage: string): InputValidity {
        return { isValid: false, errorMessage };
    }

    protected validateText(text: string, message: string): InputValidity {
        return text && text.trim() ? this.createValidInputValidity() : this.createInvalidInputValidity(message);
    }

    protected modifyInputValidity(inputValidity: InputValidity, resultingInputValidity: InputValidity): InputValidity {
        if (inputValidity.isValid) return resultingInputValidity;

        resultingInputValidity.errorMessage += inputValidity.errorMessage + '\n';
        resultingInputValidity.isValid = false;
        return resultingInputValidity;
    }
}
