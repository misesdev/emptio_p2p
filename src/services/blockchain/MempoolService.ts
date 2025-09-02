import IBlockChainService from "./IBlockChainService";
import { BParticitant, BTransaction } from "../wallet/types/Transaction";
import { AddressBalance, Balance } from "../wallet/types/Balance";
import { FeeRate } from "../wallet/types/FeeRate";
import { Utxo } from "../wallet/types/Utxo";
import { BNetwork } from "bitcoin-tx-lib";
import axios, { AxiosInstance } from "axios"

class MempoolService implements IBlockChainService
{
    private _httpClient: AxiosInstance;

    constructor (network: BNetwork = "mainnet") 
    {
        let apiUrl = process.env.MEMPOOL_MAIN as string
        if(network == "testnet")
            apiUrl = process.env.MEMPOOL_TESTNET as string
        this._httpClient = axios.create({
            baseURL: apiUrl,
            timeout: 10000
        })
    }

    public setNetwork(network: BNetwork) 
    {
        let apiUrl = process.env.MEMPOOL_MAIN as string
        if(network == "testnet")
            apiUrl = process.env.MEMPOOL_TESTNET as string
        this._httpClient = axios.create({
            baseURL: apiUrl,
            timeout: 10000
        })
    }

    public async getUtxos(address: string): Promise<Utxo[]> 
    {
        const response = await this._httpClient.get(`/address/${address}/utxo`)
        return response.data.map((u: any): Utxo => ({
            address,
            txid: u.txid,
            vout: u.vout,
            value: u.value,
            confirmed: u.status.confirmed,
            block_hash: u.status.block_hash,
            block_height: u.status.block_height,
            block_time: u.status.block_time
        }))
    }

    public async listUtxos(addrs: string[]): Promise<Utxo[]> 
    {
        const results: Utxo[] = []
        for (const address of addrs) {
            const utxos = await this.getUtxos(address)
            results.push(...utxos)
        }
        return results
    }

    public async getBalance(address: string): Promise<AddressBalance> 
    {
        const response = await this._httpClient.get(`/address/${address}`)
        const chain = response.data.chain_stats
        const mempool = response.data.mempool_stats
        return {
            address: response.data.address,
            confirmedBalance: chain.funded_txo_sum - chain.spent_txo_sum,
            unconfirmedBalance: mempool.funded_txo_sum - mempool.spent_txo_sum,
            totalBalance: (
                chain.funded_txo_sum - chain.spent_txo_sum + 
                mempool.funded_txo_sum - mempool.spent_txo_sum
            ),
            received: (chain.funded_txo_sum + mempool.funded_txo_sum),
            sent: (chain.spent_txo_sum + mempool.spent_txo_sum),
            received_txs: (
                (chain.tx_count - chain.spent_txo_count) +
                (mempool.tx_count - mempool.spent_txo_count)
            ),
            sent_txs: (chain.spent_txo_count + mempool.spent_txo_count),
            txs: (chain.tx_count + chain.tx_count),
        } 
    }

    public async listBalance(addrs: string[]): Promise<Balance>
    {
        const addrsBalances: AddressBalance[] = []
        for (let address of addrs) {
            let balance = await this.getBalance(address)
            addrsBalances.push(balance)
        }
        const balance = addrsBalances.reduce((acc, ab) => {
            acc.sent += ab.sent
            acc.received += ab.received
            acc.confirmedBalance += ab.confirmedBalance
            acc.unconfirmedBalance += ab.unconfirmedBalance
            acc.totalBalance += ab.totalBalance
            acc.received_txs += ab.received_txs,
            acc.sent_txs += ab.sent_txs
            acc.txs += ab.txs
            return acc
        }, {
            received: 0,
            sent: 0,
            confirmedBalance: 0,
            unconfirmedBalance: 0,
            totalBalance: 0,
            received_txs: 0,
            sent_txs: 0,
            txs: 0
        })
        const totalBalance: Balance = { ...balance, addrsBalances }
        return totalBalance
    }

