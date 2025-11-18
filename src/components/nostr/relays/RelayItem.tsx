import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import { useTranslateService } from "@/src/providers/TranslateProvider"
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useService } from "@/src/providers/ServiceProvider"
import { useEffect, useState, useCallback, memo } from "react"
import theme from "@src/theme"
import axios from "axios"

interface RelayProps {
    relay: string;
    onDelete: (relay: string) => void;
}

interface RelayMetadata {
    name?: string;
    description?: string;
    contact?: string;
    supported_nips?: Array<string>;
    software?: string;
    version?: string;
}

export const RelayItem = memo(({ relay, onDelete }: RelayProps) => {
    const { relayService } = useService()
    const { useTranslate } = useTranslateService()
    const [metadata, setMetadata] = useState<RelayMetadata>()
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => { loadRelayData() }, [])

    const loadRelayData = useCallback(async () => {
        try {
            setLoading(true)
            const httpClient = axios.create({ headers: { Accept: "application/nostr+json" } })
            const response = await httpClient.get(relay.replace("wss", "https"))

            if (response.status === 200) {
                const data = response.data as RelayMetadata
                setMetadata(data)

                await relayService.update({
                    url: relay,
                    name: data.name,
                    contact: data.contact,
                    description: data.description,
                    supported_nips: data.supported_nips,
                    software: data.software,
                    version: data.version
                })
            }
        } catch {
            // Silently fail - relay metadata is optional
        } finally {
            setLoading(false)
        }
    }, [relay, relayService])

    const handleDelete = useCallback(() => {
        onDelete(relay)
    }, [relay, onDelete])

    const relayUrl = relay.replace(/^wss?:\/\//, '')

    return (
        <View style={styles.container}>
            {/* Header with name/url and delete button */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="server"
                        size={24}
                        color={theme.colors.white}
                    />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.relayName} numberOfLines={1}>
                        {metadata?.name ?? relayUrl}
                    </Text>
                    {metadata?.name && (
                        <Text style={styles.relayUrl} numberOfLines={1}>
                            {relayUrl}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    activeOpacity={.6}
                    onPress={handleDelete}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.red} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.gray} />
                    <Text style={styles.loadingText}>
                        {useTranslate("commons.loading") || "Carregando..."}
                    </Text>
                </View>
            ) : (
                <>
                    {/* Description */}
                    {metadata?.description && (
                        <View style={styles.section}>
                            <Text style={styles.description}>
                                {metadata.description}
                            </Text>
                        </View>
                    )}

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        {/* Contact */}
                        {metadata?.contact && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoLabel}>
                                    <Ionicons name="mail-outline" size={16} color={theme.colors.gray} />
                                    <Text style={styles.labelText}>Contact</Text>
                                </View>
                                <Text style={styles.infoValue} numberOfLines={1}>
                                    {metadata.contact}
                                </Text>
                            </View>
                        )}

                        {/* Software */}
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

                    {/* Supported NIPs */}
                    {metadata?.supported_nips && metadata.supported_nips.length > 0 && (
                        <View style={styles.nipsSection}>
                            <View style={styles.nipsSectionHeader}>
                                <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.white} />
                                <Text style={styles.nipsTitle}>
                                    {useTranslate("message.relay.supported_nips")}
                                </Text>
                                <View style={styles.nipsCount}>
                                    <Text style={styles.nipsCountText}>
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
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        width: "94%",
        marginVertical: 5,
        borderRadius: theme.design.borderRadius,
        backgroundColor: "rgba(0, 55, 55, .2)",
        overflow: "hidden"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, .1)"
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.blueOpacity,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    headerContent: {
        flex: 1,
        marginRight: 8
    },
    relayName: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2
    },
    relayUrl: {
        color: theme.colors.gray,
        fontSize: 12,
        fontWeight: "500"
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(193, 77, 69, .2)",
        justifyContent: "center",
        alignItems: "center"
    },
    loadingContainer: {
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    loadingText: {
        color: theme.colors.gray,
        fontSize: 14
    },
    section: {
        padding: 12,
        paddingTop: 8
    },
    description: {
        color: theme.colors.gray,
        fontSize: 14,
        lineHeight: 20
    },
    infoGrid: {
        paddingHorizontal: 12,
        gap: 8
    },
    infoRow: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, .05)"
    },
    infoLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4
    },
    labelText: {
        color: theme.colors.gray,
        fontSize: 12,
        fontWeight: "500",
        textTransform: "uppercase"
    },
    infoValue: {
        color: theme.colors.white,
        fontSize: 14,
        paddingLeft: 22
    },
    nipsSection: {
        padding: 12,
        paddingTop: 16
    },
    nipsSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 6
    },
    nipsTitle: {
        color: theme.colors.white,
        fontSize: 14,
        fontWeight: "600",
        flex: 1
    },
    nipsCount: {
        backgroundColor: theme.colors.blueOpacity,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10
    },
    nipsCountText: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: "bold"
    },
    nipsContainer: {
        flexDirection: "row",
        gap: 8,
        paddingVertical: 4
    },
    nipBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.design.borderRadius,
        backgroundColor: theme.colors.section,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, .1)"
    },
    nipText: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: "600"
    }
})
