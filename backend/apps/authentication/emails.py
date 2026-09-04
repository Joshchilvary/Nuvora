import logging

from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_verification_email(user, token):
    """Send an email verification code to the user.

    ``token`` is the ``EmailVerificationToken.token`` string that the
    ``VerifyEmailSerializer`` ultimately validates. The email body surfaces
    that value as the "verification code" the user enters in the client,
    matching the existing ``POST /api/auth/verify-email/`` contract.
    """
    recipient = user.email
    name = f"{user.first_name} {user.last_name}".strip() or recipient
    subject = "NUVORA - Verify your email address"
    body = (
        f"Hi {name},\n\n"
        "Please verify your NUVORA email address.\n\n"
        "Enter the following verification code in the NUVORA app to activate"
        " your account:\n\n"
        f"{token}\n\n"
        "This code will expire in 24 hours.\n\n"
        "If you did not register for a NUVORA account, you can safely ignore"
        " this email.\n\n"
        "Thank you,\nThe NUVORA Team"
    )
    send_mail(
        subject=subject,
        message=body,
        from_email=None,
        recipient_list=[recipient],
        fail_silently=False,
    )
    logger.info("Verification email sent to %s", recipient)
