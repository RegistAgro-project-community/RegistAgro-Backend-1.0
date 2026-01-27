import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export function notFound(error: unknown){
    if(error instanceof PrismaClientKnownRequestError && error.code == "P2025"){
        return true
    }

    return false
}
