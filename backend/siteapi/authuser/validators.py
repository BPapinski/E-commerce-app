import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(
                _("Hasło musi mieć co najmniej 8 znaków."),
                code='password_too_short',
            )
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("Hasło musi zawierać co najmniej jedną wielką literę."),
                code='password_no_upper',
            )

    def get_help_text(self):
        return _(
            "Hasło musi mieć co najmniej 8 znaków i zawierać co najmniej jedną wielką literę."
        )
