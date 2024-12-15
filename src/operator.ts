import {
    type Address,
    Constr,
    Data, type Datum,
    Koios,
    Lucid,
    type LucidEvolution, mintingPolicyToId,
    type OutRef, paymentCredentialOf,
    type Redeemer, toUnit,
    Tuple, type UTxO, validatorToAddress, validatorToScriptHash, type VrfKeyHash
} from "@lucid-evolution/lucid";
import {toInterface} from "@danogo-js/sdk"
import {getValidatorInstance} from "./utils/instance.ts";
import { SessionDatumSchema } from "./schemas/plutus.ts"
import type {Script, TupleAsset, SessionDatum} from "./schemas/native.ts";
import {blake2b224, getTicketTokenId, hashUTxOs} from "./utils/hash.ts";
import {NETWORK, PLATFORM_POLICY, PLATFORM_ASSET} from "./config/config.ts";


export class Operator {
    private lucidInstance: LucidEvolution;
    private spendingValidator: Script
    private mintingPolicy: Script
    private platformCfg: UTxO
    private operatorAddress: Address
    private settings: {
        fund: bigint,
    }

    constructor(lucidInstance: LucidEvolution, platformCfg: UTxO, operatorAddress: Address) {
        this.lucidInstance = lucidInstance
        this.settings = {
            fund: 10_000_000n,
        }
        this.platformCfg = platformCfg
        this.operatorAddress = operatorAddress
        const validator = this.readValidators()
        const tk_cfg: TupleAsset = [
            PLATFORM_POLICY,
            PLATFORM_ASSET,
        ]
        this.spendingValidator = validator.LiqwidSpendValidator(tk_cfg)
        this.mintingPolicy = validator.LiqwidMintPolicy(tk_cfg)
    }

    // find the utxo
    // find the ref

    private async prepareUtxos(): Promise<UTxO[]> {
        let minFund = this.settings.fund;
        if (this.lucidInstance) {
            const addr = await this.lucidInstance.wallet().address()
            const allUtxos = await this.lucidInstance.utxosAt(addr)
            const fundUtxos: UTxO[] = []

            for (const utxo of allUtxos) {
                if (Object.keys(utxo.assets).length != 1) {
                    continue
                }
                fundUtxos.push(utxo)
                minFund -= utxo.assets.lovelace
                if (minFund <= 0) {
                    break
                }
            }

            if (!fundUtxos.length || minFund > 0) {
                console.log(`Wallet doesn't have enough ADA`);
                throw new Error("Not enough ADA to deploy protocol UTxO");
            }
            return fundUtxos;
        } else {
            throw new Error("Error missing Lucid Instance")
        }
    }

    // async trigger(sessionOutRef: OutRef, msOutRef: OutRef): Promise<string> {
    //
    //     const sessionUTxO = await this.lucidInstance.utxosByOutRef([sessionOutRef])
    //     const msUTxO = await this.lucidInstance.utxosByOutRef([msOutRef])
    //
    //     // build redeemer
    //     const rdmr = Data.to(new Constr(2, [0n, 0n]))
    //     // build datum
    //     const sessionDatum: SessionDatum = {
    //         oraclePolicy: [
    //             "",
    //             ""
    //         ],
    //         sessionTokenId: "",
    //         // predictType: new Constr(0, []),
    //         ticketOptions: [],
    //         maxTicketCountPerOptions: 10n,
    //         ticketPrice: 10n,
    //         sessionTime: {
    //             lowerbound: 10n,
    //             upperbound: 20n
    //         },
    //         resultParams: {
    //             interestIndex: 10n,
    //             interestTime: 10n,
    //         },
    //         ticketWin: {
    //             assetWin: null,
    //             conversionRatio: 100n,
    //         },
    //         organizerConversionRatio: 100n
    //     }
    //
    //     const txn = await this.lucidInstance.newTx()
    //         .collectFrom(sessionUTxO, rdmr)
    //         .readFrom(msUTxO)
    //         .pay.ToAddressWithData(
    //             "",
    //             {
    //                 kind: "inline",
    //                 value: this.buildSessionDatum(sessionDatum, SessionDatumSchema)
    //             },
    //             {
    //                 lovelace: 10n,
    //                 [""]: 1n,
    //             }
    //         )
    //         .attach.SpendingValidator(this.spendingValidator)
    //         .complete({
    //             coinSelection: true,
    //             localUPLCEval: false
    //         })
    //     const signedTxn = await txn.sign.withWallet().complete()
    //     return await signedTxn.submit()
    // }

