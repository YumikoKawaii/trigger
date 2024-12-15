import {Operator} from "./src/operator.ts";
import {getLucidInstance, getValidatorInstance} from "./src/utils/instance.ts";
import type {TupleAsset} from "./src/schemas/native.ts"
import { OPERATOR_SEED } from "./src/config/config.ts"

const lucidInstance = await getLucidInstance(OPERATOR_SEED)
const operatorAddr = await lucidInstance.wallet().address()
const platformConfig = await lucidInstance.utxosByOutRef([{
    txHash: "458b8df21ea76dfd779a51039fae3fda851a627c96ac03679d0e20706d3db6bc",
    outputIndex: 0,
}])
const operator = new Operator(lucidInstance, platformConfig[0], operatorAddr)
const txnHash = await operator.init()
console.log(txnHash)