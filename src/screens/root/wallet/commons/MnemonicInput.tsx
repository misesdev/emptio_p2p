import theme from "@src/theme";
import { View, TextInput, StyleSheet } from "react-native"

type MnemonicInputProps = {
    value: string;
    placeholder: string;
    onChangeText: (value: string) => void;
}

const MnemonicInput = ({ value, placeholder, onChangeText }: MnemonicInputProps) => (
    <View style={styles.control}>
        <View style={styles.container}>
            <TextInput style={styles.input}
                placeholder={placeholder}
                onChangeText={onChangeText}
                placeholderTextColor={theme.input.placeholderColor}
                multiline
                numberOfLines={5}
                value={value}
                secureTextEntry={true}
                textContentType="none"
                autoComplete={"off"}
                autoCorrect={false}
                autoCapitalize="none"
                importantForAutofill="no"
                spellCheck={false}
            />
        </View>
    </View>
)


const styles = StyleSheet.create({
    control: { width: "100%", alignItems: "center", paddingVertical: 5 },
    container: { width: "100%", color: theme.colors.white, backgroundColor: theme.input.backGround, 
        borderRadius: theme.design.borderRadius, margin: 5 },
    input: { minHeight: 90, paddingVertical: 15, paddingHorizontal: 30,
        color: theme.input.textColor }
})

export default MnemonicInput
