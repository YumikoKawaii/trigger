import {Const, Constr, type ScriptType} from "@lucid-evolution/lucid";
import {type Nullable} from "@danogo-js/sdk"

type PolicyId = string
type AssetName = string

export type TupleAsset = [PolicyId, AssetName]

export type Script = {
    title: string,
    type: ScriptType,
    script: string,
}

export const PredictType = {
    LiqwidSupply: new Constr(0, []),
    LiqwidBorrow: new Constr(1, [])
}

export type ResultParams = {
    interestIndex: bigint,
    interestTime: bigint,
}

export type TicketWin = {
    assetWin: Nullable<string>,
    conversionRatio: bigint,
}

export type SessionDatum = {
    oraclePolicy: TupleAsset,
    sessionTokenId: string,
    predictType: Constr<any>,
    ticketOptions: bigint[],
    maxTicketCountPerOption: bigint,
    ticketPrice: bigint,
    sessionTime: {
        lowerbound: bigint,
        upperbound: bigint,
    },
    resultParams: Nullable<ResultParams>,
    ticketWin: Nullable<TicketWin>,
    organizerConversionRatio: Nullable<bigint>,
}