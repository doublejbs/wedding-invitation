import type AccountSide from '../../enums/AccountSide';
import type { AccountGroup } from '../../types/AccountGroup';
import type { BankAccount } from '../../types/BankAccount';
import type { CopyFeedback } from '../../types/CopyFeedback';
import { joinClassNames } from '../../utils/ClassNameUtils';
import CopyButtonView from '../shared/CopyButtonView';

interface Props {
  group: AccountGroup;
  accounts: BankAccount[];
  isExpanded: boolean;
  copyFeedback: CopyFeedback | null;
  onToggle: (side: AccountSide) => void;
  onCopy: (key: string, text: string) => Promise<void>;
}

// One side's label-band toggle and its collapsible account list.
const CollageAccountGroupView = ({ group, accounts, isExpanded, copyFeedback, onToggle, onCopy }: Props) => {
  const listId = `collage-accounts-${group.side.toLowerCase()}`;

  const handleToggle = () => {
    onToggle(group.side);
  };

  return (
    <div className={joinClassNames('collage-accounts', isExpanded && 'is-expanded')}>
      <h3 className="collage-accounts__heading">
        <button
          type="button"
          className="collage-accounts__toggle"
          aria-expanded={isExpanded}
          aria-controls={listId}
          onClick={handleToggle}
        >
          <span className="collage-label collage-label-band">{group.label}</span>
          <span className="collage-accounts__english collage-mono" aria-hidden="true">
            {group.englishLabel}
          </span>
          <span className="collage-accounts__sign" aria-hidden="true">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
      </h3>
      <ul id={listId} className="collage-accounts__list" hidden={!isExpanded}>
        {accounts.map((account) => {
          const accountText = `${account.bank} ${account.number}`;

          return (
            <li key={account.id} className="collage-accounts__item">
              <div className="collage-accounts__info">
                <p className="collage-accounts__holder">
                  <span className="collage-accounts__relation">{account.relation}</span> {account.holder}
                </p>
                <p className="collage-accounts__number">{accountText}</p>
              </div>
              <CopyButtonView
                className="collage-copy-button"
                copyKey={account.id}
                text={accountText}
                label="복사"
                accessibleLabel={`${account.relation} ${account.holder} 계좌번호 복사`}
                copyFeedback={copyFeedback}
                onCopy={onCopy}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CollageAccountGroupView;
