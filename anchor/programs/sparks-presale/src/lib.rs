use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// TODO: Replace with actual program ID after `anchor build && anchor deploy`
// Run: solana address -k target/deploy/sparks_presale-keypair.json
declare_id!("4YQMDNA5DtsLxNMySEYHbdjj6CPvtRseQ5sgTqmHxt6D");

// ─── Tier Supply Caps (raw units, 9 decimals) ────────────────────────────────
const FOUNDING_SUPPLY: u64 = 500_000 * 1_000_000_000; // 500K SPRKS
const EARLY_SUPPLY: u64 = 750_000 * 1_000_000_000; // 750K SPRKS
const PUBLIC_SUPPLY: u64 = 750_000 * 1_000_000_000; // 750K SPRKS

// ─── Per-Wallet Purchase Caps (raw units) ────────────────────────────────────
const FOUNDING_WALLET_CAP: u64 = 10_000 * 1_000_000_000; // 10K SPRKS
const EARLY_WALLET_CAP: u64 = 5_000 * 1_000_000_000; //  5K SPRKS
const PUBLIC_WALLET_CAP: u64 = 2_500 * 1_000_000_000; //  2.5K SPRKS

#[program]
pub mod sparks_presale {
    use super::*;

    /// Initialize the presale.
    ///
    /// `founding_lamports_per_sprks`, `early_lamports_per_sprks`, and
    /// `public_lamports_per_sprks` are the SOL cost (in lamports) to purchase
    /// ONE displayed SPRKS token.
    ///
    /// Example at SOL = $135:
    ///   Founding ($0.05/SPRKS): 0.05 / 135 * 1e9 ≈ 370_370
    ///   Early    ($0.10/SPRKS): 0.10 / 135 * 1e9 ≈ 740_741
    ///   Public   ($0.20/SPRKS): 0.20 / 135 * 1e9 ≈ 1_481_481
    pub fn initialize(
        ctx: Context<Initialize>,
        presale_start: i64,
        presale_end: i64,
        founding_lamports_per_sprks: u64,
        early_lamports_per_sprks: u64,
        public_lamports_per_sprks: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.presale_state;
        state.authority = ctx.accounts.authority.key();
        state.token_mint = ctx.accounts.token_mint.key();
        state.token_vault = ctx.accounts.token_vault.key();
        state.presale_start = presale_start;
        state.presale_end = presale_end;
        state.is_active = true;
        state.claims_enabled = false;
        state.founding_sold = 0;
        state.early_sold = 0;
        state.public_sold = 0;
        state.total_lamports_raised = 0;
        state.founding_lamports_per_sprks = founding_lamports_per_sprks;
        state.early_lamports_per_sprks = early_lamports_per_sprks;
        state.public_lamports_per_sprks = public_lamports_per_sprks;
        state.bump = ctx.bumps.presale_state;
        state.vault_bump = ctx.bumps.token_vault;
        Ok(())
    }

    /// Deposit SPRKS tokens into the vault (admin only, before or during presale).
    pub fn deposit_tokens(ctx: Context<DepositTokens>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.presale_state.authority,
            PresaleError::Unauthorized
        );
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.admin_token_account.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    /// Purchase SPRKS tokens. SOL is transferred directly to the admin treasury.
    /// Allocation is recorded on-chain; tokens are claimed after presale ends.
    pub fn buy_tokens(ctx: Context<BuyTokens>, lamports: u64) -> Result<()> {
        let state = &ctx.accounts.presale_state;
        let clock = Clock::get()?;

        require!(state.is_active, PresaleError::PresaleNotActive);
        require!(
            clock.unix_timestamp >= state.presale_start,
            PresaleError::PresaleNotStarted
        );
        require!(
            clock.unix_timestamp <= state.presale_end,
            PresaleError::PresaleEnded
        );
        require!(!state.claims_enabled, PresaleError::PresaleEnded);
        require!(lamports > 0, PresaleError::InvalidAmount);

        // ── Determine active tier ───────────────────────────────────────────
        let (tier_index, lamports_per_sprks, wallet_cap, tier_remaining) =
            active_tier(state)?;

        // ── Calculate raw token allocation ──────────────────────────────────
        // raw_tokens = lamports * 1e9 / lamports_per_sprks
        // Uses u128 intermediate to prevent overflow (lamports * 1e9 can exceed u64).
        let tokens_raw = (lamports as u128)
            .checked_mul(1_000_000_000)
            .and_then(|v| v.checked_div(lamports_per_sprks as u128))
            .and_then(|v| u64::try_from(v).ok())
            .ok_or(PresaleError::ArithmeticOverflow)?;

        require!(tokens_raw > 0, PresaleError::InvalidAmount);
        require!(tokens_raw <= tier_remaining, PresaleError::TierSoldOut);

        // ── Enforce per-wallet tier cap ─────────────────────────────────────
        let allocation = &ctx.accounts.user_allocation;
        let current_tier_bought = match tier_index {
            0 => allocation.founding_bought,
            1 => allocation.early_bought,
            _ => allocation.public_bought,
        };
        let new_tier_total = current_tier_bought
            .checked_add(tokens_raw)
            .ok_or(PresaleError::ArithmeticOverflow)?;
        require!(new_tier_total <= wallet_cap, PresaleError::WalletCapExceeded);

        // ── Transfer SOL to treasury (authority wallet) ─────────────────────
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.authority.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, lamports)?;

