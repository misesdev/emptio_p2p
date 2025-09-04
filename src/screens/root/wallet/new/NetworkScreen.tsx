import { ButtonPrimary } from "@components/form/Buttons"
import { StyleSheet, View, Text } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useTranslateService } from "@src/providers/TranslateProvider"
import SplashScreen from "@components/general/SplashScreen"
import NetworkOption from "../commons/NetworkOption"
import useCreateWallet from "../hooks/useCreateWallet"
import { BNetwork } from "bitcoin-tx-lib"
import { useState } from "react"
import theme from "@src/theme"

const NetworkScreen = ({ navigation, route }: any) => {

    const { name, mnemonic, passphrase } = route.params
    const [network, setNetwork] = useState<BNetwork>("mainnet")
    const { useTranslate } = useTranslateService()

    const { loading, status, disabled, onCreate } = useCreateWallet({ 
        name, mnemonic, passphrase, network, navigation 
    })

    if(loading)
        return <SplashScreen message={status} />
    
    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {useTranslate("wallet.network.title")}
                    </Text>
                </View>
               
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description} >
                        {useTranslate("wallet.network.description")}
                    </Text>
                </View>

                <View style={styles.optionContent}>
                    <NetworkOption
                        title={useTranslate("wallet.network.mainnet.title")}
                        description={useTranslate("wallet.network.mainnet.description")}
                        chageNetwork={setNetwork}
                        networkOption="mainnet"
                        network={network} 
                    />
                    <NetworkOption
                        title={useTranslate("wallet.network.testnet.title")}
                        description={useTranslate("wallet.network.testnet.description")}
                        chageNetwork={setNetwork}
                        networkOption="testnet"
                        network={network} 
                    />
                </View>
            </View>

            <View style={styles.buttonArea}>
                <ButtonPrimary label={useTranslate("commons.continue")}
                    loading={loading}
                    disabled={disabled}
                    onPress={onCreate}
                />
            </View>
        </ScrollView>    
    )
}

const styles = StyleSheet.create({
    content: { width: "100%", paddingVertical: 50 },
    titleContainer: { width: "100%", padding: 10, paddingVertical: 10 },
    title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: theme.colors.white },
    descriptionContainer: { width: "100%", padding: 20 },
    description: { fontSize: 14, color: theme.colors.gray },
    optionContent: { width: "100%", padding: 10, marginVertical: 15 },
    buttonArea: { width: '100%', position: "absolute", bottom: 0, marginVertical: 20, 
        paddingHorizontal: 30 },
})

export default NetworkScreen
