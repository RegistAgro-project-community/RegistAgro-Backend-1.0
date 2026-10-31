interface Payment {
    transportValue: number,
    registagroValue: number,
    total: number
}

export interface PaymentSplitPolicy {
    transportPercent: number;
    registagroPercent: number;
}

export function readPaymentSplitPolicy(env: NodeJS.ProcessEnv = process.env): PaymentSplitPolicy {
    const transportPercent = env.PAYMENT_TRANSPORT_PERCENT === undefined ? 30 : Number(env.PAYMENT_TRANSPORT_PERCENT);
    const registagroPercent = env.PAYMENT_REGISTAGRO_PERCENT === undefined ? 5 : Number(env.PAYMENT_REGISTAGRO_PERCENT);
    if (!Number.isFinite(transportPercent) || !Number.isFinite(registagroPercent)
        || transportPercent < 0 || registagroPercent < 0 || transportPercent + registagroPercent >= 100) {
        throw new Error("Configuração de split de pagamento inválida");
    }
    return { transportPercent, registagroPercent };
}

export function paymentSplit(value: number, policy: PaymentSplitPolicy = readPaymentSplitPolicy()): Payment{
    if (!Number.isFinite(value) || value < 0) throw new Error("Valor de pagamento inválido");
    const transportValue = value * (policy.transportPercent / 100)
    const registagroValue = value * (policy.registagroPercent / 100)
    const total = value + transportValue + registagroValue

    return {transportValue: transportValue, registagroValue: registagroValue, total: total}
}
