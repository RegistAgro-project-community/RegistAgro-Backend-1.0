import type { Stock } from "../../generated/prisma/enums";

function convertToKg(qtd: number, unit: Stock){
    return unit == "t" ? qtd * 1000 : qtd
}

export function orderPrice(price: number, qtd: number, unit: Stock){
    const qtdKg = convertToKg(qtd, unit)
    return price * qtdKg
}
