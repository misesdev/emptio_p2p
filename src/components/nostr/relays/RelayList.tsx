import { View, FlatList, TouchableOpacity, StyleSheet, Text } from "react-native"
import { useTranslateService } from "@src/providers/TranslateProvider"
import Ionicons from "react-native-vector-icons/Ionicons"
import { ProfilePicture } from "@components/nostr/user/ProfilePicture"
import { NostrRelay } from "@services/relays/types/NostrRelay"
import { Utilities } from "@src/utils/Utilities"
import { useCallback, memo } from "react"
import theme from "@src/theme"

interface RelayItemProps {
    relay: NostrRelay;
    onPressRelay: (relay: NostrRelay) => void;
}

export const RelayItem = memo(({ relay, onPressRelay }: RelayItemProps) => {
    const handlePress = () => onPressRelay(relay)

    return (
        <TouchableOpacity
            activeOpacity={.6}
            style={styles.sectionRelay}
            onPress={handlePress}
        >
            {/* Relay Icon */}
            <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="server-outline" size={24} color={theme.colors.white} />
                </View>
            </View>

            {/* Relay Info */}
            <View style={styles.contentContainer}>
                {/* Relay URL */}
                <Text style={styles.relayUrl} numberOfLines={1} ellipsizeMode="middle">
                    {relay.url.replace(/^wss?:\/\//, '')}
                </Text>

                {/* Relay Description */}
                {relay.description && (
                    <Text style={styles.relayDescription} numberOfLines={2}>
                        {relay.description}
                    </Text>
                )}

                {/* Relay Software Info */}
                {(relay.software || relay.version) && (
                    <View style={styles.softwareContainer}>
                        <Ionicons name="code-outline" size={12} color={theme.colors.gray} />
                        <Text style={styles.softwareText}>
                            {relay.software}{relay.version ? ` v${relay.version}` : ''}
                        </Text>
                    </View>
                )}

                {/* Relay Maintainer/Author */}
                {relay.author && (
                    <View style={styles.authorContainer}>
                        <ProfilePicture user={relay.author} size={24} withBorder={false} />
                        <View style={styles.authorInfo}>
                            <Text style={styles.authorLabel}>Mantido por:</Text>
                            <Text style={styles.authorName} numberOfLines={1}>
                                {Utilities.getUserName(relay.author, 20)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Arrow Icon */}
            <View style={styles.arrowContainer}>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.gray}
                />
            </View>
        </TouchableOpacity>
    )
})

interface Props {
    relays: NostrRelay[];
    onPressRelay: (relay: NostrRelay) => void;
}

export const RelayList = ({ relays, onPressRelay }: Props) => {
    const { useTranslate } = useTranslateService()

    const renderItem = useCallback(({ item }: { item: NostrRelay }) => {
        return <RelayItem relay={item} onPressRelay={onPressRelay} />
    }, [onPressRelay])

    const keyExtractor = useCallback((item: NostrRelay) => item.url, [])

    const EmptyComponent = useCallback(() => {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name="server-outline"
                    size={48}
                    color={theme.colors.gray}
                />
                <Text style={styles.emptyText}>
                    {useTranslate("message.relay.empty")}
                </Text>
            </View>
        )
    }, [useTranslate])

    return (
        <View style={styles.container}>
            <FlatList
                data={relays}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={EmptyComponent}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    listContent: {
        flexGrow: 1
    },
    sectionRelay: {
        width: "100%",
        minHeight: 80,
        borderRadius: theme.design.borderRadius,
        marginVertical: 5,
        flexDirection: "row",
        backgroundColor: theme.colors.blueOpacity,
        overflow: "hidden",
        padding: 12
    },
    iconContainer: {
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.blueOpacity,
        justifyContent: "center",
        alignItems: "center"
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        marginRight: 8
    },
    relayUrl: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4
    },
    relayDescription: {
        color: theme.colors.gray,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 6
    },
    softwareContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6
    },
    softwareText: {
        color: theme.colors.gray,
        fontSize: 11,
        marginLeft: 4,
        fontWeight: "500"
    },
    authorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, .1)"
    },
    authorInfo: {
        marginLeft: 8,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    authorLabel: {
        color: theme.colors.gray,
        fontSize: 11
    },
    authorName: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: "500"
    },
    arrowContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: 24
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 50
    },
    emptyText: {
        marginTop: 16,
        textAlign: "center",
        color: theme.colors.gray,
        fontSize: 14
    }
})
