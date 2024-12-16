import {Operator} from "./src/operator.ts";
import {getLucidInstance, getValidatorInstance} from "./src/utils/instance.ts";
import type {TupleAsset} from "./src/schemas/native.ts"
import { OPERATOR_SEED } from "./src/config/config.ts"

const lucidInstance = await getLucidInstance(OPERATOR_SEED)
const operatorAddr = await lucidInstance.wallet().address()
const platformConfig = await lucidInstance.utxosByOutRef([{
    txHash: "8d46e404ea5733ed03a844519e9259611e59d1d10250435a61ee0317f2193138",
    outputIndex: 0,
}])
const operator = new Operator(lucidInstance, platformConfig[0], operatorAddr)
const txnHash = await operator.init()
console.log(txnHash)