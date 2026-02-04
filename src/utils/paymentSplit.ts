interface Payment {
    transportValue: number,
    registagroValue: number,
    total: number
}

export function paymentSplit(value: number): Payment{
    const transportValue = value * (30 / 100)
    const registagroValue = value * (5 / 100)
    const total = value + transportValue + registagroValue

    return {transportValue: transportValue, registagroValue: registagroValue, total: total}
}
