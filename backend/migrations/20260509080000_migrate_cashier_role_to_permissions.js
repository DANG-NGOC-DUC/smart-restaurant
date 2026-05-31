const CASHIER_PERMISSION_KEYS = [
  "cashier.tables.read",
  "cashier.orders.read",
  "cashier.orders.approve",
  "cashier.order_items.cancel",
  "cashier.checkout",
  "cashier.reservations.read",
  "cashier.reservations.confirm",
  "cashier.reservations.reject",
  "cashier.service_requests.read",
  "cashier.service_requests.resolve",
];

export async function up(knex) {
  await knex.transaction(async (trx) => {
    const cashierUsers = await trx("users")
      .where({ role: "cashier" })
      .select("id");

    if (cashierUsers.length === 0) {
      return;
    }

    const userIds = cashierUsers.map((user) => user.id);

    const permissions = await trx("permissions")
      .whereIn("key", CASHIER_PERMISSION_KEYS)
      .select("id");

    await trx("users").whereIn("id", userIds).update({ role: "staff" });

    if (permissions.length === 0) {
      return;
    }

    const userPermissionRows = [];

    for (const userId of userIds) {
      for (const permission of permissions) {
        userPermissionRows.push({
          user_id: userId,
          permission_id: permission.id,
          granted_by: null,
        });
      }
    }

    if (userPermissionRows.length > 0) {
      await trx("user_permissions")
        .insert(userPermissionRows)
        .onConflict(["user_id", "permission_id"])
        .ignore();
    }
  });
}

export async function down(knex) {
  await knex.transaction(async (trx) => {
    const permissions = await trx("permissions")
      .whereIn("key", CASHIER_PERMISSION_KEYS)
      .select("id");

    if (permissions.length === 0) {
      return;
    }

    const permissionIds = permissions.map((permission) => permission.id);

    const userRows = await trx("user_permissions")
      .whereIn("permission_id", permissionIds)
      .distinct("user_id");

    const userIds = userRows.map((row) => row.user_id);

    if (userIds.length === 0) {
      return;
    }

    await trx("user_permissions")
      .whereIn("permission_id", permissionIds)
      .whereIn("user_id", userIds)
      .del();

    await trx("users").whereIn("id", userIds).update({ role: "cashier" });
  });
}
