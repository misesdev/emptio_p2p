import { StyleSheet, View, Text } from "react-native"
import { FormControl } from "@components/form/FormControl"
import { ButtonPrimary } from "@components/form/Buttons"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { ScrollView } from "react-native-gesture-handler"
import { useEffect, useState } from "react"
import theme from "@src/theme"

const WalletNameScreen = ({ navigation, route }: any) => {

    const { action, name, mnemonic } = route.params
    const { useTranslate } = useTranslateService()
    const [passphrase, setPassprase] = useState<string>("")
    const [buttonLabel, setButtonLabel] = useState("")

    useEffect(() => {
        if(passphrase.length <= 0)
            setButtonLabel(useTranslate("wallet.passphrase.continue"))
        else if(passphrase.length == 1)
            setButtonLabel(useTranslate("commons.continue"))
    }, [passphrase])

    const continueToNetwork = () => {
        navigation.navigate("wallet-network", { 
            action, name, mnemonic, passphrase
        })
    }

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {useTranslate("wallet.passphrase.title")}
                    </Text>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                        {useTranslate("wallet.passphrase.description")}
                    </Text>
                </View>

                <FormControl  
                    value={passphrase} 
                    onChangeText={setPassprase}                 
                    label={"Sua passphrase"}
                />
            </View>

            <View style={styles.buttonArea}>
                <ButtonPrimary 
                    label={buttonLabel} 
                    onPress={continueToNetwork} 
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    content: { width: "100%", paddingVertical: 50 },
    titleContainer: { padding: 10, paddingVertical: 10 },
    title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: theme.colors.white },
    descriptionContainer: { width: "100%", padding: 20, marginVertical: 10 },
    description: { fontSize: 14, color: theme.colors.gray },
    buttonArea: { width: "100%", position: "absolute", bottom: 0, paddingVertical: 16, 
        paddingHorizontal: 20 }
})

export default WalletNameScreen
