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


def _client_html(full_name: str, package_label: str, amount: float, currency: str,
                 project_type: str, timeline: str, slide_count: Optional[int]) -> str:
    slide_row = (
        f'<tr><td style="padding:8px 0;color:#666;">Slides</td>'
        f'<td style="padding:8px 0;text-align:right;color:#111;font-weight:600;">{slide_count}</td></tr>'
        if slide_count else ""
    )
    return f"""
<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px;background:#0a0a0a;color:#ffffff;">
          <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-0.02em;">SkiFi Designs</h1>
          <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">Premium Presentation Studio</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#111;">Hi {full_name},</h2>
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
                              files: Optional[list] = None) -> dict:
    """Sends client receipt + admin notification. Non-blocking."""
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
                             project_type, timeline, slide_count),
    }

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
        f'<tr><td style="padding:6px 0;color:#444;font-size:14px;">📄 {f.get("filename","file")}</td>'
        f'<td style="padding:6px 0;text-align:right;color:#888;font-size:12px;">{f.get("size",0)/1024/1024:.2f} MB</td></tr>'
        for f in (files or [])
    ])
    message_block = f"""
    <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:16px;
                font-size:14px;color:#444;line-height:1.6;white-space:pre-wrap;margin:0 0 24px;">
      {message}
    </div>
    """ if message else ""
    return f"""
<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px;background:#0a0a0a;color:#ffffff;">
          <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-0.02em;">SkiFi Designs</h1>
          <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">Your project is ready 🎉</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#111;">Hi {client_name},</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            We've just uploaded your <strong>{project_type}</strong> deliverables. You can download everything from your client dashboard below.
          </p>
          {message_block}
          {('<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:' + BRAND_COLOR + ';font-weight:700;">Delivered Files</p><table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:0 0 24px;">' + file_rows + '</table>') if file_rows else ""}
          <p style="text-align:center;margin:30px 0 6px;">
            <a href="{dashboard_url}" style="display:inline-block;background:{BRAND_COLOR};color:#ffffff;font-weight:600;
                padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px;">
              Open my dashboard →
            </a>
          </p>
          <p style="text-align:center;margin:0 0 24px;font-size:12px;color:#888;">
            Sign in with Google using the same email you used to order.
          </p>
          <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
            Need a revision? Just reply to this email or leave a note in the dashboard. We're here to make it perfect.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
""".strip()


async def send_delivery_email(*, client_email: str, client_name: str,
                              project_type: str, message: str,
                              files: list, dashboard_url: str) -> Optional[str]:
    """Notify a client that their project has been delivered."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set - skipping delivery email")
        return None
    params = {
        "from": f"SkiFi Designs <{SENDER_EMAIL}>",
        "to": [client_email],
        "subject": f"Your {project_type} is ready 🎉 - SkiFi Designs",
        "html": _delivery_html(client_name, project_type, message, files, dashboard_url),
    }
    return await asyncio.to_thread(_send_sync, params)


def _revision_html(client_email: str, project_type: str, message: str, session_id: str) -> str:
    msg_block = (
        f'<blockquote style="border-left:3px solid {BRAND_COLOR};margin:16px 0;'
        f'padding:10px 14px;background:#F4F8FF;border-radius:4px;color:#333;'
        f'white-space:pre-wrap;">{message}</blockquote>'
        if (message or "").strip()
        else "<p><em>The client did not include specific notes.</em></p>"
    )
    return f"""
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0A0A0A;">
      <h2 style="margin:0 0 8px;">Revision requested</h2>
      <p style="color:#555;margin:0 0 18px;">
        <strong>{client_email}</strong> has requested a revision on
        <strong>{project_type}</strong>.
      </p>
      {msg_block}
      <p style="margin:20px 0 0;">Open the Admin panel to upload the revised delivery.</p>
      <p style="font-size:12px;color:#999;margin-top:32px;">Order session: {session_id}</p>
    </div>
    """


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
    return f"""
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0A0A0A;">
      <h2 style="margin:0 0 8px;">Project marked complete ✅</h2>
      <p style="color:#555;margin:0 0 14px;">
        <strong>{client_email}</strong> has marked
        <strong>{project_type}</strong> as completed. No further action needed.
      </p>
      <p style="font-size:12px;color:#999;margin-top:32px;">Order session: {session_id}</p>
    </div>
    """


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
