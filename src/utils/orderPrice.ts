import type { Stock } from "../../generated/prisma/enums.js";

interface ProductStock {
    productQtd: number
    productUnit: Stock
}

function convertToKg(qtd: number, unit: Stock){
    return unit == "t" ? qtd * 1000 : qtd
}

function convertToTon(qtd: number): ProductStock{
    const productQtd = qtd >= 1000 ? qtd / 1000 : qtd
    const productUnit = qtd >= 1000 ? "t" : "kg" as Stock

    return {productQtd: productQtd, productUnit: productUnit}
}

export function orderPrice(price: number, qtd: number, unit: Stock){
    const qtdKg = convertToKg(qtd, unit)
    return price * qtdKg
}

export function reduceStock(orderQtd: number, orderUnit: Stock, productQtd: number, productUnit: Stock){
    const orderKg = convertToKg(orderQtd, orderUnit)
    const productKg = convertToKg(productQtd, productUnit)

    const stock = productKg - orderKg

    return convertToTon(stock)
}
