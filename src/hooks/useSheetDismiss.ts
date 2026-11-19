import { useEffect, useEffectEvent, useRef } from 'react';

const AUTOFOCUS_SELECTOR = '[data-autofocus]';

const DIALOG_SELECTOR = '[role="dialog"]';

// Marks every element outside `root` (siblings of root and of each ancestor up to <body>) as inert,
// so Tab, clicks and assistive tech stay inside the sheet. Returns a function that restores them.
const makeOutsideInert = (root: HTMLElement) => {
  const inertElements: Element[] = [];
  let current: Element | null = root;

  while (current && current !== document.body) {
    const parent: HTMLElement | null = current.parentElement;
    const keptElement: Element = current;

    Array.from(parent?.children ?? []).forEach((sibling) => {
      if (sibling !== keptElement && !sibling.hasAttribute('inert')) {
        sibling.setAttribute('inert', '');
        inertElements.push(sibling);
      }
    });

    current = parent;
  }

  return () => {
    inertElements.forEach((element) => {
      element.removeAttribute('inert');
    });
  };
};

// Modal sheet behavior: Escape closes, the rest of the page is inert, body scroll is locked,
// focus moves in on open and returns to the trigger on close. Attach the ref to the sheet root.
const useSheetDismiss = <T extends HTMLElement>(onClose: () => void) => {
  const sheetRef = useRef<T>(null);
  const handleEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  useEffect(() => {
    const sheet = sheetRef.current;

    if (!sheet) {
      return undefined;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const autofocusTarget =
      sheet.querySelector<HTMLElement>(AUTOFOCUS_SELECTOR) ?? sheet.querySelector<HTMLElement>(DIALOG_SELECTOR);
    const restoreOutside = makeOutsideInert(sheet);

    document.body.style.overflow = 'hidden';
    autofocusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      handleEscape(event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreOutside();
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return sheetRef;
};

export default useSheetDismiss;
