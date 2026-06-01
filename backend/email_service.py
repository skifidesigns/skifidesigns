"""Email service for SkiFi Designs - sends client receipt + admin notification via Resend."""
import os
import asyncio
import logging
from typing import Optional

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


BRAND_COLOR = "#2A7AFE"
BRAND_DARK = "#0A0F1E"
BRAND_OFFWHITE = "#F5F4EE"
BRAND_BORDER = "#ECEAE2"
LOGO_URL = "https://customer-assets.emergentagent.com/job_presentation-studio-22/artifacts/7h3c6nvn_skifi%20insta%20logo%202.png"
NOHEMI_URL = "https://skifidesigns.com/api/assets/nohemi-semibold.woff"
TRUSTPILOT_BCC = os.environ.get("TRUSTPILOT_BCC", "")

# Match the website: Outfit for body, Nohemi for headings. Gmail strips
# @font-face but Apple Mail / Yahoo / native mail clients honour it. The
# stack falls back gracefully to system fonts everywhere else.
_EMAIL_FONT_STACK = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
_HEADING_FONT_STACK = "'Nohemi', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

# Inlined <head> webfonts. Goes in every transactional email so Apple Mail
# (and any other @font-face-supporting client) gets the real brand fonts.
_EMAIL_FONT_HEAD = f"""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  @font-face {{
    font-family: 'Nohemi';
    src: url('{NOHEMI_URL}') format('woff');
    font-weight: 600; font-style: normal; font-display: swap;
  }}
</style>
"""


def _email_header(tagline: str) -> str:
    """Branded dark hero with the SkiFi logo, used at the top of every email."""
    return f"""
    <tr><td style="padding:0;background:{BRAND_DARK};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:28px 40px 30px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:14px;">
                  <img src="{LOGO_URL}" width="48" height="48" alt="SkiFi Designs"
                       style="display:block;border:0;outline:none;text-decoration:none;width:48px;height:48px;" />
                </td>
                <td valign="middle">
                  <div style="font-family:{_HEADING_FONT_STACK};font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;line-height:1.1;">SkiFi Designs</div>
                  <div style="font-family:{_EMAIL_FONT_STACK};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-top:4px;">{tagline}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
    """


def _email_footer() -> str:
    """Branded legal footer with SKIFI GROUP LLC details."""
    return f"""
    <tr><td style="padding:24px 40px 28px;background:#FAFAF7;border-top:1px solid {BRAND_BORDER};
                   font-family:{_EMAIL_FONT_STACK};font-size:11px;color:#7a7a7a;line-height:1.6;text-align:center;">
      <div style="font-family:{_HEADING_FONT_STACK};color:#0A0A0A;font-weight:600;letter-spacing:-0.005em;font-size:12.5px;margin-bottom:4px;">SKIFI GROUP LLC</div>
      <div>30 N Gould St Ste R &middot; Sheridan, WY 82801 &middot; United States</div>
      <div style="margin-top:6px;">
        <a href="mailto:contact@skifidesigns.com" style="color:#0A0A0A;text-decoration:none;font-weight:500;">contact@skifidesigns.com</a>
        &nbsp;&middot;&nbsp;
        <a href="https://skifidesigns.com" style="color:{BRAND_COLOR};text-decoration:none;font-weight:500;">skifidesigns.com</a>
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid {BRAND_BORDER};font-size:10.5px;color:#9C9A8E;">
        &copy; SKIFI GROUP LLC &middot; All rights reserved.
      </div>
    </td></tr>
    """


