import { ACCOUNT_GROUPS, BANK_ACCOUNTS } from '../../data/InvitationData';
import useAccountSidesState from '../../hooks/useAccountSidesState';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import CollageAccountGroupView from './CollageAccountGroupView';
import CollageSectionHeadingView from './CollageSectionHeadingView';

const HEADING_ID = 'collage-gift-heading';

const CollageGiftView = () => {
  const { expandedSides, handleToggleSide } = useAccountSidesState();
  const { copyFeedback, handleCopy } = useClipboardCopy();

  return (
    <section className="collage-section collage-gift" aria-labelledby={HEADING_ID}>
      <CollageSectionHeadingView id={HEADING_ID} number="05" englishTitle="Gift" title="마음 전하실 곳" />
      <p className="collage-section__lead">참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.</p>
      {ACCOUNT_GROUPS.map((group) => (
        <CollageAccountGroupView
          key={group.side}
          group={group}
          accounts={BANK_ACCOUNTS.filter((account) => account.side === group.side)}
          isExpanded={expandedSides[group.side]}
          copyFeedback={copyFeedback}
          onToggle={handleToggleSide}
          onCopy={handleCopy}
        />
      ))}
      <p className="collage-feedback" role="status">
        {copyFeedback?.message ?? ''}
      </p>
    </section>
  );
};

export default CollageGiftView;
