import { FormGroup } from '@angular/forms';

export function EmailAvailable(controlName: string) {
    return (formGroup: FormGroup) => {
        const emailControl = formGroup.controls[controlName];
        const emailValue = emailControl.value;
        let users = JSON.parse(localStorage.getItem('users'));

        if (emailControl.errors) { return; }

        if (!users) { return; }

        for (let key in users) {
            let user = users[key];
            if (emailValue == user['email']) {
                emailControl.setErrors({ emailNotAvailable: true });
                return;
            }
        }

        emailControl.setErrors(null);
    };
}