def _client_html(full_name: str, package_label: str, amount: float, currency: str,
                 project_type: str, timeline: str, slide_count: Optional[int],
                 has_receipt: bool = False) -> str:
    slide_row = (
        f'<tr><td style="padding:8px 0;color:#666;">Slides</td>'
        f'<td style="padding:8px 0;text-align:right;color:#111;font-weight:600;">{slide_count}</td></tr>'
        if slide_count else ""
    )
    receipt_line = (
        '<p style="margin:0 0 8px;font-size:15px;color:#555;line-height:1.6;">'
        '<strong style="color:#111;">📎 Your PDF receipt is attached to this email</strong> - '
        'keep it for your records or reimbursement.'
        '</p>'
        if has_receipt else ''
    )
    return f"""
<!doctype html>
<html><head>{_EMAIL_FONT_HEAD}</head><body style="margin:0;padding:0;background:#f5f5f7;font-family:{_EMAIL_FONT_STACK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px;background:#0a0a0a;color:#ffffff;">
          <h1 style="margin:0;font-family:{_HEADING_FONT_STACK};font-size:24px;font-weight:600;letter-spacing:-0.02em;">SkiFi Designs</h1>
          <p style="margin:8px 0 0;font-family:{_EMAIL_FONT_STACK};font-size:14px;color:rgba(255,255,255,0.7);">Premium Presentation Studio</p>
        </td></tr>
        <tr><td style="padding:40px;font-family:{_EMAIL_FONT_STACK};">
          <h2 style="margin:0 0 12px;font-family:{_HEADING_FONT_STACK};font-size:22px;color:#111;font-weight:600;letter-spacing:-0.01em;">Hi {full_name},</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            Thanks for choosing SkiFi Designs. We've received your payment and your project is officially in the queue.
            Our team will reach out within <strong>24 hours</strong> to kick things off.
          </p>
          <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:{BRAND_COLOR};font-weight:700;">Order Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:8px 0;color:#666;">Plan</td><td style="padding:8px 0;text-align:right;color:#111;font-weight:600;">{package_label}</td></tr>
              {slide_row}
              <tr><td style="padding:8px 0;color:#666;">Project type</td><td style="padding:8px 0;text-align:right;color:#111;font-weight:600;">{project_type}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Timeline</td><td style="padding:8px 0;text-align:right;color:#111;font-weight:600;">{timeline}</td></tr>
              <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:12px;"></td></tr>
              <tr><td style="padding:8px 0;color:#111;font-weight:600;">Total paid</td>
                  <td style="padding:8px 0;text-align:right;color:{BRAND_COLOR};font-weight:700;font-size:18px;">${amount:.2f} {currency.upper()}</td></tr>
            </table>
          </div>
          {receipt_line}
          <p style="margin:0 0 8px;font-size:15px;color:#555;line-height:1.6;">
            <strong style="color:#111;">What's next?</strong>
          </p>
          <ol style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#555;line-height:1.8;">
            <li>Our team will email you with a project brief & onboarding form.</li>
            <li>We'll set up a quick kickoff call to align on goals.</li>
            <li>First drafts delivered within your selected timeline.</li>
          </ol>
          <p style="margin:0;font-size:14px;color:#555;">
            Questions? Reply to this email or WhatsApp us on <a href="https://wa.me/917827087878" style="color:{BRAND_COLOR};text-decoration:none;">+91 78270 87878</a>.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#999;">
            SKIFI GROUP LLC · 30 N Gould St Ste R, Sheridan, WY 82801 · United States
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
""".strip()


def _admin_html(full_name: str, email: str, company: str, package_label: str,
                amount: float, currency: str, project_type: str, timeline: str,
                slide_count: Optional[int], description: str) -> str:
    slide_row = (
        f'<tr><td style="padding:6px 0;color:#666;">Slides</td>'
        f'<td style="padding:6px 0;text-align:right;color:#111;font-weight:600;">{slide_count}</td></tr>'
        if slide_count else ""
    )
    return f"""
<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="padding:24px 32px;background:{BRAND_COLOR};color:#ffffff;">
          <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.85;">New Order</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:600;">${amount:.2f} {currency.upper()} · {package_label}</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:{BRAND_COLOR};font-weight:700;">Client</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;color:#666;width:40%;">Name</td><td style="padding:6px 0;color:#111;font-weight:600;">{full_name}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;color:#111;font-weight:600;"><a href="mailto:{email}" style="color:{BRAND_COLOR};text-decoration:none;">{email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Company</td><td style="padding:6px 0;color:#111;font-weight:600;">{company or '-'}</td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:{BRAND_COLOR};font-weight:700;">Project</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;color:#666;width:40%;">Type</td><td style="padding:6px 0;text-align:right;color:#111;font-weight:600;">{project_type}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Timeline</td><td style="padding:6px 0;text-align:right;color:#111;font-weight:600;">{timeline}</td></tr>
            {slide_row}
          </table>

          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:{BRAND_COLOR};font-weight:700;">Description</p>
          <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:16px;font-size:14px;color:#444;line-height:1.6;white-space:pre-wrap;">{description}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
""".strip()


