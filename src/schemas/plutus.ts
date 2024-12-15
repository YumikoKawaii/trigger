import { Data } from "@lucid-evolution/lucid"

export const TupleAssetSchema = Data.Tuple([Data.Bytes(), Data.Bytes({minLength: 0})])
export const AssetNameSchema = Data.Bytes()

export const SessionTimeSchema = Data.Object({
    lowerbound: Data.Integer(),
    upperbound: Data.Integer(),
})

export const ResultParamsSchema = Data.Object({
    interestIndex: Data.Integer(),
    interestTime: Data.Integer(),
})

export const TicketWinSchema = Data.Object({
    assetWin: Data.Nullable(AssetNameSchema),
    conversionRatio: Data.Integer(),
})

export const SessionDatumSchema = Data.Object(
    {
        oraclePolicy: TupleAssetSchema,
        sessionTokenId: AssetNameSchema,
        predictType: Data.Any(),
        ticketOptions: Data.Array(Data.Integer()),
        maxTicketCountPerOption: Data.Integer(),
        ticketPrice: Data.Integer(),
        sessionTime: SessionTimeSchema,
        resultParams: Data.Nullable(ResultParamsSchema),
        ticketWin: Data.Nullable(TicketWinSchema),
        organizerConversionRatio: Data.Nullable(Data.Integer())
    }
)

//     , {
//     minItems: 1,
//     maxItems: 4,
//     uniqueItems: true,
// }