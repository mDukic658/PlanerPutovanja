import { putovanja } from "./PutovanjaPodaci";

async function get(){
    return {data: [...putovanja]}
}

async function dodaj(putovanje){
    if(putovanja.length === 0){
        putovanje.sifra = 1
    }else{
        putovanje.sifra = putovanja[putovanja.length - 1].sifra + 1
    }

    putovanja.push(putovanje)
}

export default{
    get,
    dodaj
}