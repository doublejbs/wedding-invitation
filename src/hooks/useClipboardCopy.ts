import { useEffect, useRef, useState } from 'react';
import type { CopyFeedback } from '../types/CopyFeedback';

const FEEDBACK_DURATION_MS = 2400;

const COPY_SUCCESS_MESSAGE = '복사되었습니다.';

const COPY_FAILURE_MESSAGE = '복사하지 못했습니다. 길게 눌러 직접 복사해 주세요.';

const useClipboardCopy = () => {
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const timeoutRef = useRef(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async (key: string, text: string) => {
    let isSuccess = true;

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API is not available');
      }

      await navigator.clipboard.writeText(text);
    } catch {
      isSuccess = false;
    }

    const message = isSuccess ? COPY_SUCCESS_MESSAGE : COPY_FAILURE_MESSAGE;

    setCopyFeedback({ key, message, isSuccess });
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCopyFeedback(null);
    }, FEEDBACK_DURATION_MS);
  };

  return { copyFeedback, handleCopy };
};

export default useClipboardCopy;
