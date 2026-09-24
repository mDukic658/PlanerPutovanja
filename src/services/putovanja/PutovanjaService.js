import { putovanja } from "./PutovanjaPodaci";

async function get(){
    return {data: [...putovanja]}
}

export default{
    get
}