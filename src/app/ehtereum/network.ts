export class Network
{
    private constructor(
        readonly id: number,
        readonly contractAddress: string,
        readonly name: string,
        readonly supported: boolean,
        readonly provider: string
    )
    {
    }

    public static register(id: number, contractAddress: string, name: string,
                           supported: boolean, prov: { infuraSubdomain: string } | { provider: string })
    {
        const provider = (<any>prov).provider ?? `https://${(<any>prov).infuraSubdomain}.infura.io/v3/b12c1b1e6b2e4f58af559a67fe46104e`;
        const net = new Network(id, contractAddress, name, supported, provider)
        Networks.all.set(id, net);
        if (supported) Networks.supported.set(id, net);
    }
}

export namespace Networks
{
    export const all: Map<number, Network> = new Map();
    export const supported: Map<number, Network> = new Map();

    export function MainNet(): Network
    {
        if (all.has(1)) return all.get(1);
        Network.register(1, "0x56040d44f407fa6f33056d4f352d2e919a0d99fb", "Ethereum Main Network", false, { infuraSubdomain: "mainnet" });
        return all.get(1);
    }

    // export const RinkebyTest = new Network(4, "0x801fC75707BEB6d2aE8863D7A3B66047A705ffc0", "Rinkeby Test Network", false, "rinkeby");
    // export const BinanceTest = new Network(97, "0xCeA573896B3963Ee0c4cDA48dD542EFcbff009Da", "Binance Smart Chain Test", false, null, "https://data-seed-prebsc-2-s3.binance.org:8545");
    // export const RopstenTest = new Network(3, '0x9344CdEc9cf176E3162758D23d1FC806a0AE08cf', "Ropsten Test Network", false, "ropsten");
    // export const GoerliTest = new Network(5, null, "Goerli Test Network", false, "goerli");
    // export const KovanTest = new Network(42, null, "Kovan Test Network", false, "kovan");
    // export const Binance = new Network(56, null, "Binance Smart Chain", false, "bsc");

}
