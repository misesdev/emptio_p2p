import { useAccount } from "@src/context/AccountContext";
import { useService } from "@src/providers/ServiceProvider";
import { pushMessage } from "@services/notification";
import { HDWallet, MnemonicUtils } from "bitcoin-tx-lib";
import { useState } from "react";

const extendFormats = ["xpub", "xpri", "zpub", "zpri"]

type Props = {
    name: string;
    action: string;
    navigation: any;
}

const useImportWallet = ({ name, action, navigation }: Props) => {
    
    const { walletService } = useService()
    const { wallets, setWallets } = useAccount()
    const [disabled, setDisabled] = useState(true)
    const [mnemonic, setMnemonic] = useState("")
    const [wordCount, setWordCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState("")

    const setMnemonicValue = (value: string) => {
        const trimmed = value.trim()
        if(extendFormats.includes(trimmed.slice(0,4))) {
            return setDisabled(false)
        }
        const words = trimmed.split(" ")
        if(words.length == 12) {
            const isValid = MnemonicUtils.validateMnemonic(trimmed)
            if(!isValid) {
                setError("Frase mnemonica inválida")
            }
            setDisabled(!isValid)
        }
        if(words.length > 12) return;
        setWordCount(words.length)
        setMnemonic(value)
    }

    const continueToNetwork = async () => {
        setDisabled(true)
        const trimmed = mnemonic.trim()
        if(extendFormats.includes(trimmed.slice(0,4))) { 
            return await importFromDerivation(trimmed) 
        }
        if(trimmed.split(" ").length == 2) {
            navigation.navigate("wallet-passphrase", {
                action, name, mnemonic: trimmed
            })
        }
        setDisabled(false)
    }

    const importFromDerivation = async (input: string) => {
        setTimeout(async () => {
            setStatus("Derivando a master key bip39...")
            const { wallet } = HDWallet.import(input)
            setStatus("Criando a carteira HD bip39")
            const result = await walletService.add({
                masterKey: wallet.getMasterPrivateKey(),
                network: wallet.network,
                name
            })
            if(result.success && result.data) {
                setWallets([...wallets, result.data])
                navigation.reset({ 
                    routes: [{ name: "home" }], 
                    index: 0
                })
            }   
            if(!!result.success && result.message)
                pushMessage(result.message)
            setDisabled(false)
            setLoading(false)
        }, 20)
    }

    return {
        error,
        status,
        loading,
        disabled,
        wordCount,
        mnemonic,
        setMnemonicValue,
        continueToNetwork
    }
}

export default useImportWallet
