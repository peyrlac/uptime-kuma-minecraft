const { MonitorType } = require("./monitor-type");
const { UP } = require("../../src/util");
const { GameDig } = require("gamedig");

function getMinecraftPlayerUUID(player) {
    const uuid = player?.id ?? player?.uuid ?? player?.raw?.id;
    if (typeof uuid !== "string") {
        return null;
    }

    const normalizedUUID = uuid.replaceAll("-", "").toLowerCase();
    return /^[0-9a-f]{32}$/.test(normalizedUUID) ? normalizedUUID : null;
}

class GameDigMonitorType extends MonitorType {
    name = "gamedig";

    /**
     * @inheritdoc
     */
    async check(monitor, heartbeat, server) {
        try {
            const state = await GameDig.query({
                type: monitor.game,
                host: monitor.hostname,
                port: monitor.port,
                givenPortOnly: Boolean(monitor.gamedigGivenPortOnly),
                ...(monitor.gamedigToken ? { token: monitor.gamedigToken } : {}),
            });

            heartbeat.status = UP;
            heartbeat.ping = state.ping;

            const players = Array.isArray(state.players) ? state.players : [];
            const playerNames = players
                .map((player) => player && typeof player === "object" ? player.name : player)
                .filter((name) => typeof name === "string" && name.length > 0);

            if (monitor.game === "minecraft") {
                const maxPlayers = Number.isFinite(state.maxplayers) ? state.maxplayers : playerNames.length;
                const playerSummary = playerNames.length > 0 ? ` (${playerNames.length}/${maxPlayers}) - ${playerNames.join(", ")}` : "";
                heartbeat.msg = `${state.name}${playerSummary}`;
                heartbeat.response = JSON.stringify({
                    motd: state.name ?? "",
                    online: playerNames.length,
                    maxplayers: maxPlayers,
                    players: players.map((player) => {
                        if (player && typeof player === "object") {
                            return {
                                name: player.name ?? "",
                                uuid: getMinecraftPlayerUUID(player),
                            };
                        }

                        return {
                            name: String(player ?? ""),
                            uuid: null,
                        };
                    }),
                });
            } else {
                heartbeat.msg = state.name;
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = {
    GameDigMonitorType,
};
