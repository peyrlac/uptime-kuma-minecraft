<template>
    <div class="minecraft-chart-panel">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>

<script>
import {
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    TimeScale,
    Tooltip,
} from "chart.js";
import "chartjs-adapter-dayjs-4";
import { Line } from "vue-chartjs";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Filler, Legend);
Chart.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, LineController, Tooltip, Filler, Legend);

export default {
    components: { Line },
    props: {
        monitorId: {
            type: Number,
            required: true,
        },
    },
    computed: {
        chartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 0,
                    },
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            minUnit: "minute",
                            tooltipFormat: "YYYY-MM-DD HH:mm:ss",
                            displayFormats: {
                                minute: "HH:mm",
                                hour: "MM-DD HH:mm",
                            },
                        },
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: this.$root.theme === "light" ? "#1f2937" : "#f3f4f6",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        max: this.maxPlayers,
                        ticks: {
                            precision: 0,
                            color: this.$root.theme === "light" ? "#1f2937" : "#f3f4f6",
                        },
                        title: {
                            display: true,
                            text: "Players",
                            color: this.$root.theme === "light" ? "#1f2937" : "#f3f4f6",
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} players`,
                        },
                    },
                },
            };
        },
        chartData() {
            const points = this.historyPoints;
            return {
                datasets: [
                    {
                        label: "Players",
                        data: points.map((point) => ({ x: point.time, y: point.value })),
                        borderColor: "#0d6efd",
                        backgroundColor: "rgba(13, 110, 253, 0.15)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.25,
                        pointRadius: 0,
                    },
                ],
            };
        },
        historyPoints() {
            const heartbeats = this.$root.heartbeatList?.[this.monitorId] || [];

            return heartbeats.map((beat) => {
                const parsed = this.parseHeartbeat(beat);
                return {
                    time: this.$root.toDayjs(beat.time).toDate(),
                    value: Number(parsed.online || 0),
                    maxPlayers: Number(parsed.maxplayers || parsed.maxPlayers || parsed.online || 0),
                };
            });
        },
        maxPlayers() {
            return Math.max(
                1,
                ...this.historyPoints.map((point) => point.maxPlayers),
                ...this.historyPoints.map((point) => point.value)
            );
        },
    },
    methods: {
        parseHeartbeat(beat) {
            const raw = beat && beat.response;
            if (typeof raw === "string") {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === "object") {
                        return parsed;
                    }
                } catch (e) {
                    // ignore malformed JSON
                }
            } else if (raw && typeof raw === "object") {
                return raw;
            }

            const msg = beat && beat.msg ? String(beat.msg) : "";
            const match = msg.match(/^(.*?)(?:\s*\((\d+)\/(\d+)\))?(?:\s*-\s*(.*))?$/);
            if (!match) {
                return { online: 0, maxplayers: 0, players: [] };
            }

            const playerNames = match[4] ? match[4].split(",").map((name) => name.trim()).filter(Boolean) : [];
            return {
                online: Number(match[2] || playerNames.length || 0),
                maxplayers: Number(match[3] || playerNames.length || 0),
                players: playerNames.map((name) => ({ name })),
            };
        },
    },
};
</script>

<style scoped>
.minecraft-chart-panel {
    min-height: 220px;
    height: 220px;
}
</style>
