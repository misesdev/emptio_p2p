import { StyleSheet, View, Text } from "react-native"
import { ButtonPrimary } from "@components/form/Buttons"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { ScrollView } from "react-native-gesture-handler"
import useImportWallet from "../hooks/useImportWallet"
import MnemonicInput from "../commons/MnemonicInput"
import theme from "@src/theme"

const ImportationScreen = ({ navigation, route }: any) => {

    const { action, name } = route.params
    const { useTranslate } = useTranslateService()

    const { 
        error, wordCount, disabled, mnemonic,
        setMnemonicValue, continueToNetwork
    } = useImportWallet({ 
        name, action, navigation 
    })

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {useTranslate("wallet.import.title")} 
                    </Text>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description} >
                        {useTranslate("wallet.import.description")} 
                    </Text>
                    {error && 
                        <Text style={styles.errorMessage}>{error}</Text>
                    }
                </View>
               
                <View style={{ paddingHorizontal: 10 }}>
                    <MnemonicInput  
                        value={mnemonic}
                        placeholder={useTranslate("wallet.mnemonic.placeholder")}
                        onChangeText={setMnemonicValue}                 
                    />
                    {wordCount > 1 &&
                        <Text style={styles.wordCount}>{wordCount}/12</Text>
                    }
                </View>
            </View>

            <View style={styles.buttonArea}>
                <ButtonPrimary 
                    disabled={disabled} 
                    label={useTranslate("commons.continue")} 
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
    errorMessage: { color: theme.colors.red, fontSize: 14, marginTop: 5, textAlign: "center" },
    buttonArea: { width: "100%", position: "absolute", bottom: 0, paddingVertical: 16, 
        paddingHorizontal: 30 },
    wordCount: { marginHorizontal: 10, fontSize: 14, color: theme.colors.gray }
})

export default ImportationScreen
