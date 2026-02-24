import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native"
import SelectLanguageBox, { showSelectLanguage } from "@components/modal/SelectLanguageBox"
import { ProfilePicture } from "@components/nostr/user/ProfilePicture"
import { useTranslateService } from "@src/providers/TranslateProvider"
import Ionicons from 'react-native-vector-icons/Ionicons'
import MessageBox from "@components/general/MessageBox"
import { useAccount } from "@src/context/AccountContext"
import ShareAppBar from "./commons/ShareAppBar"
import useMenu from "./hooks/useMenu"
import theme from "@src/theme"

const UserMenuScreen = ({ navigation }: any) => {

    const { user } = useAccount()
    const {
        appVersion, poolstats, forceUpdate, setForceUpdate, shareVisible, setShareVisible,
        copyPublicKey, copySecretKey, deleteAccount
    } = useMenu()

    const { useTranslate } = useTranslateService()

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.topSpacer} />

                {/* Hero Profile Section */}
                <View style={styles.heroSection}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("manage-account")}
                        style={styles.profileTouchable}
                    >
                        <View style={styles.profileContainer}>
                            <View style={styles.profileGradientBorder}>
                                <View style={styles.profileInner}>
                                    <ProfilePicture user={user} size={110} />
                                </View>
                            </View>
                            <View style={styles.editBadge}>
                                <Ionicons name="create-outline" size={16} color={theme.colors.white} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>
                        {user?.display_name ?? user.name}
                    </Text>

                    <View style={styles.userBadge}>
                        <Ionicons name="at" size={12} color={theme.colors.gray} />
                        <Text style={styles.userBadgeText}>
                            {user?.name || 'user'}
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("friends-list")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(11, 97, 47, .3)' }]}>
                            <Ionicons name="people" color={theme.colors.green} size={24} />
                        </View>
                        <Text style={styles.quickActionTitle}>
                            {useTranslate("section.title.managefriends")}
                        </Text>
                        <Text style={styles.quickActionDesc}>
                            {useTranslate("section.description.managefriends")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        activeOpacity={0.7}
                        onPress={() => setShareVisible(true)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(24, 65, 73, .5)' }]}>
                            <Ionicons name="share-social" color={theme.colors.blue} size={24} />
                        </View>
                        <Text style={styles.quickActionTitle}>
                            {useTranslate("section.title.sharefriend")}
                        </Text>
                        <Text style={styles.quickActionDesc}>
                            {useTranslate("section.description.sharefriend")}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Account Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person-circle-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.cardTitle}>Conta</Text>
                    </View>
                    <MenuButton
                        icon="person-outline"
                        label={useTranslate("settings.account.edit")}
                        onPress={() => navigation.navigate("manage-account")}
                    />
                    <MenuButton
                        icon="key-outline"
                        label={useTranslate("settings.nostrkey.copy")}
                        onPress={copyPublicKey}
                    />
                    <MenuButton
                        icon="lock-closed-outline"
                        label={useTranslate("settings.secretkey.copy")}
                        onPress={copySecretKey}
                        showDivider={false}
                    />
                </View>

                {/* Settings Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="settings-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.cardTitle}>Configurações</Text>
                    </View>
                    <MenuButton
                        icon="language-outline"
                        label={useTranslate("settings.chooselanguage")}
                        onPress={showSelectLanguage}
                    />
                    <MenuButton
                        icon="globe-outline"
                        label={useTranslate("settings.relays")}
                        onPress={() => navigation.navigate("manage-relays")}
                        badge={
                            <View style={styles.relayBadge}>
                                <View style={[
                                    styles.relayStatusDot,
                                    { backgroundColor: poolstats?.connected > 0 ? theme.colors.green : theme.colors.gray }
                                ]} />
                                <Text style={styles.relayBadgeText}>
                                    {poolstats?.connected}/{poolstats?.total}
                                </Text>
                            </View>
                        }
                    />
                    <MenuButton
                        icon="shield-checkmark-outline"
                        label={useTranslate("settings.security")}
                        onPress={() => navigation.navigate("manage-security")}
                        showDivider={false}
                    />
                </View>

                {/* System Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.cardTitle}>Sistema</Text>
                    </View>
                    <MenuButton
                        icon="help-circle-outline"
                        label={useTranslate("settings.about")}
                        onPress={() => navigation.navigate("about")}
                    />
                    <MenuButton
                        icon="exit-outline"
                        label={useTranslate("commons.signout")}
                        onPress={deleteAccount}
                        textColor={theme.colors.red}
                        showDivider={false}
                    />
                </View>

                {/* Version Footer */}
                <View style={styles.versionContainer}>
                    <Ionicons name="code-slash-outline" size={14} color={theme.colors.gray} />
                    <Text style={styles.versionText}>
                        {useTranslate("commons.version")} {appVersion}
                    </Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <SelectLanguageBox forceUpdate={setForceUpdate} />
            <ShareAppBar visible={shareVisible} setVisible={setShareVisible} />
            <View key={forceUpdate}></View>
            <MessageBox />
        </View>
    )
}

// Menu Button Component
interface MenuButtonProps {
    icon: string
    label: string
    onPress: () => void
    badge?: React.ReactNode
    textColor?: string
    showDivider?: boolean
}

const MenuButton = ({ icon, label, onPress, badge, textColor, showDivider = true }: MenuButtonProps) => {
    return (
        <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.6}
            onPress={onPress}
        >
            <View style={styles.menuButtonContent}>
                <View style={styles.menuButtonLeft}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name={icon} size={20} color={theme.colors.white} />
                    </View>
                    <Text style={[styles.menuButtonText, textColor && { color: textColor }]}>
                        {label}
                    </Text>
                </View>
                <View style={styles.menuButtonRight}>
                    {badge}
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.gray} />
                </View>
            </View>
            {showDivider && <View style={styles.menuDivider} />}
        </TouchableOpacity>
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
    topSpacer: {
        height: 40
    },
    bottomSpacer: {
        height: 20
    },

    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 10
    },
    profileTouchable: {
        marginBottom: 16
    },
    profileContainer: {
        position: 'relative'
    },
    profileGradientBorder: {
        padding: 4,
        borderRadius: 65,
        backgroundColor: theme.colors.blueOpacity
    },
    profileInner: {
        borderRadius: 60,
        borderWidth: 3,
        borderColor: theme.colors.black,
        overflow: 'hidden'
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.black
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.white,
        marginBottom: 6,
        textAlign: 'center'
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, .5)'
    },
    userBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.gray
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        gap: 12,
        marginBottom: 20
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: 'rgba(0, 55, 55, .2)',
        borderRadius: theme.design.borderRadius,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, .05)'
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    quickActionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.white,
        textAlign: 'center',
        marginBottom: 4
    },
    quickActionDesc: {
        fontSize: 11,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 15
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

    // Menu Buttons
    menuButton: {
        paddingHorizontal: 16
    },
    menuButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14
    },
    menuButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1
    },
    menuIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, .05)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.white,
        flex: 1
    },
    menuButtonRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    menuDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, .05)',
        marginLeft: 68
    },

    // Relay Badge
    relayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, .3)'
    },
    relayStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    relayBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.white
    },

    // Version
    versionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 20,
        paddingVertical: 12
    },
    versionText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.gray
    }
})

export default UserMenuScreen
