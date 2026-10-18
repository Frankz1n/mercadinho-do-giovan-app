import type { PropsWithChildren } from 'react';

import { Screen } from '@/components/ui/screen';
import { StoreHeader } from '@/components/ui/store-header';
import { colors } from '@/theme';

type ShopScreenProps = PropsWithChildren<{
  title?: string;
  showCart?: boolean;
}>;

export function ShopScreen({
  children,
  title = 'Mercadinho do Giovan',
  showCart = true,
}: ShopScreenProps) {
  return (
    <Screen
      backgroundColor={colors.background}
      hasBottomNavigation
      header={<StoreHeader showCart={showCart} title={title} />}
    >
      {children}
    </Screen>
  );
}
