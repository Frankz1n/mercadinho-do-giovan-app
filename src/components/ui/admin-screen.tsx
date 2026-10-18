import type { PropsWithChildren } from 'react';

import { AdminBottomBar } from '@/components/ui/admin-bottom-bar';
import { Screen } from '@/components/ui/screen';
import { StoreHeader } from '@/components/ui/store-header';
import { colors } from '@/theme';

type AdminScreenProps = PropsWithChildren<{
  title?: string;
}>;

export function AdminScreen({ children, title = 'Área do Giovan' }: AdminScreenProps) {
  return (
    <>
      <Screen
        backgroundColor={colors.surface}
        hasBottomNavigation
        header={
          <StoreHeader
            showAdminBadge
            showCart={false}
            subtitle={null}
            title={title}
          />
        }
      >
        {children}
      </Screen>
      <AdminBottomBar />
    </>
  );
}
