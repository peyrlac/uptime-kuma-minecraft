exports.up = function (knex) {
    return knex.schema.alterTable("status_page", function (table) {
        table.boolean("show_minecraft_motd").notNullable().defaultTo(false);
        table.boolean("show_minecraft_players").notNullable().defaultTo(false);
        table.boolean("show_minecraft_heads").notNullable().defaultTo(false);
        table.boolean("show_minecraft_chart").notNullable().defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("status_page", function (table) {
        table.dropColumn("show_minecraft_motd");
        table.dropColumn("show_minecraft_players");
        table.dropColumn("show_minecraft_heads");
        table.dropColumn("show_minecraft_chart");
    });
};