def _send_sync(params: dict) -> Optional[str]:
    try:
        result = resend.Emails.send(params)
        return result.get("id") if isinstance(result, dict) else None
    except Exception as e:
        logger.error(f"Resend send failed: {e}")
        return None


async def send_payment_emails(*, full_name: str, email: str, company: Optional[str],
                              package_id: str, amount: float, currency: str,
                              project_type: str, timeline: str,
                              slide_count: Optional[int], description: str,
                              files: Optional[list] = None,
                              receipt_pdf_b64: Optional[str] = None,
                              receipt_filename: str = "SkiFi-Designs-Receipt.pdf") -> dict:
    """Sends client receipt + admin notification. Non-blocking.

    If `receipt_pdf_b64` is provided, attaches the branded PDF receipt to the
    client email so they have an offline copy for reimbursement.
    """
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set - skipping emails")
        return {"client": None, "admin": None, "skipped": True}

    package_label = "Per Slide" if package_id == "per_slide" else "Monthly Retainer"
    files = files or []
    if files:
        description = description + "\n\n📎 Client attached " + str(len(files)) + " file(s): " + \
            ", ".join(f.get("filename", "file") for f in files) + \
            "\n→ Download from Admin Panel → Orders."

    client_params = {
        "from": f"SkiFi Designs <{SENDER_EMAIL}>",
        "to": [email],
        "subject": f"Your SkiFi Designs order - {package_label}",
        "html": _client_html(full_name, package_label, amount, currency,
                             project_type, timeline, slide_count,
                             has_receipt=bool(receipt_pdf_b64)),
    }
    if receipt_pdf_b64:
        client_params["attachments"] = [{
            "filename": receipt_filename,
            "content": receipt_pdf_b64,
            "content_type": "application/pdf",
        }]

    tasks = [asyncio.to_thread(_send_sync, client_params)]
    if ADMIN_EMAIL:
        admin_params = {
            "from": f"SkiFi Orders <{SENDER_EMAIL}>",
            "to": [ADMIN_EMAIL],
            "subject": f"[New Order] ${amount:.2f} {currency.upper()} - {full_name} · {package_label}",
            "html": _admin_html(full_name, email, company or "", package_label,
                                amount, currency, project_type, timeline,
                                slide_count, description),
            "reply_to": email,
        }
        tasks.append(asyncio.to_thread(_send_sync, admin_params))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    client_id = results[0] if not isinstance(results[0], Exception) else None
    admin_id = results[1] if len(results) > 1 and not isinstance(results[1], Exception) else None
    return {"client": client_id, "admin": admin_id, "skipped": False}



