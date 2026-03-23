/**
 * add-metadata.ts
 *
 * Attaches name/symbol/logo metadata to the SPRKS token mint via Metaplex.
 *
 * Usage:
 *   npx ts-node scripts/add-metadata.ts
 *
 * Prerequisites:
 *   npm install @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi \
 *               @metaplex-foundation/umi-bundle-defaults \
 *               @metaplex-foundation/umi-signer-wallet-adapters
 */

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createFungible,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const SPRKS_MINT = "EPGoVU5wzZFxL9hu16Dhn3wtyz1P1mPMGQ9Y1KzMebv3";

const METADATA = {
  name: "Sparks",
  symbol: "SPRKS",
  uri: "https://joinsparks.app/sprks-metadata.json",
};

// ─── Load wallet ──────────────────────────────────────────────────────────────

const walletPath = path.resolve(process.env.HOME!, ".config/solana/id.json");
const walletRaw = JSON.parse(fs.readFileSync(walletPath, "utf8"));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const umi = createUmi("https://api.mainnet-beta.solana.com").use(mplTokenMetadata());

  const keypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(walletRaw));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  console.log("─────────────────────────────────────────");
  console.log("  SPRKS Token — Add Metadata");
  console.log("─────────────────────────────────────────");
  console.log(`Mint:    ${SPRKS_MINT}`);
  console.log(`Name:    ${METADATA.name}`);
  console.log(`Symbol:  ${METADATA.symbol}`);
  console.log(`URI:     ${METADATA.uri}`);
  console.log("─────────────────────────────────────────");

  const tx = await createFungible(umi, {
    mint: publicKey(SPRKS_MINT),
    name: METADATA.name,
    symbol: METADATA.symbol,
    uri: METADATA.uri,
    sellerFeeBasisPoints: { basisPoints: 0n, identifier: "%", decimals: 2 },
    decimals: 9,
  }).sendAndConfirm(umi);

  console.log(`✓ Metadata added!`);
  console.log(`  Tx: ${Buffer.from(tx.signature).toString("base64")}`);
  console.log(`\nNext: add sprks-metadata.json to your joinsparks.app public/ folder.`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