        // ── Update allocation record ────────────────────────────────────────
        let allocation = &mut ctx.accounts.user_allocation;
        if allocation.user == Pubkey::default() {
            allocation.user = ctx.accounts.buyer.key();
            allocation.bump = ctx.bumps.user_allocation;
        }
        allocation.total_tokens = allocation
            .total_tokens
            .checked_add(tokens_raw)
            .ok_or(PresaleError::ArithmeticOverflow)?;
        match tier_index {
            0 => {
                allocation.founding_bought = new_tier_total;
            }
            1 => {
                allocation.early_bought = new_tier_total;
            }
            _ => {
                allocation.public_bought = new_tier_total;
            }
        }

        // ── Update presale state ────────────────────────────────────────────
        let state = &mut ctx.accounts.presale_state;
        match tier_index {
            0 => {
                state.founding_sold = state
                    .founding_sold
                    .checked_add(tokens_raw)
                    .ok_or(PresaleError::ArithmeticOverflow)?;
            }
            1 => {
                state.early_sold = state
                    .early_sold
                    .checked_add(tokens_raw)
                    .ok_or(PresaleError::ArithmeticOverflow)?;
            }
            _ => {
                state.public_sold = state
                    .public_sold
                    .checked_add(tokens_raw)
                    .ok_or(PresaleError::ArithmeticOverflow)?;
            }
        }
        state.total_lamports_raised = state
            .total_lamports_raised
            .checked_add(lamports)
            .ok_or(PresaleError::ArithmeticOverflow)?;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            lamports,
            tokens_raw,
            tier: tier_index,
        });

        Ok(())
    }

    /// Admin: flip the switch to enable claims (call after presale ends).
    pub fn enable_claims(ctx: Context<AdminAction>) -> Result<()> {
        let state = &mut ctx.accounts.presale_state;
        state.claims_enabled = true;
        state.is_active = false;
        Ok(())
    }

    /// Admin: pause / resume the presale.
    pub fn set_active(ctx: Context<AdminAction>, active: bool) -> Result<()> {
        ctx.accounts.presale_state.is_active = active;
        Ok(())
    }

    /// User claims their SPRKS allocation from the vault.
    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let state = &ctx.accounts.presale_state;
        let allocation = &ctx.accounts.user_allocation;

        require!(state.claims_enabled, PresaleError::ClaimsNotEnabled);
        require!(!allocation.claimed, PresaleError::AlreadyClaimed);
        require!(allocation.total_tokens > 0, PresaleError::NothingToClaim);
        require!(
            allocation.user == ctx.accounts.buyer.key(),
            PresaleError::Unauthorized
        );

        let tokens_to_send = allocation.total_tokens;

        // Vault is a PDA-owned token account — sign with presale_state seeds
        let seeds = &[b"presale_state".as_ref(), &[state.bump]];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.presale_state.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(cpi_ctx, tokens_to_send)?;

        let allocation = &mut ctx.accounts.user_allocation;
        allocation.claimed = true;

        emit!(TokensClaimed {
            user: ctx.accounts.buyer.key(),
            tokens_raw: tokens_to_send,
        });

        Ok(())
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// Returns (tier_index, lamports_per_sprks, wallet_cap, remaining_in_tier)
fn active_tier(state: &PresaleState) -> Result<(u8, u64, u64, u64)> {
    if state.founding_sold < FOUNDING_SUPPLY {
        Ok((
            0,
            state.founding_lamports_per_sprks,
            FOUNDING_WALLET_CAP,
            FOUNDING_SUPPLY - state.founding_sold,
        ))
    } else if state.early_sold < EARLY_SUPPLY {
        Ok((
            1,
            state.early_lamports_per_sprks,
            EARLY_WALLET_CAP,
            EARLY_SUPPLY - state.early_sold,
        ))
    } else if state.public_sold < PUBLIC_SUPPLY {
        Ok((
            2,
            state.public_lamports_per_sprks,
            PUBLIC_WALLET_CAP,
            PUBLIC_SUPPLY - state.public_sold,
        ))
    } else {
        err!(PresaleError::AllTiersSoldOut)
    }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + PresaleState::INIT_SPACE,
        seeds = [b"presale_state"],
        bump,
    )]
    pub presale_state: Account<'info, PresaleState>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    /// PDA-owned token vault — holds SPRKS for distribution during claims
    #[account(
        init,
        payer = authority,
        seeds = [b"token_vault"],
        bump,
        token::mint = token_mint,
        token::authority = presale_state,
    )]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(seeds = [b"presale_state"], bump = presale_state.bump)]
    pub presale_state: Account<'info, PresaleState>,

    #[account(mut, address = presale_state.token_vault)]
    pub token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: This is the admin treasury wallet — verified by presale_state.authority
    #[account(mut, address = presale_state.authority)]
    pub authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"presale_state"],
        bump = presale_state.bump,
    )]
    pub presale_state: Account<'info, PresaleState>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + UserAllocation::INIT_SPACE,
        seeds = [b"allocation", buyer.key().as_ref()],
        bump,
    )]
    pub user_allocation: Account<'info, UserAllocation>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"presale_state"],
        bump = presale_state.bump,
        has_one = authority @ PresaleError::Unauthorized,
    )]
    pub presale_state: Account<'info, PresaleState>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(seeds = [b"presale_state"], bump = presale_state.bump)]
    pub presale_state: Account<'info, PresaleState>,

    #[account(
        mut,
        seeds = [b"allocation", buyer.key().as_ref()],
        bump = user_allocation.bump,
    )]
    pub user_allocation: Account<'info, UserAllocation>,

    #[account(mut, address = presale_state.token_vault)]
    pub token_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ─── State ────────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct PresaleState {
    pub authority: Pubkey,              // 32 — admin wallet (treasury)
    pub token_mint: Pubkey,             // 32 — SPRKS mint
    pub token_vault: Pubkey,            // 32 — PDA token account
    pub presale_start: i64,             //  8
    pub presale_end: i64,               //  8
    pub is_active: bool,                //  1
    pub claims_enabled: bool,           //  1
    pub founding_sold: u64,             //  8 — raw tokens sold in Founding tier
    pub early_sold: u64,                //  8 — raw tokens sold in Early tier
    pub public_sold: u64,               //  8 — raw tokens sold in Public tier
    pub total_lamports_raised: u64,     //  8 — total SOL raised (lamports)
    pub founding_lamports_per_sprks: u64, // 8
    pub early_lamports_per_sprks: u64,  //  8
    pub public_lamports_per_sprks: u64, //  8
    pub bump: u8,                       //  1
    pub vault_bump: u8,                 //  1
}

