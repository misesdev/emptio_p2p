import { HeaderScreen } from "@components/general/HeaderScreen"
import MessageBox, { showMessage } from "@components/general/MessageBox"
import Ionicons from "react-native-vector-icons/Ionicons"
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native"
import { ProfilePicture } from "@components/nostr/user/ProfilePicture"
import useNDKStore from "@services/zustand/useNDKStore"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { useService } from "@/src/providers/ServiceProvider"
import { Utilities } from "@/src/utils/Utilities"
import { User } from "@services/user/types/User"
import { ActivityIndicator } from "react-native-paper"
import { NDKRelay } from "@nostr-dev-kit/ndk-mobile"
import { pushMessage } from "@services/notification"
import { useEffect, useState, useCallback } from "react"
import theme from "@src/theme"
import axios from "axios"

interface RelayMetadata {
    name?: string;
    description?: string;
    contact?: string;
    supported_nips?: Array<string>;
    software?: string;
    version?: string;
    pubkey?: string;
}

const RelayScreen = ({ navigation, route }: any) => {
    const { ndk } = useNDKStore()
    const { userService, relayService } = useService()
    const relay = route.params.relay as NDKRelay
    const { useTranslate } = useTranslateService()
    const [connected, setConnected] = useState<boolean>(false)
    const [metadata, setMetadata] = useState<RelayMetadata>()
    const [loading, setLoading] = useState<boolean>(true)
    const [connecting, setConecting] = useState<boolean>(false)
    const [manteiner, setManteiner] = useState<User>()

    useEffect(() => {
        loadRelayData()
        setConnected(relay.connected)
    }, [])

    useEffect(() => {
        if (metadata?.pubkey && !manteiner?.pubkey) {
            userService.getUser(metadata.pubkey).then(setManteiner)
        }
    }, [metadata])

    const loadRelayData = useCallback(async () => {
        try {
            setLoading(true)
            const httpClient = axios.create({ headers: { Accept: "application/nostr+json" } })
            const response = await httpClient.get(relay.url.replace("wss", "https"))

            if (response.status === 200) {
                const data = response.data as RelayMetadata
                setMetadata(data)

                await relayService.update({
                    url: relay.url,
                    ...data
                })
            }
        } catch {
            pushMessage("Não foi possível obter os dados deste relay")
        } finally {
            setLoading(false)
        }
    }, [relay.url, relayService])

    const handleConnect = useCallback(async () => {
        setConecting(true)
        const ndkRelay = ndk.pool.getRelay(relay.url)

        ndkRelay?.connect()
            .then(() => {
                setConecting(false)
                setConnected(true)
                pushMessage("Relay conectado com sucesso")
            })
            .catch(() => {
                pushMessage(useTranslate("message.default_error"))
                setConecting(false)
            })

        setTimeout(() => setConecting(false), 3000)
    }, [relay.url, ndk, useTranslate])

    const handleDisconect = useCallback(async () => {
        const ndkRelay = ndk.pool.getRelay(relay.url)
        ndkRelay.disconnect()
        setConnected(false)
        pushMessage("Relay desconectado")
    }, [relay.url, ndk])

    const handleDelete = useCallback(() => {
        showMessage({
            title: useTranslate("message.relay.title_delete"),
            message: useTranslate("message.relay.confirm_delete"),
            action: {
                label: useTranslate("commons.delete"),
                onPress: async () => {
                    ndk.pool.removeRelay(relay.url)
                    await relayService.delete(relay.url)
                    pushMessage(useTranslate("message.relay.delete_success"))

                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: "home" },
                            { name: "user-menu" },
                            { name: "manage-relays" }
                        ]
                    })
                }
            }
        })
    }, [relay.url, ndk, relayService, useTranslate, navigation])

    const relayUrl = relay.url.replace(/^wss?:\/\//, '').replace(/\/$/, '')

    return (
        <View style={styles.container}>
            <HeaderScreen
                title={useTranslate("commons.relay") || "Relay"}
                onClose={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section with Icon and Status */}
                <View style={styles.heroSection}>
                    <View style={[
                        styles.heroIcon,
                        connected && styles.heroIconConnected
                    ]}>
                        <Ionicons
                            name="server"
                            size={48}
                            color={theme.colors.white}
                        />
                        <View style={[
                            styles.heroStatusDot,
                            { backgroundColor: connected ? theme.colors.green : theme.colors.gray }
                        ]} />
                    </View>

                    <Text style={styles.relayUrl} numberOfLines={2}>
                        {relayUrl}
                    </Text>

                    <View style={styles.statusBadge}>
                        <Ionicons
                            name="ellipse"
                            size={10}
                            color={connected ? theme.colors.green : theme.colors.gray}
                        />
                        <Text style={[
                            styles.statusText,
                            { color: connected ? theme.colors.green : theme.colors.gray }
                        ]}>
                            {connected ? "Conectado" : "Desconectado"}
                        </Text>
                    </View>

                    {!loading && metadata?.description && (
                        <Text style={styles.description}>
                            {metadata.description}
                        </Text>
                    )}
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.white} />
                        <Text style={styles.loadingText}>
                            Carregando informações do relay...
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Maintainer Card */}
                        {manteiner?.pubkey && (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={theme.colors.white}
                                    />
                                    <Text style={styles.cardTitle}>Mantenedor</Text>
                                </View>
                                <View style={styles.maintainerContent}>
                                    <ProfilePicture user={manteiner} size={80} />
                                    <View style={styles.maintainerInfo}>
                                        <Text style={styles.maintainerName}>
                                            {Utilities.getUserName(manteiner, 25)}
                                        </Text>
                                        <Text style={styles.maintainerPubkey}>
                                            {Utilities.getDisplayPubkey(manteiner.pubkey ?? "", 20)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Relay Info Card */}
                        {(metadata?.name || metadata?.contact || metadata?.software || metadata?.version) && (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="information-circle-outline"
                                        size={20}
                                        color={theme.colors.white}
                                    />
                                    <Text style={styles.cardTitle}>Informações</Text>
                                </View>

                                {metadata?.name && (
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoLabel}>
                                            <Ionicons name="bookmark-outline" size={16} color={theme.colors.gray} />
                                            <Text style={styles.labelText}>
                                                {useTranslate("commons.name")}
                                            </Text>
                                        </View>
                                        <Text style={styles.infoValue}>{metadata.name}</Text>
                                    </View>
                                )}

                                {metadata?.contact && (
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoLabel}>
                                            <Ionicons name="mail-outline" size={16} color={theme.colors.gray} />
                                            <Text style={styles.labelText}>Contato</Text>
                                        </View>
                                        <Text style={styles.infoValue} numberOfLines={1}>
                                            {metadata.contact}
                                        </Text>
                                    </View>
                                )}

                                {metadata?.software && (
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoLabel}>
                                            <Ionicons name="code-outline" size={16} color={theme.colors.gray} />
                                            <Text style={styles.labelText}>Software</Text>
                                        </View>
                                        <Text style={styles.infoValue}>
                                            {metadata.software}
                                            {metadata.version && ` v${metadata.version}`}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Supported NIPs Card */}
                        {metadata?.supported_nips && metadata.supported_nips.length > 0 && (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={20}
                                        color={theme.colors.white}
                                    />
                                    <Text style={styles.cardTitle}>
                                        {useTranslate("message.relay.supported_nips")}
                                    </Text>
                                    <View style={styles.nipCount}>
                                        <Text style={styles.nipCountText}>
                                            {metadata.supported_nips.length}
                                        </Text>
                                    </View>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.nipsContainer}
                                >
                                    {metadata.supported_nips.map((nip, index) => (
                                        <View key={index} style={styles.nipBadge}>
                                            <Text style={styles.nipText}>{nip}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonArea}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.deleteButtonText}>
                        {useTranslate("commons.remove")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.connectButton,
                        connected && styles.disconnectButton
                    ]}
                    onPress={connected ? handleDisconect : handleConnect}
                    disabled={connecting}
                    activeOpacity={0.7}
                >
                    {connecting ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                        <>
                            <Ionicons
                                name={connected ? "close-circle-outline" : "flash-outline"}
                                size={20}
                                color={theme.colors.white}
                            />
                            <Text style={styles.connectButtonText}>
                                {connected ? "Desconectar" : "Conectar"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <MessageBox />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.black
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingBottom: 120
    },
    heroSection: {
        alignItems: "center",
        paddingVertical: 30,
        paddingHorizontal: 20
    },
    heroIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.blueOpacity,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        position: "relative"
    },
    heroIconConnected: {
        backgroundColor: "rgba(11, 97, 47, .3)"
    },
    heroStatusDot: {
        position: "absolute",
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 3,
        borderColor: theme.colors.black
    },
    relayUrl: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
        paddingHorizontal: 20
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(0, 0, 0, .5)",
        marginBottom: 16
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600"
    },
    description: {
        color: theme.colors.gray,
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 10
    },
    loadingContainer: {
        paddingVertical: 50,
        alignItems: "center",
        gap: 16
    },
    loadingText: {
        color: theme.colors.gray,
        fontSize: 14
    },
    card: {
        marginHorizontal: 15,
        marginVertical: 8,
        padding: 16,
        borderRadius: theme.design.borderRadius,
        backgroundColor: "rgba(0, 55, 55, .2)"
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, .1)"
    },
    cardTitle: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: "600",
        flex: 1
    },
    maintainerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    maintainerInfo: {
        flex: 1,
        gap: 6
    },
    maintainerName: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: "700"
    },
    maintainerPubkey: {
        color: theme.colors.gray,
        fontSize: 13,
        fontWeight: "500"
    },
    infoRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, .05)"
    },
    infoLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6
    },
    labelText: {
        color: theme.colors.gray,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase"
    },
    infoValue: {
        color: theme.colors.white,
        fontSize: 15,
        paddingLeft: 24
    },
    nipCount: {
        backgroundColor: theme.colors.blueOpacity,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    nipCountText: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: "700"
    },
    nipsContainer: {
        flexDirection: "row",
        gap: 8,
        paddingVertical: 4
    },
    nipBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.design.borderRadius,
        backgroundColor: theme.colors.section,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, .1)"
    },
    nipText: {
        color: theme.colors.white,
        fontSize: 13,
        fontWeight: "600"
    },
    bottomSpacing: {
        height: 20
    },
    buttonArea: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 15,
        paddingVertical: 20,
        backgroundColor: theme.colors.black,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, .1)"
    },
    deleteButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: theme.design.borderRadius,
        backgroundColor: "rgba(193, 77, 69, .2)",
        borderWidth: 1,
        borderColor: theme.colors.red
    },
    deleteButtonText: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: "700"
    },
    connectButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: theme.design.borderRadius,
        backgroundColor: theme.colors.green,
        borderWidth: 1,
        borderColor: theme.colors.green
    },
    disconnectButton: {
        backgroundColor: "rgba(130, 139, 143, .3)",
        borderColor: theme.colors.gray
    },
    connectButtonText: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: "700"
    }
})

export default RelayScreen
