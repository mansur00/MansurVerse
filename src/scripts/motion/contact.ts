// Contact page interactions (I-19 letter repel, I-33 form state machine & blur validation)
// Loaded dynamically only on /contact.
import { initRepel } from './repel';
import { submitContact } from '../contact/submit';
import { isFeatureDisabled } from '../debug/features';

let contactCleanup: (() => void) | null = null;

export function cleanupContactPage(): void {
  if (contactCleanup) {
    contactCleanup();
    contactCleanup = null;
  }
}

export function initContactPage(): void {
  if (typeof document === 'undefined') return;

  const form = document.querySelector<HTMLFormElement>('.contact-form');
  const emailLink = document.querySelector<HTMLElement>('.direct-email-row a, [data-copy]');
  if (!form && !emailLink) return;

  if (form && form.dataset['contactInitialized'] === 'true') {
    return;
  }

  cleanupContactPage();
  if (form) form.dataset['contactInitialized'] = 'true';

  const cleanups: Array<() => void> = [];

  // 1. Email letter repel (I-19)
  if (emailLink && !isFeatureDisabled('repel')) {
    const cancelRepel = initRepel(emailLink, 'repel');
    cleanups.push(cancelRepel);
  }

  // 2. Form state machine & blur validation (I-33)
  if (form && !isFeatureDisabled('form')) {
    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    const messageInput = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const initialSubmitText = submitBtn?.textContent?.trim() || 'Send message';

    const getFieldWrapper = (el: HTMLElement | null) => el?.closest<HTMLElement>('.form-field');

    const showError = (input: HTMLElement, errorText: string) => {
      const wrapper = getFieldWrapper(input);
      if (!wrapper) return;

      wrapper.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');

      const messageId = `${input.id}-message`;
      input.setAttribute('aria-describedby', messageId);

      let msgEl = wrapper.querySelector<HTMLElement>(`#${messageId}`);
      if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = messageId;
        msgEl.className = 'field-message error-message';
        msgEl.setAttribute('role', 'alert');
        wrapper.appendChild(msgEl);
      }
      msgEl.innerHTML = `
        <svg class="message-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5" />
          <path d="M7 4V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="7" cy="10" r="0.75" fill="currentColor" />
        </svg>
        <span class="message-text">${errorText}</span>
      `;
    };

    const clearError = (input: HTMLElement) => {
      const wrapper = getFieldWrapper(input);
      if (!wrapper) return;

      wrapper.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');

      const msgEl = wrapper.querySelector<HTMLElement>(`#${input.id}-message`);
      if (msgEl) {
        msgEl.remove();
      }
    };

    const validateName = () => {
      if (!nameInput) return true;
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Name is required.');
        return false;
      }
      clearError(nameInput);
      return true;
    };

    const validateEmail = () => {
      if (!emailInput) return true;
      const val = emailInput.value.trim();
      if (!val) {
        showError(emailInput, 'Email is required.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        showError(emailInput, 'Please enter a valid email address.');
        return false;
      }
      clearError(emailInput);
      return true;
    };

    const validateMessage = () => {
      if (!messageInput) return true;
      if (!messageInput.value.trim()) {
        showError(messageInput, 'Message is required.');
        return false;
      }
      clearError(messageInput);
      return true;
    };

    nameInput?.addEventListener('blur', validateName);
    emailInput?.addEventListener('blur', validateEmail);
    messageInput?.addEventListener('blur', validateMessage);

    nameInput?.addEventListener('input', () => {
      if (getFieldWrapper(nameInput)?.classList.contains('has-error')) validateName();
    });
    emailInput?.addEventListener('input', () => {
      if (getFieldWrapper(emailInput)?.classList.contains('has-error')) validateEmail();
    });
    messageInput?.addEventListener('input', () => {
      if (getFieldWrapper(messageInput)?.classList.contains('has-error')) validateMessage();
    });

    // Form submit state machine
    const handleSubmit = async (e: Event) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isMessageValid = validateMessage();

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        if (!isNameValid) nameInput?.focus();
        else if (!isEmailValid) emailInput?.focus();
        else messageInput?.focus();
        return;
      }

      // Enter 'sending' state
      form.dataset['formState'] = 'sending';
      form.classList.add('is-sending');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (nameInput) nameInput.disabled = true;
      if (emailInput) emailInput.disabled = true;
      if (messageInput) messageInput.disabled = true;

      // Remove existing feedback if any
      const existingFeedback = form.querySelector('.form-feedback');
      if (existingFeedback) existingFeedback.remove();

      const result = await submitContact({
        name: nameInput?.value || '',
        email: emailInput?.value || '',
        message: messageInput?.value || '',
      });

      if (result.ok) {
        // Enter 'sent' state
        form.dataset['formState'] = 'sent';
        form.classList.remove('is-sending');
        form.classList.add('is-sent');

        if (submitBtn) {
          submitBtn.textContent = 'Sent ✓';
          submitBtn.style.backgroundColor = 'var(--color-accent-blue)';
          submitBtn.style.color = 'var(--palette-black)';
        }

        // Reset after 2200ms per spec I-33
        setTimeout(() => {
          form.reset();
          form.dataset['formState'] = 'idle';
          form.classList.remove('is-sent');

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = initialSubmitText;
            submitBtn.style.backgroundColor = '';
            submitBtn.style.color = '';
          }
          if (nameInput) nameInput.disabled = false;
          if (emailInput) emailInput.disabled = false;
          if (messageInput) messageInput.disabled = false;
        }, 2200);
      } else {
        // Enter 'failed' state
        form.dataset['formState'] = 'failed';
        form.classList.remove('is-sending');
        form.classList.add('is-failed');

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = initialSubmitText;
        }
        if (nameInput) nameInput.disabled = false;
        if (emailInput) emailInput.disabled = false;
        if (messageInput) messageInput.disabled = false;

        const fallbackEmail = form.dataset['fallbackEmail'] || 'mansur@example.com';
        const feedback = document.createElement('div');
        feedback.className = 'form-feedback error-feedback';
        feedback.setAttribute('role', 'alert');
        feedback.tabIndex = -1;
        feedback.innerHTML = `
          <p class="feedback-text">Message could not be sent. Please retry or contact directly.</p>
          <a href="mailto:${fallbackEmail}" class="fallback-link">Send via email client instead</a>
        `;

        const actions = form.querySelector('.form-actions');
        if (actions) {
          form.insertBefore(feedback, actions);
        } else {
          form.appendChild(feedback);
        }

        feedback.focus();
      }
    };

    form.addEventListener('submit', handleSubmit);
    cleanups.push(() => {
      form.removeEventListener('submit', handleSubmit);
    });
  }

  contactCleanup = () => {
    cleanups.forEach((c) => c());
    cleanups.length = 0;
    if (form) delete form.dataset['contactInitialized'];
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', cleanupContactPage);
}
