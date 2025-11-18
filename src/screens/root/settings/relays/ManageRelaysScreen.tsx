import { StyleSheet, View, ScrollView, Text } from "react-native"
import { HeaderScreen } from "@components/general/HeaderScreen"
import { ButtonPrimary } from "@components/form/Buttons"
import { StackScreenProps } from "@react-navigation/stack"
import useNDKStore from "@services/zustand/useNDKStore"
import { useTranslateService } from "@src/providers/TranslateProvider"
import { SectionHeader } from "@components/general/section/headers"
import useRelaySettings from "../hooks/useRelaySettings"
import { RelayList } from "./commons/RelayList"
import Ionicons from "react-native-vector-icons/Ionicons"
import theme from "@src/theme"

const ManageRelaysScreen = ({ navigation }: StackScreenProps<any>) => {
    const { ndk } = useNDKStore()
    const { useTranslate } = useTranslateService()
    const { relayData, openRelay } = useRelaySettings({ navigation })

    const hasRelays = ndk.pool.relays.size > 0
    const connectedCount = relayData?.connected.length || 0
    const disconnectedCount = relayData?.disconected.length || 0

    return (
        <View style={styles.container}>
            <HeaderScreen
                title={useTranslate("settings.relays")}
                onClose={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {!hasRelays ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons
                                name="server-outline"
                                size={64}
                                color={theme.colors.gray}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {useTranslate("message.relay.empty")}
                        </Text>
                        <Text style={styles.emptyDescription}>
                            Adicione relays para conectar-se à rede Nostr
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Connected Relays Section */}
                        {relayData && connectedCount > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderContainer}>
                                    <SectionHeader
                                        label={useTranslate("labels.relays.connecteds")}
                                    />
                                    <View style={styles.countBadge}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={14}
                                            color={theme.colors.green}
                                        />
                                        <Text style={styles.countText}>{connectedCount}</Text>
                                    </View>
                                </View>
                                <RelayList relays={relayData.connected} onPressRelay={openRelay} />
                            </View>
                        )}

                        {/* Disconnected Relays Section */}
                        {relayData && disconnectedCount > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderContainer}>
                                    <SectionHeader
                                        label={useTranslate("labels.relays.disconnecteds")}
                                    />
                                    <View style={[styles.countBadge, styles.countBadgeDisconnected]}>
                                        <Ionicons
                                            name="close-circle"
                                            size={14}
                                            color={theme.colors.gray}
                                        />
                                        <Text style={[styles.countText, { color: theme.colors.gray }]}>
                                            {disconnectedCount}
                                        </Text>
                                    </View>
                                </View>
                                <RelayList relays={relayData.disconected} onPressRelay={openRelay} />
                            </View>
                        )}

                        {/* Stats Summary */}
                        {hasRelays && (
                            <View style={styles.statsContainer}>
                                <View style={styles.statCard}>
                                    <Ionicons
                                        name="pulse-outline"
                                        size={24}
                                        color={theme.colors.green}
                                    />
                                    <View style={styles.statContent}>
                                        <Text style={styles.statValue}>{connectedCount}</Text>
                                        <Text style={styles.statLabel}>Conectados</Text>
                                    </View>
                                </View>
                                <View style={styles.statCard}>
                                    <Ionicons
                                        name="server-outline"
                                        size={24}
                                        color={theme.colors.white}
                                    />
                                    <View style={styles.statContent}>
                                        <Text style={styles.statValue}>
                                            {ndk.pool.relays.size}
                                        </Text>
                                        <Text style={styles.statLabel}>Total</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            <View style={styles.buttonArea}>
                <ButtonPrimary
                    label={useTranslate("labels.relays.add")}
                    onPress={() => navigation.navigate("add-relay")}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        marginTop: 100
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(0, 55, 55, .2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24
    },
    emptyTitle: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        textAlign: "center"
    },
    emptyDescription: {
        color: theme.colors.gray,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20
    },
    section: {
        marginTop: 10
    },
    sectionHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 8
    },
    countBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "rgba(11, 97, 47, .2)"
    },
    countBadgeDisconnected: {
        backgroundColor: "rgba(130, 139, 143, .2)"
    },
    countText: {
        color: theme.colors.green,
        fontSize: 13,
        fontWeight: "700"
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 15,
        gap: 12,
        marginTop: 20
    },
    statCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: theme.design.borderRadius,
        backgroundColor: "rgba(0, 55, 55, .2)",
        gap: 12
    },
    statContent: {
        flex: 1
    },
    statValue: {
        color: theme.colors.white,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 2
    },
    statLabel: {
        color: theme.colors.gray,
        fontSize: 12,
        fontWeight: "500"
    },
    bottomSpacing: {
        height: 100
    },
    buttonArea: {
        width: "100%",
        position: "absolute",
        alignItems: "center",
        bottom: 30
    }
})

export default ManageRelaysScreen
