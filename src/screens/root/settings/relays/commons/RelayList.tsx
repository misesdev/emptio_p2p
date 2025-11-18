import { NDKRelay } from "@nostr-dev-kit/ndk-mobile"
import { StyleSheet, TouchableOpacity, View, Text, FlatList } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useCallback, memo } from "react"
import theme from "@src/theme"

interface RelayProps {
    relay: NDKRelay;
    onPress: (relay: NDKRelay) => void;
}

const RelayItem = memo(({ relay, onPress }: RelayProps) => {
    const handlePress = () => onPress(relay)
    const relayUrl = relay.url.replace(/^wss?:\/\//, '').replace(/\/$/, '')

    return (
        <TouchableOpacity
            activeOpacity={.6}
            style={styles.sectionRelay}
            onPress={handlePress}
        >
            {/* Relay Icon with Status */}
            <View style={styles.iconContainer}>
                <View style={[
                    styles.iconWrapper,
                    relay.connected && styles.iconWrapperConnected
                ]}>
                    <Ionicons
                        name="server-outline"
                        size={24}
                        color={theme.colors.white}
                    />
                </View>
                {/* Connection Status Indicator */}
                <View style={[
                    styles.statusDot,
                    { backgroundColor: relay.connected ? theme.colors.green : theme.colors.gray }
                ]} />
            </View>

            {/* Relay Info */}
            <View style={styles.contentContainer}>
                <View style={styles.urlContainer}>
                    <Text style={styles.relayUrl} numberOfLines={1} ellipsizeMode="middle">
                        {relayUrl}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Ionicons
                            name="ellipse"
                            size={8}
                            color={relay.connected ? theme.colors.green : theme.colors.gray}
                        />
                        <Text style={[
                            styles.statusText,
                            { color: relay.connected ? theme.colors.green : theme.colors.gray }
                        ]}>
                            {relay.connected ? "Conectado" : "Desconectado"}
                        </Text>
                    </View>
                </View>

                {/* Connection Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="swap-horizontal-outline" size={14} color={theme.colors.gray} />
                        <Text style={styles.statText}>
                            {relay.stats?.activeSubscriptions || 0} subs
                        </Text>
                    </View>
                </View>
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
    relays: NDKRelay[];
    onPressRelay: (relay: NDKRelay) => void;
}

export const RelayList = ({ relays, onPressRelay }: Props) => {
    const renderItem = useCallback(({ item }: { item: NDKRelay }) => {
        return <RelayItem relay={item} onPress={onPressRelay} />
    }, [onPressRelay])

    const keyExtractor = useCallback((item: NDKRelay) => item.url, [])

    return (
        <View style={styles.container}>
            <FlatList
                data={relays}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 10
    },
    listContent: {
        paddingVertical: 5
    },
    sectionRelay: {
        width: "100%",
        minHeight: 75,
        borderRadius: theme.design.borderRadius,
        marginVertical: 5,
        flexDirection: "row",
        backgroundColor: "rgba(0, 55, 55, .2)",
        overflow: "hidden",
        padding: 12
    },
    iconContainer: {
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        position: "relative"
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.blueOpacity,
        justifyContent: "center",
        alignItems: "center"
    },
    iconWrapperConnected: {
        backgroundColor: "rgba(11, 97, 47, .3)"
    },
    statusDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "rgba(0, 55, 55, .2)"
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        marginRight: 8
    },
    urlContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 8
    },
    relayUrl: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: "600",
        flex: 1
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: "rgba(0, 0, 0, .3)"
    },
    statusText: {
        fontSize: 10,
        fontWeight: "600"
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    statText: {
        color: theme.colors.gray,
        fontSize: 12,
        fontWeight: "500"
    },
    arrowContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: 24
    }
})
