export class Network {
    readonly provider: string;
    constructor(
        readonly id: number,
        readonly contractAddress: string,
        readonly name: string,
        readonly supported: boolean,
        infuraSubdomain?: string,
        provider?: string
    ) {
        if (infuraSubdomain) this.provider = `https://${infuraSubdomain}.infura.io/v3/b12c1b1e6b2e4f58af559a67fe46104e`
        else this.provider = provider;
        Networks.all.set(id, this);
        if (supported) Networks.supported.set(id, this);
    }
}

export namespace Networks {
    export const all: Map<number, Network> = new Map();
    export const supported: Map<number, Network> = new Map();
    export const MainNet = new Network(1, "0x56040d44f407fa6f33056d4f352d2e919a0d99fb", "Ethereum Main Network", false, "mainnet");
    export const RinkebyTest = new Network(4, "0x801fC75707BEB6d2aE8863D7A3B66047A705ffc0", "Rinkeby Test Network", false, "rinkeby");
    export const BinanceTest = new Network(97, "0x4f2BF5efbefa41506c5D1Ebbc0CBFe74461A1c74", "Binance Smart Chain Test", true, null, "https://data-seed-prebsc-1-s3.binance.org:8545");
    export const RopstenTest = new Network(3, '0x9344CdEc9cf176E3162758D23d1FC806a0AE08cf', "Ropsten Test Network", false, "ropsten");
    export const GoerliTest = new Network(5, null, "Goerli Test Network", false, "goerli");
    export const KovanTest = new Network(42, null, "Kovan Test Network", false, "kovan");
    export const Binance = new Network(56, null, "Binance Smart Chain", false, "bsc");
}
