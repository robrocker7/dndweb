from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate


class PasswordResetForm(forms.Form):
    email = forms.CharField()

    def save(self):
        email = self.cleaned_data.get('email')
        url = '{0}/session/password-reset/'.format(settings.AUTH_REMOTE_API_URL)
        response = requests.post(url, data={'email': email})
        if response.status_code != 200:
            print(response.text)
            return
        response_json = response.json()
        token = response_json['token']
        send_password_reset_email(email, token)


class SetPasswordForm(forms.Form):
    error_messages = {
        'password_mismatch': 'The two password fields didn’t match.',
    }
    new_password1 = forms.CharField(
        label="New password",
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        strip=False,
        help_text=password_validation.password_validators_help_text_html(),
    )
    new_password2 = forms.CharField(
        label="New password confirmation",
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
    )


    def clean(self):
        super().clean()
        password1 = self.cleaned_data.get('new_password1')
        password2 = self.cleaned_data.get('new_password2')
        if password1 and password2:
            if password1 != password2:
                self.add_error('new_password1', 'The two passwords fields do not match.')
                self.add_error('new_password2', 'The two passwords fields do not match.')

    def save(self):
        password = self.cleaned_data.get('new_password2')
        self.request.user.set_password(password)
        self.request.user.save()
        return True


class ScoperLoginForm(AuthenticationForm):
    def confirm_login_allowed(self, user):
        super(ScoperLoginForm, self).confirm_login_allowed(user)
        # try:
        #     ScopeAuthorization.run_validation(self.request, user)
        # except PortalSFDCNoRecords:
        #     raise forms.ValidationError('Unable to locate SFDC record with your Email.')
        # except PortalActiveContactRequired:
        #     raise forms.ValidationError('Multiple accounts detected.')
        # except Exception as e:
        #     import traceback
        #     traceback.print_exc()
        #     raise forms.ValidationError('Error validating record with salesforce.')

    def clean(self):
        if not AuthAvailability.is_available() and not settings.SKIP_AUTH_GATEWAY_CHECK:
             raise ValidationError('Authentication Gateway is down.')

        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if email is not None and password:
            try:
                self.user_cache = authenticate(
                    self.request, username=email, password=password)
            except (ScoperSFDCAuthorizationException, ScoperAuthorizationException) as e:

                raise ValidationError(
                    e.message,
                    code=e.code
                )
            if self.user_cache is None:
                raise self.get_invalid_login_error()
            else:
                self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data