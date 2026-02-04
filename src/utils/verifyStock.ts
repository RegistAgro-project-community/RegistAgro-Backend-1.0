import type { Stock } from "../../generated/prisma/enums";

interface ToKg {
    _orderQtd: number,
    _productQtd: number
}

function convertToKg(orderQtd: number, orderUnit: Stock, productQtd: number, productUnit: Stock): ToKg {
    const userQtd = orderUnit == "t" ? orderQtd * 1000 : orderQtd

    const product = productUnit == "t" ? productQtd * 1000 : productQtd

    return {
        _orderQtd: userQtd,
        _productQtd: product 
    }
}

export function verifyStock(orderQtd: number, orderUnit: Stock, productQtd: number, productUnit: Stock){
    const { _orderQtd, _productQtd } = convertToKg(orderQtd, orderUnit, productQtd, productUnit)

    if(_orderQtd > _productQtd){
        return false
    }

    return true
}
