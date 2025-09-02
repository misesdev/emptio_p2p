import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useTranslateService } from "@src/providers/TranslateProvider"
import MnemonicWord from "../commons/MnemonicWord"
import { ButtonPrimary } from "@components/form/Buttons"
import useConfirmMnemonic from "../hooks/useConfirmMnemonic"
import theme from "@src/theme"

const ConfirmMnemonicScreen = ({ navigation, route }: any) => {

    const { action, name, mnemonic } = route.params

    const { error, disabled, selectedWords, onSelectWord } = useConfirmMnemonic({ mnemonic })
    const { useTranslate } = useTranslateService()

    const continueToPassPhrase = () => {
        navigation.navigate("wallet-passphrase", {
            action, name, mnemonic: mnemonic.join(" ")
        })
    }

    return (
        <ScrollView contentContainerStyle={theme.styles.scroll_container}>

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                       {useTranslate("wallet.mnemonic.confirm.title")} 
                    </Text>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                       {useTranslate("wallet.mnemonic.confirm.description")} 
                    </Text>
                </View>

                <View style={styles.wordList}>
                    <View style={{ width: "50%", padding: 8 }}>
                        {selectedWords.slice(0,6).map(item => {
                            const backgroundColor = item.wrong ? theme.colors.red : theme.colors.white
                            return <MnemonicWord
                                key={item.word}
                                word={item.word}
                                position={item.position}
                                onPress={() => onSelectWord(item)}
                                backgroundColor={backgroundColor}
                            />
                        })}
                    </View>
                    <View style={{ width: "50%", padding: 8 }}>
                        {selectedWords.slice(6,12).map(item => {
                            const backgroundColor = item.wrong ? theme.colors.red : theme.colors.white
                            return <MnemonicWord
                                key={item.word}
                                word={item.word}
                                position={item.position}
                                onPress={() => onSelectWord(item)}
                                backgroundColor={backgroundColor}
                            />
                        })}
                    </View>
                </View>
            </View>
                    
            {error && <Text style={styles.errorMessage}>{error}</Text>}

            <View style={styles.buttonArea}>
                <ButtonPrimary
                    disabled={disabled}
                    label={useTranslate("commons.continue")}
                    onPress={continueToPassPhrase}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    content: { width: "100%", paddingVertical: 50 },
    titleContainer: { padding: 10, marginVertical: 10 },
    title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: theme.colors.white },
    descriptionContainer: { padding: 20 },
    description: { fontSize: 14, color: theme.colors.gray, textAlign: "center" },
    errorMessage: { color: theme.colors.red, fontSize: 14, marginTop: 5, textAlign: "center" },
    selectedArea: { flexDirection: "row", flexWrap: "wrap", padding: 10, minHeight: 80,
        backgroundColor: theme.colors.matteBlack, borderRadius: theme.design.borderRadius, 
        marginVertical: 15 },
    wordList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: 10 },
    buttonArea: { width: '100%', position: "absolute", bottom: 0, marginVertical: 20, 
        paddingHorizontal: 30 },
})

export default ConfirmMnemonicScreen
