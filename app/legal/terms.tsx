import { StyleSheet, Text } from 'react-native';

import { Screen, StoreHeader } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

export default function TermsScreen() {
  return (
    <Screen>
      <StoreHeader title="Termos de Uso" />
      <Text style={styles.updated}>Última atualização: outubro de 2026</Text>
      <Text style={styles.paragraph}>
        Ao criar conta e usar o app Mercadinho do Giovan, você concorda com estes
        termos.
      </Text>
      <Text style={styles.heading}>1. Serviço</Text>
      <Text style={styles.paragraph}>
        O app permite consultar produtos e cestas, montar um pedido e retirar na
        loja física. O pagamento é feito no ato da retirada, salvo aviso em
        contrário na loja.
      </Text>
      <Text style={styles.heading}>2. Conta</Text>
      <Text style={styles.paragraph}>
        Você é responsável por manter seus dados (nome, e-mail e WhatsApp)
        corretos e por não compartilhar sua senha. Pedidos são vinculados à sua
        conta.
      </Text>
      <Text style={styles.heading}>3. Pedidos e estoque</Text>
      <Text style={styles.paragraph}>
        Preços e disponibilidade seguem o catálogo no momento do fechamento do
        pedido. A loja pode cancelar um pedido por falta de estoque, erro
        operacional ou suspeita de uso indevido; nesses casos o estoque é
        devolvido ao sistema.
      </Text>
      <Text style={styles.heading}>4. Retirada</Text>
      <Text style={styles.paragraph}>
        Apresente o código do pedido na loja. A separação e a confirmação de
        pagamento são feitas pela equipe do Mercadinho do Giovan.
      </Text>
      <Text style={styles.heading}>5. Contato</Text>
      <Text style={styles.paragraph}>
        Dúvidas sobre pedidos ou estes termos devem ser tratadas diretamente com
        a loja.
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
