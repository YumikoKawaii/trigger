import {Blockfrost, Koios, Lucid, type LucidEvolution} from "@lucid-evolution/lucid";
import {readBlueprint} from "@danogo-js/sdk"
import {NETWORK, KOIOS_URL} from "../config";

export const getLucidInstance = async (seed: string): Promise<LucidEvolution> => {
    // const provider = new Koios(KOIOS_URL)
    const provider = new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "previewfxs41sN3L8n8S9FlZKINXGfPP3YGyyqe")
    const lucid = await Lucid(provider, NETWORK)
    lucid.selectWallet.fromSeed(seed)
    return lucid
}

export const getValidatorInstance = (path: string)=> {
    const blueprintPath = Bun.fileURLToPath(import.meta.resolve(path))
    const {
        getValidator: getValidator,
        blueprint: {definitions}
    } = readBlueprint(blueprintPath)
    return {
        getValidator: getValidator,
        definitions: definitions,
    }
}