import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { ButtonPrimary } from "@components/form/Buttons"
import MnemonicWord from "../commons/MnemonicWord"
import theme from "@src/theme"

const MnemonicScreen = ({ navigation, route }: any) => {

    const { useTranslate } = useTranslateService()
    const { action, name, network, mnemonic } = route.params

    const continueToConfirmation = () => {
        navigation.navigate("confirmation-mnemonic", {
            action, name, network, mnemonic
        })
    }

    return (
        <ScrollView contentContainerStyle={theme.styles.scroll_container}>
           
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {useTranslate("wallet.mnemonic.title")}  
                    </Text>
                </View>
                    
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description} >
                        {useTranslate("wallet.mnemonic.description")}  
                    </Text>
                </View>

                <View style={styles.mnemonicArea}>
                    <View style={{ width: "50%", padding: 8 }}>
                        {mnemonic && (mnemonic as string[]).slice(0, 6)
                            .map((word, index) => { 
                                return <MnemonicWord key={word} word={word} position={index + 1} />
                            })
                        }
                    </View>
                    <View style={{ width: "50%", padding: 8 }}>
                        {mnemonic && (mnemonic as string[]).slice(6, 12)
                            .map((word, index) => {
                                return <MnemonicWord key={word} word={word} position={index + 7} />
                            })
                        }
                    </View>
                </View>
            </View>

            <View style={styles.buttonArea}>
                <ButtonPrimary 
                    label={useTranslate("commons.noted")}
                    onPress={continueToConfirmation} 
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    content: { width: "100%", paddingVertical: 50 },
    titleContainer: { width: "100%", padding: 10, paddingVertical: 10 },
    title: { fontSize: 32, fontWeight: "bold", textAlign: "center", 
        color: theme.colors.white },
    descriptionContainer: { width: "100%", padding: 20 },
    description: { fontSize: 14, color: theme.colors.gray },
    mnemonicArea: { width: "100%", marginVertical: 20, flexDirection: "row" },
    buttonArea: { width: '100%', position: "absolute", bottom: 0, marginVertical: 20, 
        paddingHorizontal: 30  },
})

export default MnemonicScreen
