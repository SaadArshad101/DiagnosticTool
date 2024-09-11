import { FormGroup } from '@angular/forms';

export function MustMatch(firstControlName: string, secondControlName: string) {
    return (formGroup: FormGroup) => {
        const firstControl = formGroup.controls[firstControlName];
        const secondControl = formGroup.controls[secondControlName];

        if (secondControl.errors && !secondControl.errors.mustMatch) {
            return;
        }

        if (firstControl.value !== secondControl.value) {
            secondControl.setErrors({mustMatch: true});
        } else {
            secondControl.setErrors(null);
        }
    };
}
