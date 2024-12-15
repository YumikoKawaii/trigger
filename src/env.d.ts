import {type Network} from "@lucid-evolution"

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NETWORK: Network;
            OPERATOR_SEED: string;
            PLATFORM_POLICY: string,
            PLATFORM_ASSET: string,
            PLATFORM_ADDR: string;
            KOIOS_URL: string,
            BLUEPRINT_PATH: string,
            MYSQL_USERNAME: string,
            MYSQL_PASSWORD: string,
            MYSQL_DATABASE: string,
            MYSQL_HOST: string,
        }
    }
}