    private buildSessionDatum<T>(data: T, schema: any): Datum | Redeemer {
        return Data.to(data, schema)
    }

    async init(): Promise<string> {

        const utxos = await this.prepareUtxos()
        console.log(utxos)
        const sessionTokenId = hashUTxOs(utxos)
        const policyId = validatorToScriptHash(this.mintingPolicy)
        const sessionVerificationNft = toUnit(policyId, sessionTokenId)
        const sessionOrganizerNft = toUnit(policyId, blake2b224(sessionTokenId))
        const scriptAddr = validatorToAddress(NETWORK, this.spendingValidator)
        const pkh = paymentCredentialOf(this.operatorAddress).hash
        const ticketTokenIds = [0, 1, 2].map((value, _) => {
            return getTicketTokenId(sessionTokenId, value)
        })
        const rdmr = Data.to(new Constr(0, [0n, 0n]))
        const sessionDatum: SessionDatum = {
            oraclePolicy: [
                "021f91b86b2b609c8fd16cb496306f61856642af038b08db79e652c9",
                "021f91b86b2b609c8fd16cb496306f61856642af038b08db79e652c9"
            ],
            sessionTokenId: sessionTokenId,
            predictType: new Constr(0, []),
            ticketOptions: [10n, 40n],
            maxTicketCountPerOption: 100n,
            ticketPrice: 10_000_000n,
            sessionTime: {
                lowerbound: 1734280234n,
                upperbound: 1734366634n
            },
            resultParams: null,
            ticketWin: null,
            organizerConversionRatio: null
        }

        const txn = await this.lucidInstance.newTx()
            .collectFrom(utxos)
            .readFrom([this.platformCfg])
            // .mintAssets({
            //     [sessionVerificationNft]: 1n,
            //     [sessionOrganizerNft]: 1n,
            //     [policyId + ticketTokenIds[0]]: 100n,
            //     [policyId + ticketTokenIds[1]]: 100n,
            //     [policyId + ticketTokenIds[2]]: 100n,
            // }, rdmr)
            // .attach.MintingPolicy(this.mintingPolicy)
            .pay.ToAddressWithData(
                this.operatorAddress,
                {
                    kind: "inline",
                    value: this.buildSessionDatum(sessionDatum, SessionDatumSchema)
                },
                {
                    lovelace: 2_000_000n,
                    // [sessionVerificationNft]: 1n,
                    // [sessionOrganizerNft]: 1n,
                    // [policyId + ticketTokenIds[0]]: 100n,
                    // [policyId + ticketTokenIds[1]]: 100n,
                    // [policyId + ticketTokenIds[2]]: 100n,
                }
            )
            // .pay.ToAddress(
            //     this.operatorAddress,
            //     {
            //         lovelace: 2_000_000n,
            //         [sessionOrganizerNft]: 1n,
            //     }
            // )
            .addSignerKey(pkh)
            .complete({
                coinSelection: true,
                localUPLCEval: false,
                changeAddress: this.operatorAddress,
            })

        const signedTxn = await txn.sign.withWallet().complete()
        return await signedTxn.submit()
    }

    readValidators() {
        let { getValidator, definitions } = getValidatorInstance(`../../plutus_silent.json`)
        return {
            LiqwidSpendValidator: (tk_cfg: TupleAsset) => getValidator("liqwid_sc.execute.spend", [tk_cfg]),
            LiqwidMintPolicy: (tk_cfg: TupleAsset) => getValidator("liqwid_sc.execute.mint", [tk_cfg]),
            definitions
        }
    }

}