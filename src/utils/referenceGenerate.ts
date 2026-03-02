import { customAlphabet } from "nanoid";

export function referenceGenerate(){
   const generate = customAlphabet('0123456789', 9)
   return generate()
}
