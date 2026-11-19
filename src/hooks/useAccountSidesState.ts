import { useState } from 'react';
import AccountSide from '../enums/AccountSide';

const INITIAL_EXPANDED_SIDES: Record<AccountSide, boolean> = {
  [AccountSide.GROOM]: false,
  [AccountSide.BRIDE]: false,
};

// Groom / bride account lists that expand and collapse independently.
const useAccountSidesState = () => {
  const [expandedSides, setExpandedSides] = useState(INITIAL_EXPANDED_SIDES);

  const handleToggleSide = (side: AccountSide) => {
    setExpandedSides((previous) => ({ ...previous, [side]: !previous[side] }));
  };

  return { expandedSides, handleToggleSide };
};

export default useAccountSidesState;