#[account]
#[derive(InitSpace)]
pub struct UserAllocation {
    pub user: Pubkey,           // 32
    pub total_tokens: u64,      //  8 — total raw SPRKS allocated across all tiers
    pub founding_bought: u64,   //  8 — raw SPRKS bought in Founding tier
    pub early_bought: u64,      //  8 — raw SPRKS bought in Early tier
    pub public_bought: u64,     //  8 — raw SPRKS bought in Public tier
    pub claimed: bool,          //  1
    pub bump: u8,               //  1
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct TokensPurchased {
    pub buyer: Pubkey,
    pub lamports: u64,
    pub tokens_raw: u64,
    pub tier: u8,
}

#[event]
pub struct TokensClaimed {
    pub user: Pubkey,
    pub tokens_raw: u64,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum PresaleError {
    #[msg("Presale is not active")]
    PresaleNotActive,
    #[msg("Presale has not started yet")]
    PresaleNotStarted,
    #[msg("Presale has ended")]
    PresaleEnded,
    #[msg("All tiers are sold out")]
    AllTiersSoldOut,
    #[msg("Current tier is sold out")]
    TierSoldOut,
    #[msg("Wallet cap for this tier exceeded")]
    WalletCapExceeded,
    #[msg("Invalid purchase amount")]
    InvalidAmount,
    #[msg("Claims are not enabled yet")]
    ClaimsNotEnabled,
    #[msg("Tokens already claimed")]
    AlreadyClaimed,
    #[msg("No tokens to claim")]
    NothingToClaim,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
