export function vehiclesTypeError(type: string | string[]){
    if(type != "frigorifico" && type != "fechado" && type != "aberto_coberto" && type != "aberto"){
        return true
    }

    return false
}
