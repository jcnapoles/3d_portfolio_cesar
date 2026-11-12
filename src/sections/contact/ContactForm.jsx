import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import StarGlyph from "@/components/ui/StarGlyph";
import useInViewport from "@/hooks/useInViewport";
import { ANCHORS } from "@/constants/site";
import { t } from "@/i18n";
import SuccessPanel from "./SuccessPanel";
import { HONEYPOT_FIELD, TURNSTILE_TOKEN_FIELD } from '../../../netlify/shared/form-fields.js';

/* ------------------------------------------------------------------------------------------------
 * Backend contract (spec 6.14): moved verbatim from src/components/Contact.jsx.
 * Allowed changes only: the old canvas celebration is gone, SuccessPanel shows the success notification,
 * the generic fallback string, restyled markup, and lazy Turnstile (nearForm).
 * ---------------------------------------------------------------------------------------------- */

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise = null;

/** Loads the Turnstile API once, however many times a component asks for it. */
const loadTurnstileScript = () => {
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      turnstileScriptPromise = null;
      reject(new Error('Failed to load Turnstile'));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

/* ---------------------------------- presentation helpers --------------------------------------- */

const FIELD_IDS = { name: "contact-name", email: "contact-email", message: "contact-message" };

const INPUT =
  "contact-input block w-full rounded-md border border-line-input bg-space-900 px-4 text-body text-ink-1 " +
  "placeholder:text-ink-3 transition-[border-color,background-color] duration-micro ease-ui " +
  "hover:border-ink-3 focus-visible:border-gold";

/** Plain-language message for a field the browser's constraint validation rejected. */
const invalidMessage = (el) => {
  if (el.validity.valueMissing) {
    if (el.name === "name") return t({ en: "Please enter your name.", es: "Escribe tu nombre." });
    if (el.name === "email") return t({ en: "Please enter your email address.", es: "Escribe tu dirección de email." });
    return t({ en: "Please tell me what you need help with.", es: "Cuéntame en qué necesitas ayuda." });
  }
  if (el.validity.typeMismatch) {
    return t({
      en: "Please enter a valid email address, like jane@company.com.",
      es: "Escribe una dirección de email válida, como laura@empresa.com.",
    });
  }
  return el.validationMessage;
};

function Field({ id, label, error, children }) {
  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={id} className="mb-2 text-small font-medium text-ink-1">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-[14px] leading-[1.4] text-danger">
          <CircleAlert size={14} strokeWidth={2} aria-hidden="true" className="mt-[2px] shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

const preventDefault = (e) => e.preventDefault();

/**
 * 10b form card (#contact-form). The SuccessPanel renders over the form inside the same card; the form
 * stays mounted underneath (inert + aria-hidden) so the Turnstile container is never remounted.
 */
export default function ContactForm({ className, onSuccess }) {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    [HONEYPOT_FIELD]: "",
  });

  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    type: '',
    linkText: '',
    linkHref: '',
  });

  // Lazy Turnstile: the script and widget wait until the visitor is within 800 px of the form.
  const nearForm = useInViewport(formRef, { rootMargin: '800px 0px', once: true, attr: false });

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !nearForm) return undefined;

    let widgetId = null;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileRef.current || !window.turnstile) return;

        widgetId = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          // Stay out of the visitor's way unless Cloudflare actually wants them
          // to do something.
          appearance: 'interaction-only',
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        });

        turnstileWidgetId.current = widgetId;
      })
      .catch(() => {
        // Nothing to do here: submitting without a token surfaces the error.
      });

    // StrictMode mounts effects twice in development, so tear the widget down.
    return () => {
      cancelled = true;
      if (widgetId !== null && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
      turnstileWidgetId.current = null;
    };
  }, [nearForm]);

  /** Turnstile tokens are single use, so each attempt needs a fresh one. */
  const resetTurnstile = () => {
    setTurnstileToken('');
    if (turnstileWidgetId.current !== null && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  };

  const buildMailtoLink = () => {
    const toEmail = import.meta.env.VITE_APP_EMAIL_FROM || '';
    const subject = encodeURIComponent(`Portfolio contact from ${form.name || 'visitor'}`);
    const body = encodeURIComponent(
      `Name: ${form.name || ''}\nEmail: ${form.email || ''}\n\nMessage:\n${form.message || ''}`
    );

    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  };

  const getResendErrorMessage = (error) => {
    const details = `${error?.message || ''} ${error?.error || ''}`.toLowerCase();

    if (error?.status === 429) {
      return t({
        en: 'You have already sent a few messages. Please wait a little while before trying again.',
        es: 'Ya has enviado varios mensajes. Espera un poco antes de volver a intentarlo.',
      });
    }

    if (error?.code === 'failed_verification') {
      return t({
        en: 'We could not verify your submission. Please try sending it again.',
        es: 'No hemos podido verificar el envío. Prueba a enviarlo de nuevo.',
      });
    }

    if (error?.status === 403) {
      return t({
        en: 'This submission was blocked. Please send your message from your email app instead.',
        es: 'Se ha bloqueado el envío. Envía tu mensaje desde tu aplicación de correo.',
      });
    }

    if (details.includes('missing environment variables')) {
      return t({
        en: 'Contact form is not configured yet. Please try again later or use the email app button.',
        es: 'El formulario aún no está configurado. Inténtalo más tarde o usa el botón de la aplicación de correo.',
      });
    }

    if (error?.status >= 500) {
      return t({
        en: 'Email service is temporarily unavailable. You can send the message directly from your email app.',
        es: 'El servicio de email no está disponible ahora mismo. Puedes enviar el mensaje directamente desde tu aplicación de correo.',
      });
    }

    return t({ en: 'Something went wrong. Please try again.', es: 'Algo ha fallado. Inténtalo de nuevo.' });
  };

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setNotification({ message: t({ en: 'Please fill in all fields.', es: 'Rellena todos los campos.' }), type: 'error', linkText: '', linkHref: '' });
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setNotification({
        message: t({
          en: 'Still checking you are human. Please try again in a moment.',
          es: 'Aún estamos comprobando que eres humano. Inténtalo de nuevo en un momento.',
        }),
        type: 'error',
        linkText: '',
        linkHref: '',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          [HONEYPOT_FIELD]: form[HONEYPOT_FIELD],
          [TURNSTILE_TOKEN_FIELD]: turnstileToken,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw { status: response.status, ...result };
      }

      setNotification({
        message: t({
          en: 'Thank you. I will get back to you as soon as possible.',
          es: 'Gracias. Te responderé lo antes posible.',
        }),
        type: 'success',
        linkText: '',
        linkHref: '',
      });
      setForm({
        name: '',
        email: '',
        message: '',
        [HONEYPOT_FIELD]: '',
      });
    } catch (error) {
      console.error(error);
      setNotification({
        message: getResendErrorMessage(error),
        type: 'error',
        linkText: t({ en: 'Open email app', es: 'Abrir app de correo' }),
        linkHref: buildMailtoLink(),
      });
    } finally {
      setLoading(false);
      resetTurnstile();
    }
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '', linkText: '', linkHref: '' });
  };

  /* ------------------------------- presentation state (new) ------------------------------------ */

  const success = notification.type === 'success';
  const nameRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const firstInvalidRef = useRef(null);
  const refocusNameRef = useRef(false);

  // Native constraint validation (required, type=email) still guards the submit; we only replace the
  // browser bubble with an inline message linked through aria-describedby, then focus the first bad field.
  const handleInvalid = (e) => {
    e.preventDefault();
    const el = e.target;
    if (!firstInvalidRef.current) firstInvalidRef.current = el.name;
    setFieldErrors((prev) => ({ ...prev, [el.name]: invalidMessage(el) }));
  };

  useEffect(() => {
    const name = firstInvalidRef.current;
    if (!name) return;
    firstInvalidRef.current = null;
    document.getElementById(FIELD_IDS[name])?.focus();
  }, [fieldErrors]);

  const handleFieldChange = (e) => {
    handleChange(e);
    const el = e.target;
    if (fieldErrors[el.name] && el.validity.valid) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[el.name];
        return next;
      });
    }
  };

  // The diamond-ring flare on the eclipse.
  useEffect(() => {
    if (success) onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  // "Send another message": close the panel, then put the visitor back in the Name field.
  const sendAnother = () => {
    refocusNameRef.current = true;
    closeNotification();
  };
  useEffect(() => {
    if (!success && refocusNameRef.current) {
      refocusNameRef.current = false;
      nameRef.current?.focus({ preventScroll: true });
    }
  }, [success]);

  const errorProps = (name) =>
    fieldErrors[name]
      ? { "aria-invalid": true, "aria-describedby": `${FIELD_IDS[name]}-error` }
      : {};

  const showError = notification.message && notification.type !== 'success';

  return (
    <Reveal
      id={ANCHORS.contactForm}
      className={cn("card-k1 relative isolate scroll-mt-2 rounded-xl p-8 lg:p-10", className)}
    >
      <div inert={success ? "" : undefined} aria-hidden={success ? true : undefined}>
        <h3 className="text-h3 text-ink-1">{t({ en: "Tell me what you're building", es: "Cuéntame qué estás construyendo" })}</h3>
        <p className="mt-3 max-w-[48ch] text-body text-ink-2">
          {t({
            en: "Prefer writing to talking? Send a few lines and I'll reply by email.",
            es: "¿Prefieres escribir a hablar? Mándame unas líneas y te responderé por email.",
          })}
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6 lg:mt-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id={FIELD_IDS.name} label={t({ en: "Name", es: "Nombre" })} error={fieldErrors.name}>
              <input
                ref={nameRef}
                id={FIELD_IDS.name}
                type="text"
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                onInvalid={handleInvalid}
                placeholder={t({ en: "Jane Doe", es: "Laura García" })}
                autoComplete="name"
                required
                {...errorProps("name")}
                className={cn(INPUT, "h-[52px]", fieldErrors.name && "border-danger hover:border-danger")}
              />
            </Field>
            <Field id={FIELD_IDS.email} label="Email" error={fieldErrors.email}>
              <input
                id={FIELD_IDS.email}
                type="email"
                name="email"
                value={form.email}
                onChange={handleFieldChange}
                onInvalid={handleInvalid}
                placeholder={t({ en: "jane@company.com", es: "laura@empresa.com" })}
                autoComplete="email"
                spellCheck={false}
                required
                {...errorProps("email")}
                className={cn(INPUT, "h-[52px]", fieldErrors.email && "border-danger hover:border-danger")}
              />
            </Field>
          </div>

          <Field id={FIELD_IDS.message} label={t({ en: "What do you need help with?", es: "¿En qué necesitas ayuda?" })} error={fieldErrors.message}>
            <textarea
              id={FIELD_IDS.message}
              rows={5}
              name="message"
              value={form.message}
              onChange={handleFieldChange}
              onInvalid={handleInvalid}
              placeholder={t({
                en: "Your product, your team, and the problem you want solved.",
                es: "Tu producto, tu equipo y el problema que quieres resolver.",
              })}
              required
              {...errorProps("message")}
              className={cn(
                INPUT,
                "min-h-[160px] resize-y py-3.5",
                fieldErrors.message && "border-danger hover:border-danger"
              )}
            />
          </Field>

          {/*
            Honeypot. Sits off-screen and out of the tab order, so a real
            visitor never sees it. Bots fill every input they find, and the API
            silently discards any submission that arrives with this field set.
          */}
          <div
            aria-hidden='true'
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            <label htmlFor={HONEYPOT_FIELD}>{t({ en: "Leave this field empty", es: "Deja este campo vacío" })}</label>
            <input
              type='text'
              id={HONEYPOT_FIELD}
              name={HONEYPOT_FIELD}
              value={form[HONEYPOT_FIELD]}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete='off'
            />
          </div>

          {showError ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-danger/40 bg-danger/[.06] py-3 pl-4 pr-2 text-small text-danger"
            >
              <CircleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
              <p className="min-w-0 flex-1 py-0.5">
                {notification.message}
                {notification.linkHref && (
                  <>
                    {" "}
                    <a
                      href={notification.linkHref}
                      className="font-semibold text-danger underline decoration-1 underline-offset-[.2em] hover:decoration-2"
                    >
                      {notification.linkText}
                    </a>
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={closeNotification}
                aria-label={t({ en: "Dismiss", es: "Cerrar" })}
                className="-my-1 grid size-8 shrink-0 place-items-center rounded-sm text-danger/80 transition-colors duration-micro ease-ui hover:bg-danger/10 hover:text-danger coarse:size-11"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {/*
            Turnstile mounts into the div below. With appearance
            'interaction-only' it renders an empty, zero-height element unless
            the visitor genuinely has to solve something.

            It shares a gapless wrapper with the submit button on purpose: as a
            direct child of the form it would claim a full gap slot even while
            invisible, pushing the button down for everyone.
          */}
          <div className="flex flex-col items-stretch sm:items-start">
            {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={loading ? "none" : "arrow"}
              cursorLock
              aria-disabled={loading || undefined}
              onClick={loading ? preventDefault : undefined}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <StarGlyph size={14} className="motion-ok:animate-[spin_1.2s_linear_infinite]" />
                  {t({ en: "Sending…", es: "Enviando…" })}
                </span>
              ) : (
                t({ en: "Send message", es: "Enviar mensaje" })
              )}
            </Button>
          </div>

          <p className="text-small text-ink-3">
            {t({
              en: "Your details are used only to reply to your message.",
              es: "Tus datos solo se usan para responder a tu mensaje.",
            })}
          </p>
        </form>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {success
          ? t({ en: "Thanks, your message is in. I'll reply by email.", es: "Gracias, he recibido tu mensaje. Te responderé por email." })
          : ""}
      </p>

      <AnimatePresence>{success ? <SuccessPanel key="success" onReset={sendAnother} /> : null}</AnimatePresence>
    </Reveal>
  );
}
