// SectionKit
// Shared behaviour for the sections (see docs/SectionsSpec.md): tap-to-copy words.
// Runs as a plain <script> or through new Function(code)(); a second run in the same document does nothing.
(() => {
  const KIT_FLAG = 'sectionKit';
  const COPIED_LABEL = '복사했어요';
  const COPY_FAILED_LABEL = '복사하지 못했어요';
  const COPIED_MS = 1600;
  const root = document.documentElement;

  if (root.dataset[KIT_FLAG] === 'ready') {
    return;
  }

  root.dataset[KIT_FLAG] = 'ready';

  // Per button: its original child nodes and the pending restore timer, so a second tap keeps the original.
  const copyStates = new WeakMap();

  // A button's aria-label hides its changed text from screen readers, so one shared live region
  // announces the copy. It sits at the end of <body>, outside every section. It is made when the kit
  // starts (a live region added at the moment of the change often misses that first change),
  // and made again on the next copy if something removed it.
  const getAnnouncer = () => {
    const existing = document.querySelector('[data-kit-announcer]');

    if (existing) {
      return existing;
    }

    const announcer = document.createElement('div');

    announcer.className = 'visually-hidden';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('data-kit-announcer', '');
    document.body.appendChild(announcer);

    return announcer;
  };

  // Clear first so repeating the same words is announced again.
  const announce = (message) => {
    const announcer = getAnnouncer();

    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  };

  // Old browsers and non-secure pages: copy through a temporary, off-screen textarea.
  // Returns whether the browser says it copied; execCommand may also throw or be missing.
  const copyWithTextarea = (text) => {
    const textarea = document.createElement('textarea');
    const activeElement = document.activeElement;

    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    // 16px keeps iOS from zooming in when the textarea is selected.
    textarea.style.fontSize = '16px';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      // iOS selects nothing with select() alone on a readonly field.
      textarea.setSelectionRange(0, text.length);

      return document.execCommand('copy') === true;
    } catch {
      return false;
    } finally {
      textarea.remove();

      if (activeElement instanceof HTMLElement) {
        activeElement.focus();
      }
    }
  };

  // Resolves to whether the text reached the clipboard: the clipboard API first, the textarea if it fails.
  const writeClipboard = async (text) => {
    const clipboard = navigator.clipboard;

    if (clipboard && typeof clipboard.writeText === 'function') {
      try {
        await clipboard.writeText(text);

        return true;
      } catch {
        return copyWithTextarea(text);
      }
    }

    return copyWithTextarea(text);
  };

  // Shows the result in place of the button's words for a moment, then puts the words back.
  const showFeedback = (button, label) => {
    const saved = copyStates.get(button);
    const originalNodes = saved ? saved.nodes : [...button.childNodes];

    if (saved) {
      clearTimeout(saved.timer);
    }

    button.textContent = label;
    announce(label);

    const timer = setTimeout(() => {
      // Not replaceChildren: iOS 13 does not have it.
      button.textContent = '';
      button.append(...originalNodes);
      copyStates.delete(button);
    }, COPIED_MS);

    copyStates.set(button, { nodes: originalNodes, timer });
  };

  const copyFrom = async (button, text) => {
    const isCopied = await writeClipboard(text);

    showFeedback(button, isCopied ? COPIED_LABEL : COPY_FAILED_LABEL);
  };

  const handleDocumentClick = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const copyButton = target ? target.closest('button[data-copy]') : null;
    const urlButton = target ? target.closest('button[data-copy-url]') : null;

    if (copyButton) {
      copyFrom(copyButton, copyButton.dataset.copy ?? '');

      return;
    }

    if (urlButton) {
      copyFrom(urlButton, window.location.href);
    }
  };

  getAnnouncer();
  document.addEventListener('click', handleDocumentClick);
})();
