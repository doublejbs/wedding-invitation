import type AccountSide from '../enums/AccountSide';

export interface AccountGroup {
  side: AccountSide;
  label: string;
  englishLabel: string;
}