def _delivery_html(client_name: str, project_type: str, message: str,
                   files: list, dashboard_url: str) -> str:
    file_rows = "".join([
        f'''<tr>
            <td style="padding:10px 14px;border-bottom:1px solid {BRAND_BORDER};font-family:{_EMAIL_FONT_STACK};font-size:13px;color:#0A0A0A;font-weight:500;vertical-align:middle;">
              <span style="display:inline-block;width:8px;height:8px;background:{BRAND_COLOR};border-radius:50%;margin-right:12px;vertical-align:middle;"></span>
              {f.get("filename","file")}
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid {BRAND_BORDER};text-align:right;font-family:{_EMAIL_FONT_STACK};font-size:12px;color:#9C9A8E;vertical-align:middle;white-space:nowrap;">
              {f.get("size",0)/1024/1024:.2f} MB
            </td>
          </tr>'''
        for f in (files or [])
    ])
    files_block = f"""
      <p style="margin:0 0 10px;font-family:{_EMAIL_FONT_STACK};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9C9A8E;font-weight:600;">Delivered files</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAFAF7;border:1px solid {BRAND_BORDER};border-radius:12px;margin:0 0 28px;">
        {file_rows}
      </table>
    """ if file_rows else ""

    message_block = f"""
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAFAF7;border-left:3px solid {BRAND_COLOR};border-radius:8px;margin:0 0 24px;">
        <tr><td style="padding:14px 18px;font-family:{_EMAIL_FONT_STACK};font-size:13.5px;color:#444;line-height:1.6;white-space:pre-wrap;">
          {message}
        </td></tr>
      </table>
    """ if message else ""

    return f"""
<!doctype html>
<html><head>{_EMAIL_FONT_HEAD}</head><body style="margin:0;padding:0;background:{BRAND_OFFWHITE};font-family:{_EMAIL_FONT_STACK};">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">Your {project_type} is ready - open your dashboard to download.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BRAND_OFFWHITE};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:18px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 12px 40px -16px rgba(10,10,10,0.12);">

        {_email_header("Project delivery")}

        <tr><td style="padding:36px 40px 8px;">
          <h2 style="margin:0 0 8px;font-family:{_HEADING_FONT_STACK};font-size:28px;font-weight:600;letter-spacing:-0.02em;color:#0A0A0A;line-height:1.2;">Your project is ready.</h2>
          <p style="margin:0 0 26px;font-family:{_EMAIL_FONT_STACK};font-size:14px;color:#6b6b6b;line-height:1.6;">
            Hi {client_name}, we've just uploaded your <strong style="color:#0A0A0A;font-weight:600;">{project_type}</strong> deliverables. Everything is waiting for you in the client dashboard.
          </p>

          {message_block}
          {files_block}

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 6px;">
            <tr><td align="center" style="border-radius:12px;background:{BRAND_COLOR};">
              <a href="{dashboard_url}" style="display:inline-block;padding:14px 30px;font-family:{_EMAIL_FONT_STACK};font-size:14.5px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.01em;">
                Open my dashboard &rarr;
              </a>
            </td></tr>
          </table>
          <p style="text-align:center;margin:14px 0 28px;font-family:{_EMAIL_FONT_STACK};font-size:11.5px;color:#9C9A8E;">
            Sign in with Google using the same email you used to order.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%);border:1px solid #BFDBFE;border-radius:12px;margin:0 0 8px;">
            <tr><td style="padding:14px 18px;font-family:{_EMAIL_FONT_STACK};font-size:12.5px;color:#1E3A8A;line-height:1.55;">
              <strong style="color:#0A0A0A;font-weight:600;">Need a tweak?</strong>
              Reply to this email or request a revision from your dashboard &mdash; we'll make it perfect.
            </td></tr>
          </table>
        </td></tr>

        {_email_footer()}
      </table>
    </td></tr>
  </table>
</body></html>
""".strip()


async def send_delivery_email(*, client_email: str, client_name: str,
                              project_type: str, message: str,
                              files: list, dashboard_url: str) -> Optional[str]:
    """Notify a client that their project has been delivered.

    BCCs Trustpilot's unique invite address so they auto-send the client a
    review invitation right after the delivery email lands (timing: client
    is at peak satisfaction, ready to give a 5-star).
    """
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set - skipping delivery email")
        return None
    params = {
        "from": f"SkiFi Designs <{SENDER_EMAIL}>",
        "to": [client_email],
        "subject": f"Your {project_type} is ready 🎉 - SkiFi Designs",
        "html": _delivery_html(client_name, project_type, message, files, dashboard_url),
    }
    if TRUSTPILOT_BCC:
        params["bcc"] = [TRUSTPILOT_BCC]
    return await asyncio.to_thread(_send_sync, params)


def _admin_alert_shell(*, tagline: str, headline: str, intro: str,
                       body_html: str, session_id: str,
                       cta_label: Optional[str] = None,
                       cta_url: Optional[str] = None) -> str:
    """Shared shell for admin-facing transactional notifications
    (revision request, project completion, etc.). Uses the same branded
    header/footer as client emails so every touchpoint feels consistent.
    """
    cta_block = ""
    if cta_label and cta_url:
        cta_block = f"""
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 6px;">
            <tr><td align="center" style="border-radius:12px;background:{BRAND_COLOR};">
              <a href="{cta_url}" style="display:inline-block;padding:12px 24px;font-family:{_EMAIL_FONT_STACK};font-size:13.5px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.01em;">
                {cta_label} &rarr;
              </a>
            </td></tr>
          </table>
        """
    return f"""
<!doctype html>
<html><head>{_EMAIL_FONT_HEAD}</head><body style="margin:0;padding:0;background:{BRAND_OFFWHITE};font-family:{_EMAIL_FONT_STACK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BRAND_OFFWHITE};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:18px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 12px 40px -16px rgba(10,10,10,0.12);">

        {_email_header(tagline)}

        <tr><td style="padding:32px 40px 12px;">
          <h2 style="margin:0 0 8px;font-family:{_HEADING_FONT_STACK};font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#0A0A0A;line-height:1.25;">{headline}</h2>
          <p style="margin:0 0 22px;font-family:{_EMAIL_FONT_STACK};font-size:14px;color:#555;line-height:1.6;">{intro}</p>

          {body_html}
          {cta_block}

          <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid {BRAND_BORDER};font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:#9C9A8E;letter-spacing:0.02em;">
            Order session &nbsp; <span style="color:#555;">{session_id}</span>
          </p>
        </td></tr>

        {_email_footer()}
      </table>
    </td></tr>
  </table>
</body></html>
""".strip()


