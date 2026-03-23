/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sparks_presale.json`.
 */
export type SparksPresale = {
  "address": "4YQMDNA5DtsLxNMySEYHbdjj6CPvtRseQ5sgTqmHxt6D",
  "metadata": {
    "name": "sparksPresale",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Sparks $SPRKS Token Presale Program"
  },
  "instructions": [
    {
      "name": "buyTokens",
      "docs": [
        "Purchase SPRKS tokens. SOL is transferred directly to the admin treasury.",
        "Allocation is recorded on-chain; tokens are claimed after presale ends."
      ],
      "discriminator": [
        189,
        21,
        230,
        133,
        247,
        2,
        110,
        42
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true
        },
        {
          "name": "presaleState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "userAllocation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  108,
                  108,
                  111,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimTokens",
      "docs": [
        "User claims their SPRKS allocation from the vault."
      ],
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "presaleState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "userAllocation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  108,
                  108,
                  111,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "depositTokens",
      "docs": [
        "Deposit SPRKS tokens into the vault (admin only, before or during presale)."
      ],
      "discriminator": [
        176,
        83,
        229,
        18,
        191,
        143,
        176,
        150
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "presaleState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "adminTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "enableClaims",
      "docs": [
        "Admin: flip the switch to enable claims (call after presale ends)."
      ],
      "discriminator": [
        56,
        47,
        60,
        155,
        110,
        73,
        10,
        82
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "presaleState"
          ]
        },
        {
          "name": "presaleState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the presale.",
        "",
        "`founding_lamports_per_sprks`, `early_lamports_per_sprks`, and",
        "`public_lamports_per_sprks` are the SOL cost (in lamports) to purchase",
        "ONE displayed SPRKS token.",
        "",
        "Example at SOL = $135:",
        "Founding ($0.05/SPRKS): 0.05 / 135 * 1e9 ≈ 370_370",
        "Early    ($0.10/SPRKS): 0.10 / 135 * 1e9 ≈ 740_741",
        "Public   ($0.20/SPRKS): 0.20 / 135 * 1e9 ≈ 1_481_481"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "presaleState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenVault",
          "docs": [
            "PDA-owned token vault — holds SPRKS for distribution during claims"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "presaleStart",
          "type": "i64"
        },
        {
          "name": "presaleEnd",
          "type": "i64"
        },
        {
          "name": "foundingLamportsPerSprks",
          "type": "u64"
        },
        {
          "name": "earlyLamportsPerSprks",
          "type": "u64"
        },
        {
          "name": "publicLamportsPerSprks",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setActive",
      "docs": [
        "Admin: pause / resume the presale."
      ],
      "discriminator": [
        29,
        16,
        225,
        132,
        38,
        216,
        206,
        33
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "presaleState"
          ]
        },
        {
          "name": "presaleState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "active",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "presaleState",
      "discriminator": [
        32,
        18,
        85,
        188,
        213,
        180,
        10,
        241
      ]
    },
    {
      "name": "userAllocation",
      "discriminator": [
        165,
        18,
        77,
        48,
        189,
        20,
        97,
        217
      ]
    }
  ],
  "events": [
    {
      "name": "tokensClaimed",
      "discriminator": [
        25,
        128,
        244,
        55,
        241,
        136,
        200,
        91
      ]
    },
    {
      "name": "tokensPurchased",
      "discriminator": [
        214,
        119,
        105,
        186,
        114,
        205,
        228,
        181
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "presaleNotActive",
      "msg": "Presale is not active"
    },
    {
      "code": 6001,
      "name": "presaleNotStarted",
      "msg": "Presale has not started yet"
    },
    {
      "code": 6002,
      "name": "presaleEnded",
      "msg": "Presale has ended"
    },
    {
      "code": 6003,
      "name": "allTiersSoldOut",
      "msg": "All tiers are sold out"
    },
    {
      "code": 6004,
      "name": "tierSoldOut",
      "msg": "Current tier is sold out"
    },
    {
      "code": 6005,
      "name": "walletCapExceeded",
      "msg": "Wallet cap for this tier exceeded"
    },
    {
      "code": 6006,
      "name": "invalidAmount",
      "msg": "Invalid purchase amount"
    },
    {
      "code": 6007,
      "name": "claimsNotEnabled",
      "msg": "Claims are not enabled yet"
    },
    {
      "code": 6008,
      "name": "alreadyClaimed",
      "msg": "Tokens already claimed"
    },
    {
      "code": 6009,
      "name": "nothingToClaim",
      "msg": "No tokens to claim"
    },
    {
      "code": 6010,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6011,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "presaleState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "presaleStart",
            "type": "i64"
          },
          {
            "name": "presaleEnd",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "claimsEnabled",
            "type": "bool"
          },
          {
            "name": "foundingSold",
            "type": "u64"
          },
          {
            "name": "earlySold",
            "type": "u64"
          },
          {
            "name": "publicSold",
            "type": "u64"
          },
          {
            "name": "totalLamportsRaised",
            "type": "u64"
          },
          {
            "name": "foundingLamportsPerSprks",
            "type": "u64"
          },
          {
            "name": "earlyLamportsPerSprks",
            "type": "u64"
          },
          {
            "name": "publicLamportsPerSprks",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokensClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "tokensRaw",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokensPurchased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "lamports",
            "type": "u64"
          },
          {
            "name": "tokensRaw",
            "type": "u64"
          },
          {
            "name": "tier",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userAllocation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          },
          {
            "name": "foundingBought",
            "type": "u64"
          },
          {
            "name": "earlyBought",
            "type": "u64"
          },
          {
            "name": "publicBought",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
