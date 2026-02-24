import { StyleSheet, View, TouchableOpacity, Image, Text } from "react-native"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { useAccount } from "@src/context/AccountContext"
import { ButtonSuccess } from "@components/form/Buttons"
import { FormControl } from "@components/form/FormControl"
import { ScrollView } from "react-native-gesture-handler"
import Ionicons from 'react-native-vector-icons/Ionicons'
import useUpdateUser from "../hooks/useUpdateUser"
import theme from "@src/theme"
import { useState } from "react"

const UserEditScreen = () => {

    const { useTranslate } = useTranslateService()
    const { user, setUser } = useAccount()
    const [pictureError, setPictureError] = useState(false)
    const {
        name, setName, profileColor, profileUri, bannerUri,
        about, setAbout, website, setWebsite, lnAddress, setLnAddress,
        loading, disabled, pickImage, onSave
    } = useUpdateUser({ user, setUser })

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Banner Section */}
                <View style={styles.bannerContainer}>
                    <View style={styles.banner}>
                        {bannerUri ? (
                            <Image
                                style={styles.bannerImage}
                                source={{ uri: bannerUri }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.bannerPlaceholder}>
                                <Ionicons name="image-outline" size={48} color={theme.colors.gray} />
                                <Text style={styles.bannerPlaceholderText}>
                                    {useTranslate("labels.banner") || "Banner"}
                                </Text>
                            </View>
                        )}
                        <View style={styles.bannerOverlay} />
                    </View>
                    <TouchableOpacity
                        onPress={() => pickImage("banner")}
                        style={styles.bannerEditButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="camera" color={theme.colors.white} size={20} />
                        <Text style={styles.bannerEditText}>
                            {bannerUri ? "Alterar banner" : "Adicionar banner"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Picture Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => pickImage("profile")}
                        style={styles.profileTouchable}
                    >
                        <View style={styles.profileContainer}>
                            <View style={[styles.profileBorder, { borderColor: profileColor || theme.colors.blueOpacity }]}>
                                <View style={styles.profileImageContainer}>
                                    <Image
                                        style={styles.profileImage}
                                        onError={() => setPictureError(true)}
                                        source={(pictureError || !profileUri)
                                            ? require("@assets/images/defaultProfile.png")
                                            : { uri: profileUri }
                                        }
                                    />
                                </View>
                            </View>
                            <View style={styles.profileEditBadge}>
                                <Ionicons name="camera-outline" size={18} color={theme.colors.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Personal Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.cardTitle}>Informações Pessoais</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <FormControl
                            value={name}
                            onChangeText={setName}
                            label={useTranslate("labels.username")}
                            fullScreen
                        />
                        <View style={styles.fieldSpacer} />
                        <FormControl
                            isTextArea
                            value={about}
                            onChangeText={setAbout}
                            label={useTranslate("labels.about")}
                            fullScreen
                        />
                    </View>
                </View>

                {/* Contact Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="link-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.cardTitle}>Contato e Links</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <FormControl
                            value={website}
                            onChangeText={setWebsite}
                            label={useTranslate("labels.mywebsite")}
                            fullScreen
                        />
                        <View style={styles.fieldSpacer} />
                        <FormControl
                            value={lnAddress}
                            onChangeText={setLnAddress}
                            label={useTranslate("labels.lnaddress")}
                            fullScreen
                        />
                    </View>
                </View>

                {/* Save Button */}
                <View style={styles.buttonContainer}>
                    <ButtonSuccess
                        label={useTranslate("commons.save")}
                        onPress={onSave}
                        disabled={disabled}
                        loading={loading}
                        leftIcon="checkmark-circle-outline"
                        style={styles.saveButton}
                    />
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.black
    },
    scrollContent: {
        paddingBottom: 30
    },

    // Banner Section
    bannerContainer: {
        width: '100%',
        height: 200,
        marginBottom: 70,
        position: 'relative'
    },
    banner: {
        width: '100%',
        height: 200,
        backgroundColor: theme.colors.section,
        position: 'relative',
        overflow: 'hidden'
    },
    bannerImage: {
        width: '100%',
        height: '100%'
    },
    bannerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    bannerPlaceholderText: {
        fontSize: 14,
        color: theme.colors.gray,
        fontWeight: '500'
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, .2)'
    },
    bannerEditButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 0, 0, .7)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.design.borderRadius,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, .2)'
    },
    bannerEditText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.white
    },

    // Profile Section
    profileSection: {
        alignItems: 'center',
        marginTop: -80,
        marginBottom: 30,
        zIndex: 10
    },
    profileTouchable: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    profileContainer: {
        position: 'relative'
    },
    profileBorder: {
        padding: 5,
        borderRadius: 70,
        backgroundColor: theme.colors.black,
        borderWidth: 4
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: theme.colors.section
    },
    profileImage: {
        width: '100%',
        height: '100%'
    },
    profileEditBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: theme.colors.black
    },

    // Cards
    card: {
        marginHorizontal: 15,
        marginVertical: 8,
        borderRadius: theme.design.borderRadius,
        backgroundColor: 'rgba(0, 55, 55, .2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, .05)',
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, .08)'
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.white,
        flex: 1
    },
    cardContent: {
        padding: 8
    },
    fieldSpacer: {
        height: 8
    },

    // Button
    buttonContainer: {
        paddingHorizontal: 15,
        marginTop: 20
    },
    saveButton: {
        width: '100%',
        margin: 0,
        maxWidth: '100%',
        paddingVertical: 16
    },

    // Spacing
    bottomSpacer: {
        height: 20
    }
})

export default UserEditScreen
