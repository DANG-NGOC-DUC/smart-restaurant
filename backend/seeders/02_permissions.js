/**
 * Seed: base permission keys (cashier scope)
 * Run: npx knex seed:run --specific=02_permissions.js
 */

export const seed = async (knex) => {
  const permissions = [
    {
      key: "cashier.tables.read",
      label: "Cashier read tables",
      description: null,
    },
    {
      key: "cashier.orders.read",
      label: "Cashier read orders",
      description: null,
    },
    {
      key: "cashier.orders.approve",
      label: "Cashier approve orders",
      description: null,
    },
    {
      key: "cashier.order_items.cancel",
      label: "Cashier cancel order items",
      description: null,
    },
    { key: "cashier.checkout", label: "Cashier checkout", description: null },
    {
      key: "cashier.reservations.read",
      label: "Cashier read reservations",
      description: null,
    },
    {
      key: "cashier.reservations.confirm",
      label: "Cashier confirm reservations",
      description: null,
    },
    {
      key: "cashier.reservations.reject",
      label: "Cashier reject reservations",
      description: null,
    },
    {
      key: "cashier.service_requests.read",
      label: "Cashier read service requests",
      description: null,
    },
    {
      key: "cashier.service_requests.resolve",
      label: "Cashier resolve service requests",
      description: null,
    },
  ];

  await knex("permissions")
    .insert(permissions)
    .onConflict("key")
    .merge(["label", "description"]);
};
