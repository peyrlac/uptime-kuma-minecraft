<template>
    <div ref="MonitorSettingDialog" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ $t("Monitor Setting", [monitor.name]) }}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('Close')" />
                </div>
                <div class="modal-body">
                    <div class="my-3 form-check">
                        <input
                            id="show-clickable-link"
                            v-model="monitor.isClickAble"
                            class="form-check-input"
                            type="checkbox"
                            data-testid="show-clickable-link"
                            @click="toggleLink(monitor.group_index, monitor.monitor_index)"
                        />
                        <label class="form-check-label" for="show-clickable-link">
                            {{ $t("Show Clickable Link") }}
                        </label>
                        <div class="form-text">
                            {{ $t("Show Clickable Link Description") }}
                        </div>
                    </div>

                    <!-- Custom URL -->
                    <template v-if="monitor.isClickAble">
                        <label for="customUrl" class="form-label">{{ $t("Custom URL") }}</label>
                        <input
                            id="customUrl"
                            :value="monitor.url"
                            type="url"
                            class="form-control"
                            data-testid="custom-url-input"
                            @input="(e) => changeUrl(monitor.group_index, monitor.monitor_index, e.target!.value)"
                        />

                        <div class="form-text mb-3">
                            {{ $t("customUrlDescription") }}
                        </div>
                    </template>

                    <template v-if="monitor.isMinecraft">
                        <hr />
                        <h6>{{ $t("Minecraft Display") }}</h6>
                        <div v-for="option in minecraftOptions" :key="option.key" class="my-3">
                            <label :for="option.key" class="form-label">{{ $t(option.label) }}</label>
                            <select
                                :id="option.key"
                                :value="monitor[option.key]"
                                class="form-select"
                                @change="changeMinecraftOption(monitor.group_index, monitor.monitor_index, option.key, $event.target.value)"
                            >
                                <option value="inherit">{{ $t("statusPageDefault") }}</option>
                                <option value="show">{{ $t("Show") }}</option>
                                <option value="hide">{{ $t("Hide") }}</option>
                            </select>
                        </div>
                    </template>

                    <button
                        class="btn btn-primary btn-add-group me-2"
                        @click="$refs.badgeLinkGeneratorDialog.show(monitor.id, monitor.name)"
                    >
                        <font-awesome-icon icon="certificate" />
                        {{ $t("Open Badge Link Generator") }}
                    </button>
                </div>

                <div class="modal-footer">
                    <button
                        type="submit"
                        class="btn btn-danger"
                        data-bs-dismiss="modal"
                        data-testid="monitor-settings-close"
                    >
                        {{ $t("Close") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <BadgeLinkGeneratorDialog ref="badgeLinkGeneratorDialog" />
</template>

<script lang="ts">
import { Modal } from "bootstrap";
import BadgeLinkGeneratorDialog from "./BadgeLinkGeneratorDialog.vue";

export default {
    components: {
        BadgeLinkGeneratorDialog,
    },
    props: {},
    emits: [],
    data() {
        return {
            minecraftOptions: [
                { key: "showMinecraftMotd", label: "showMinecraftMotd" },
                { key: "showMinecraftPlayers", label: "showMinecraftPlayers" },
                { key: "showMinecraftHeads", label: "showMinecraftHeads" },
                { key: "showMinecraftChart", label: "showMinecraftChart" },
            ],
            monitor: {
                id: null,
                name: null,
            },
        };
    },

    computed: {},

    mounted() {
        this.MonitorSettingDialog = new Modal(this.$refs.MonitorSettingDialog);
    },

    methods: {
        /**
         * Setting monitor
         * @param {object} group Data of monitor
         * @param {object} monitor Data of monitor
         * @returns {void}
         */
        show(group, monitor) {
            this.monitor = {
                id: monitor.element.id,
                name: monitor.element.name,
                monitor_index: monitor.index,
                group_index: group.index,
                isClickAble: this.showLink(monitor),
                url: monitor.element.url,
                isMinecraft: monitor.element.type === "gamedig" && monitor.element.game === "minecraft",
                showMinecraftMotd: this.minecraftOptionValue(monitor.element.showMinecraftMotd),
                showMinecraftPlayers: this.minecraftOptionValue(monitor.element.showMinecraftPlayers),
                showMinecraftHeads: this.minecraftOptionValue(monitor.element.showMinecraftHeads),
                showMinecraftChart: this.minecraftOptionValue(monitor.element.showMinecraftChart),
            };

            this.MonitorSettingDialog.show();
        },

        /**
         * Toggle the value of sendUrl
         * @param {number} groupIndex Index of group monitor is member of
         * @param {number} index Index of monitor within group
         * @returns {void}
         */
        toggleLink(groupIndex, index) {
            this.$root.publicGroupList[groupIndex].monitorList[index].sendUrl =
                !this.$root.publicGroupList[groupIndex].monitorList[index].sendUrl;
        },

        /**
         * Should a link to the monitor be shown?
         * Attempts to guess if a link should be shown based upon if
         * sendUrl is set and if the URL is default or not.
         * @param {object} monitor Monitor to check
         * @param {boolean} ignoreSendUrl Should the presence of the sendUrl
         * property be ignored. This will only work in edit mode.
         * @returns {boolean} Should the link be shown?
         */
        showLink(monitor, ignoreSendUrl = false) {
            // We must check if there are any elements in monitorList to
            // prevent undefined errors if it hasn't been loaded yet
            if (this.$parent.editMode && ignoreSendUrl && Object.keys(this.$root.monitorList).length) {
                return (
                    this.$root.monitorList[monitor.element.id].type === "http" ||
                    this.$root.monitorList[monitor.element.id].type === "keyword" ||
                    this.$root.monitorList[monitor.element.id].type === "json-query"
                );
            }
            return (
                monitor.element.sendUrl && monitor.element.url && monitor.element.url !== "https://" && !this.editMode
            );
        },

        /**
         * Toggle the value of sendUrl
         * @param {number} groupIndex Index of group monitor is member of
         * @param {number} index Index of monitor within group
         * @param {string} value The new value of the url
         * @returns {void}
         */
        changeUrl(groupIndex, index, value) {
            this.$root.publicGroupList[groupIndex].monitorList[index].url = value;
        },

        minecraftOptionValue(value) {
            if (value === undefined || value === null) {
                return "inherit";
            }
            return value ? "show" : "hide";
        },

        changeMinecraftOption(groupIndex, index, option, value) {
            const monitor = this.$root.publicGroupList[groupIndex].monitorList[index];
            monitor[option] = value === "inherit" ? null : value === "show";
            this.monitor[option] = value;
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.dark {
    .modal-dialog .form-text,
    .modal-dialog p {
        color: $dark-font-color;
    }
}
</style>
