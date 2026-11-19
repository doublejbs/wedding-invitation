import type AccountSide from '../enums/AccountSide';

export interface BankAccount {
  id: string;
  side: AccountSide;
  relation: string;
  holder: string;
  bank: string;
  number: string;
}
