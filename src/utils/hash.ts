import { CML, fromHex, toHex, type UTxO } from "@lucid-evolution/lucid";
import { C } from "lucid-cardano"
import {type} from "node:os";

export function blake2b224(hex: string) {
    return toHex(C.hash_blake2b224(fromHex(hex)))
}

export function blake2b256(hex: string) {
    return toHex(C.hash_blake2b256(fromHex(hex)))
}

function inputsQuicksortAsc(inputs: UTxO[]): UTxO[] {
    if (inputs.length === 0) {
        return [];
    }

    const [p, ...tail] = inputs;
    const p_idx = p.outputIndex

    return [
        ...inputsQuicksortAsc(
            tail.filter(input => input.outputIndex <= p_idx)
        ),
        p,
        ...inputsQuicksortAsc(
            tail.filter(input => input.outputIndex <= p_idx)
        )
    ];
}

export function hashUTxOs(utxos: UTxO[]) {
    const temp = inputsQuicksortAsc(utxos).map(utxo => utxo.txHash.toUpperCase() + intToDigitsHex(utxo.outputIndex)).join("")
    return blake2b224(temp)
}

export function getTicketTokenId(sessionTokenId: string, idx: number): string {
    return blake2b224(sessionTokenId.toUpperCase() + intToDigitsHex(idx))
}

function intToDigitsHex(num: number) {
    let digits = [];

    while (num > 0) {
        digits.push(num % 10);
        num = (num / 10) | 0;
    }

    if (digits.length == 0) {
        digits.push(0);
    }

    return digits
        .reverse()
        .reduce((acc, num) => acc + (num + 48).toString(16), '');
}

export function stringToHex(str: string) {
    return Buffer.from(str,'utf-8').toString('hex')
}

export const bigIntReviver = (key: any, value: any) => {
    if (typeof value !== 'string') {
        return value;
    }

    const match = /^(-?\d+)n?$/.exec(value);

    if (!match) {
        return value;
    }

    const numericValue = match[1];

    if (BigInt(numericValue) > Number.MAX_SAFE_INTEGER || BigInt(numericValue) < Number.MIN_SAFE_INTEGER) {
        return BigInt(numericValue);
    }

    return Number(numericValue);
};