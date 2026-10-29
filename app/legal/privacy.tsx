import { StyleSheet, Text } from 'react-native';

import { Screen, StoreHeader } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

export default function PrivacyScreen() {
  return (
    <Screen>
      <StoreHeader title="Política de Privacidade" />
      <Text style={styles.updated}>Última atualização: outubro de 2026</Text>
      <Text style={styles.paragraph}>
        Esta política explica quais dados o Mercadinho do Giovan trata ao usar o
        app e para quais finalidades.
      </Text>
      <Text style={styles.heading}>1. Dados que coletamos</Text>
      <Text style={styles.paragraph}>
        Nome, e-mail, telefone/WhatsApp, dados de login, histórico de pedidos e,
        se você permitir, token de notificação push do aparelho.
      </Text>
      <Text style={styles.heading}>2. Para que usamos</Text>
      <Text style={styles.paragraph}>
        Criar e autenticar sua conta, montar e separar pedidos, falar com você
        sobre retirada e status do pedido, e melhorar a operação da loja.
      </Text>
      <Text style={styles.heading}>3. Compartilhamento</Text>
      <Text style={styles.paragraph}>
        Usamos provedores de infraestrutura (como autenticação, banco e
        notificações) apenas para operar o serviço. Não vendemos seus dados.
      </Text>
      <Text style={styles.heading}>4. Conservação</Text>
      <Text style={styles.paragraph}>
        Mantemos os dados enquanto a conta existir e pelo tempo necessário para
        cumprir obrigações legais e operacionais de pedidos.
      </Text>
      <Text style={styles.heading}>5. Seus direitos</Text>
      <Text style={styles.paragraph}>
        Você pode solicitar correção dos dados do perfil ou exclusão da conta
        falando com a loja. Notificações push podem ser desativadas nas
        configurações do aparelho.
      </Text>
      <Text style={styles.heading}>6. Contato</Text>
      <Text style={styles.paragraph}>
        Para exercer direitos previstos na LGPD ou tirar dúvidas sobre
        privacidade, procure a equipe do Mercadinho do Giovan.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  updated: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  heading: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  paragraph: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 14,
    lineHeight: 22,
  },
});
