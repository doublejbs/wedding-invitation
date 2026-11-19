import type { BankAccount } from '../../types/BankAccount';
import type { CopyFeedback } from '../../types/CopyFeedback';
import CopyButtonView from '../shared/CopyButtonView';


interface Props {
  title: string;
  accounts: BankAccount[];
  copyFeedback: CopyFeedback | null;
  onCopy: (key: string, text: string) => Promise<void>;
}

const AccountGroupView = ({ title, accounts, copyFeedback, onCopy }: Props) => {
  return (
    <details className="launch-accounts__group">
      <summary className="launch-accounts__summary">{title}</summary>
      <ul className="launch-accounts__list">
        {accounts.map((account) => (
          <li key={account.id} className="launch-accounts__item">
            <div className="launch-accounts__info">
              <p className="launch-accounts__holder">{`${account.relation} ${account.holder}`}</p>
              <p className="launch-accounts__number">{`${account.bank} ${account.number}`}</p>
            </div>
            <CopyButtonView
              className="launch-copy-button"
              copyKey={account.id}
              text={`${account.bank} ${account.number}`}
              label="복사"
              accessibleLabel={`${account.relation} 계좌 복사`}
              copyFeedback={copyFeedback}
              onCopy={onCopy}
            />
          </li>
        ))}
      </ul>
    </details>
  );
};

export default AccountGroupView;
