import { ACCOUNT_GROUPS, BANK_ACCOUNTS } from '../../data/InvitationData';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import CopyButtonView from '../shared/CopyButtonView';

const GiftPanelView = () => {
  const { copyFeedback, handleCopy } = useClipboardCopy();

  return (
    <div className="editorial-panel">
      <p className="editorial-panel__lead">참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.</p>
      {ACCOUNT_GROUPS.map((group) => (
        <div key={group.side} className="editorial-accounts">
          <h3 className="editorial-accounts__title editorial-mono">{group.label}</h3>
          <ul className="editorial-accounts__list">
            {BANK_ACCOUNTS.filter((account) => account.side === group.side).map((account) => (
              <li key={account.id} className="editorial-accounts__item">
                <div className="editorial-accounts__info">
                  <p className="editorial-accounts__holder">
                    <span className="editorial-accounts__relation">{account.relation}</span> {account.holder}
                  </p>
                  <p className="editorial-accounts__number">{`${account.bank} ${account.number}`}</p>
                </div>
                <CopyButtonView
                  className="editorial-copy-button"
                  copyKey={account.id}
                  text={`${account.bank} ${account.number}`}
                  label="복사"
                  accessibleLabel={`${account.relation} ${account.holder} 계좌번호 복사`}
                  copyFeedback={copyFeedback}
                  onCopy={handleCopy}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="editorial-feedback" role="status">
        {copyFeedback?.message ?? ''}
      </p>
    </div>
  );
};

export default GiftPanelView;