def _revision_html(client_email: str, project_type: str, message: str, session_id: str) -> str:
    if (message or "").strip():
        body = f"""
          <p style="margin:0 0 8px;font-family:{_EMAIL_FONT_STACK};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9C9A8E;font-weight:600;">Client notes</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F8FF;border-left:3px solid {BRAND_COLOR};border-radius:8px;margin:0 0 6px;">
            <tr><td style="padding:14px 18px;font-family:{_EMAIL_FONT_STACK};font-size:13.5px;color:#333;line-height:1.6;white-space:pre-wrap;">{message}</td></tr>
          </table>
        """
    else:
        body = f'<p style="margin:0;font-family:{_EMAIL_FONT_STACK};font-size:13px;color:#9C9A8E;font-style:italic;">The client did not include specific notes.</p>'

    return _admin_alert_shell(
        tagline="Revision requested",
        headline="A revision was requested.",
        intro=f"<strong style=\"color:#0A0A0A;font-weight:600;\">{client_email}</strong> has requested a revision on <strong style=\"color:#0A0A0A;font-weight:600;\">{project_type}</strong>. Open the admin panel to upload the revised delivery.",
        body_html=body,
        session_id=session_id,
        cta_label="Open admin panel",
        cta_url="https://skifidesigns.com/admin",
    )


async def send_revision_request_email(*, client_email: str, project_type: str,
                                       message: str, session_id: str) -> Optional[str]:
    """Notify the admin that a client has requested a revision."""
    if not RESEND_API_KEY or not ADMIN_EMAIL:
        logger.warning("RESEND_API_KEY or ADMIN_EMAIL not set - skipping revision email")
        return None
    params = {
        "from": f"SkiFi Designs <{SENDER_EMAIL}>",
        "to": [ADMIN_EMAIL],
        "reply_to": client_email,
        "subject": f"🔁 Revision requested - {project_type}",
        "html": _revision_html(client_email, project_type, message, session_id),
    }
    return await asyncio.to_thread(_send_sync, params)


def _completed_html(client_email: str, project_type: str, session_id: str) -> str:
    body = f"""
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ECFDF5;border:1px solid #BBF7D0;border-radius:12px;margin:0 0 6px;">
        <tr><td style="padding:14px 18px;font-family:{_EMAIL_FONT_STACK};font-size:13px;color:#065F46;line-height:1.55;">
          <span style="display:inline-block;width:22px;height:22px;background:#10B981;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:12px;margin-right:10px;vertical-align:middle;font-weight:600;">&#10003;</span>
          <strong style="color:#0A0A0A;font-weight:600;">All done.</strong> &nbsp;No further action needed on this order.
        </td></tr>
      </table>
    """
    return _admin_alert_shell(
        tagline="Order completed",
        headline="Project marked complete.",
        intro=f"<strong style=\"color:#0A0A0A;font-weight:600;\">{client_email}</strong> has marked <strong style=\"color:#0A0A0A;font-weight:600;\">{project_type}</strong> as completed.",
        body_html=body,
        session_id=session_id,
    )


async def send_order_completed_email(*, client_email: str, project_type: str,
                                      session_id: str) -> Optional[str]:
    if not RESEND_API_KEY or not ADMIN_EMAIL:
        return None
    params = {
        "from": f"SkiFi Designs <{SENDER_EMAIL}>",
        "to": [ADMIN_EMAIL],
        "reply_to": client_email,
        "subject": f"✅ Project completed - {project_type}",
        "html": _completed_html(client_email, project_type, session_id),
    }
    return await asyncio.to_thread(_send_sync, params)
