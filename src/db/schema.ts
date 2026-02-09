import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Users table - stores wallet addresses and authentication info
 */
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    walletAddress: text("wallet_address").notNull().unique(),
    nonce: text("nonce"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    walletAddressIdx: uniqueIndex("wallet_address_idx").on(table.walletAddress),
  })
);

/**
 * Contracts table - stores deployed contract information
 */
export const contracts = pgTable("contracts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  address: text("address").notNull().unique(),
  transactionHash: text("transaction_hash").notNull(),
  contractName: text("contract_name").notNull(),
  type: text("type").notNull(), // DRC20, DRC721, DRC1155, ERC20, ERC721, ERC1155, RWA
  chainId: integer("chain_id").notNull(),
  networkName: text("network_name").notNull(),
  isVerified: text("is_verified").default("false").notNull(), // "false", "verifying", "true", "failed"
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ownerAddress: text("owner_address")
    .notNull()
    .references(() => users.walletAddress, { onDelete: "cascade" }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