    public async getTransaction(txid: string, addressRef: string): Promise<BTransaction> 
    {
        const response = await this._httpClient.get(`/tx/${txid}`)
        const tx: any = response.data
        const participants: BParticitant[] = []
        for(let vin of tx.vin) {
            participants.push({
                type: "input",
                txid: vin.txid,
                vout: vin.vout,
                address: vin.prevout.scriptpubkey_address,
                value: vin.prevout.value
            })
        }
        for(let vout of tx.vout) {
            participants.push({
                type: "output",
                txid: tx.txid,
                vout: tx.vout.indexOf(vout),
                address: vout.scriptpubkey_address,
                value: vout.value
            })
        }

        const receivedValue = tx.vout.filter((t: any) => t.scriptpubkey_address === addressRef)
            .reduce((sum: any, t: any) => sum + t.value, 0)

        const sentValue = tx.vout.filter((t: any) => t.scriptpubkey_address !== addressRef)
            .reduce((sum: any, t: any) => sum + t.value, 0)

        const isSent = !!participants.find(t => t.type == "input" && t.address == addressRef)

        return {
            txid: tx.txid,
            fee: tx.fee,
            type: isSent ? "sent" : "received",
            value: isSent ? sentValue : receivedValue, 
            confirmed: tx.status.confirmed,
            block_hash: tx.status.block_hash,
            block_height: tx.status.block_height,
            block_time: tx.status.block_time,
            participants,
        } 
    }

    public async getTransactions(address: string): Promise<BTransaction[]> 
    {
        const response = await this._httpClient.get(`/address/${address}/txs`)
        const transactions: BTransaction[] = []
        for(let tx of response.data) 
        {
            const participants: BParticitant[] = []
            for(let vin of tx.vin) {
                participants.push({
                    type: "input",
                    txid: vin.txid,
                    vout: vin.vout,
                    address: vin.prevout.scriptpubkey_address,
                    value: vin.prevout.value
                })
            }
            for(let vout of tx.vout) {
                participants.push({
                    type: "output",
                    txid: tx.txid,
                    vout: tx.vout.indexOf(vout),
                    address: vout.scriptpubkey_address,
                    value: vout.value
                })
            }

            const receivedValue = tx.vout.filter((t: any) => t.scriptpubkey_address === address)
                .reduce((sum: any, t: any) => sum + t.value, 0)

            const sentValue = tx.vout.filter((t: any) => t.scriptpubkey_address !== address)
                .reduce((sum: any, t: any) => sum + t.value, 0)

            const isSent = !!participants.find(t => t.type == "input" && t.address == address)
            
            transactions.push({
                txid: tx.txid,
                fee: tx.fee,
                type: isSent ? "sent" : "received", 
                value: isSent ? sentValue : receivedValue, 
                confirmed: tx.status.confirmed,
                block_hash: tx.status.block_hash,
                block_height: tx.status.block_height,
                block_time: tx.status.block_time,
                participants
            })
        }
        return transactions
    }

    public async listTransactions(addrs: string[]): Promise<BTransaction[]> 
    {
        const results: BTransaction[] = []
        for (const address of addrs) {
            const txs = await this.getTransactions(address)
            results.push(...txs)
        }
        return results
    }

    public async pushTransaction(tx: string): Promise<string>
    {
        const response = await this._httpClient.post<string>("/tx", tx, {
            headers: {
                "Content-Type": "text/plain"
            }            
        })
        const txid = response.data 
        return txid
    }
    
    public async getFeesRecommended(): Promise<FeeRate> 
    {
        const response = await this._httpClient.get<FeeRate>("/v1/fees/recommended")
        return response.data
    }

    public async getBlockHeight(): Promise<number> 
    {
        const response = await this._httpClient.get<number>("/blocks/tip/height")
        return response.data
    }
}

export default MempoolService
