import OptionButtonScreen from "@components/form/OptionButtonScreen";
import ModalBottom, { closeModalBottom, showModalBottom } from "@components/modal/ModalBottom"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { View, StyleSheet } from "react-native";

var showNewWalletFunction: () => void;

type NewWalletModalProps = {
    navigation: any;
}

const NewWalletModal = ({ navigation }: NewWalletModalProps) => {
   
    showNewWalletFunction = showModalBottom;
    const { useTranslate } = useTranslateService()

    const onCreate = () => {
        closeModalBottom()
        navigation.navigate("new-wallet", { action: "create" })
    }

    const onImport = () => { 
        closeModalBottom()
        navigation.navigate("new-wallet", { action: "import" })
    }

    return (
        <ModalBottom heightPercent={48}
            title={useTranslate("screen.title.addwallet")}
        >
            <View style={styles.content}>
                <OptionButtonScreen 
                    icon="duplicate" 
                    onPress={onCreate}
                    label={useTranslate("commons.create")}
                    description={useTranslate("wallet.create.label")}
                />
                <OptionButtonScreen 
                    icon="key"
                    onPress={onImport}
                    label={useTranslate("commons.import")}
                    description={useTranslate("wallet.import.label")}
                />
            </View>
        </ModalBottom>
    )
}

export const showNewWaleltModal = () => {
    showNewWalletFunction()
}

const styles = StyleSheet.create({
    content: { width: "100%", alignItems: "center", marginVertical: 10 } 
})

export default NewWalletModal
