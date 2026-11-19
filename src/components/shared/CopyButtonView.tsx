import type { CopyFeedback } from '../../types/CopyFeedback';
import { joinClassNames } from '../../utils/ClassNameUtils';

interface Props {
  copyKey: string;
  text: string;
  label: string;
  accessibleLabel: string;
  copyFeedback: CopyFeedback | null;
  onCopy: (key: string, text: string) => Promise<void>;
  // Page-specific styling hook, e.g. "launch-copy-button".
  className?: string;
}

const CopyButtonView = ({ copyKey, text, label, accessibleLabel, copyFeedback, onCopy, className }: Props) => {
  const isCopied = copyFeedback?.key === copyKey && copyFeedback.isSuccess;

  const handleClick = async () => {
    await onCopy(copyKey, text);
  };

  return (
    <button
      type="button"
      className={joinClassNames('copy-button', className)}
      aria-label={accessibleLabel}
      onClick={handleClick}
    >
      {isCopied ? '완료' : label}
    </button>
  );
};

export default CopyButtonView;
