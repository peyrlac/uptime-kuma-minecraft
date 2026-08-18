exports.up = function (knex) {
    return knex.schema.alterTable("monitor_group", function (table) {
        table.boolean("show_minecraft_motd").nullable().defaultTo(null);
        table.boolean("show_minecraft_players").nullable().defaultTo(null);
        table.boolean("show_minecraft_heads").nullable().defaultTo(null);
        table.boolean("show_minecraft_chart").nullable().defaultTo(null);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("monitor_group", function (table) {
        table.dropColumn("show_minecraft_motd");
        table.dropColumn("show_minecraft_players");
        table.dropColumn("show_minecraft_heads");
        table.dropColumn("show_minecraft_chart");
    });
};
