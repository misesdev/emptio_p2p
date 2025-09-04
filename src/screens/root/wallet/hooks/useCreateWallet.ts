import { useTranslateService } from "@src/providers/TranslateProvider";
import { pushMessage } from "@services/notification";
import { useService } from "@src/providers/ServiceProvider";
import { useAccount } from "@src/context/AccountContext";
import { BNetwork } from "bitcoin-tx-lib";
import { useState } from "react";

type Props = {
    name: string;
    mnemonic: string;
    passphrase: string;
    network: BNetwork;
    navigation: any;
}

const useCreateWallet = ({ 
    name, mnemonic, passphrase, network, navigation 
}: Props) => {
    const { wallets, setWallets } = useAccount()
    const { useTranslate } = useTranslateService()
    const { walletFactory, walletService } = useService()
    const [disabled, setDisabled] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [status, setStatus] = useState("")

    const onCreate = async () => {
        setLoading(true)
        setDisabled(true)
        setTimeout(async () => {
            setStatus("Derivando a chave mestra a partir das 12 palavras e a passphrase(bip39)...")
            const masterKey = await walletFactory.create({ 
                mnemonic, passphrase, network 
            })
            setStatus("Salvando a carteira em formato criptografado...")
            const result = await walletService.add({ name, masterKey, network })
            if(result.success && result.data) 
            {
                setWallets([...wallets, result.data])
                navigation.reset({ 
                    routes: [{ name: "home" }], 
                    index: 0
                })
            }   
            if(!!result.success && result.message)
                pushMessage(useTranslate("message.default_error"))
            setDisabled(false)
            setLoading(false)
        }, 10)
    }

    return {
        onCreate,
        disabled,
        loading,
        status
    }
}

export default useCreateWallet
