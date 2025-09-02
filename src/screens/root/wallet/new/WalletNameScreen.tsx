import { StyleSheet, View, Text } from "react-native"
import { FormControl } from "@components/form/FormControl"
import { ButtonPrimary } from "@components/form/Buttons"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { ScrollView } from "react-native-gesture-handler"
import { useService } from "@src/providers/ServiceProvider"
import { useEffect, useState } from "react"
import theme from "@src/theme"

const WalletNameScreen = ({ navigation, route }: any) => {

    const { action } = route.params
    const { useTranslate } = useTranslateService()
    const [disabled, setDisabled] = useState(true)
    const [name, setName] = useState<string>("")
    const { walletFactory } = useService()

    useEffect(() => setDisabled(name.length <= 2), [name])

    const continueToMnemonic = () => {
        setDisabled(true)
        if(action=="create") {
            const mnemonic = walletFactory.generateMnemonic()
            navigation.navigate("wallet-mnemonic", { 
                name: name.trim(),
                mnemonic: mnemonic.split(" "),
                action
            })
        } 
        else if(action=="import") {
            navigation.navigate("import-wallet", {
                action, name
            })
        }
        setDisabled(false)
    }

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {useTranslate("wallet.name.title")}
                    </Text>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description} >
                        {useTranslate("wallet.name.description")}
                    </Text>
                </View>

                <FormControl  
                    value={name} 
                    onChangeText={setName}                 
                    label={useTranslate("wallet.labels.name")}
                />
            </View>

            <View style={styles.buttonArea}>
                <ButtonPrimary 
                    disabled={disabled} 
                    label={useTranslate("commons.continue")} 
                    onPress={continueToMnemonic} 
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
