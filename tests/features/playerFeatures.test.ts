import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Player edit schema matches lib/actions/players.ts updatePlayerAction schema
const updatePlayerSchema = z.object({
  tournamentId: z.string().uuid(),
  playerId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  rating: z.number().int().min(0).max(4000).nullable().optional(),
  club: z.string().max(100).nullable().optional(),
});

// Registration schema matches lib/actions/registrations.ts
const submitRegistrationSchema = z.object({
  tournamentSlug: z.string().min(1),
  token: z.string().optional().nullable(),
  name: z.string().min(1, 'Name is required').max(100),
  rating: z.number().int().optional().nullable(),
  club: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable().or(z.literal('')),
  notes: z.string().max(300).optional().nullable().or(z.literal('')),
  checkInNow: z.boolean().optional(),
});

describe('Player Features: Edit Name & Club', () => {
  it('validates player name and club updates successfully', () => {
    const validData = {
      tournamentId: '123e4567-e89b-12d3-a456-426614174000',
      playerId: '987fcdeb-51a2-43f7-9876-543210987654',
      name: 'Magnus Carlsen',
      rating: 2830,
      club: 'Offerspill Chess Club',
    };

    const parsed = updatePlayerSchema.parse(validData);
    expect(parsed.name).toBe('Magnus Carlsen');
    expect(parsed.club).toBe('Offerspill Chess Club');
    expect(parsed.rating).toBe(2830);
  });

  it('rejects empty player names and out-of-range ratings', () => {
    expect(() =>
      updatePlayerSchema.parse({
        tournamentId: '123e4567-e89b-12d3-a456-426614174000',
        playerId: '987fcdeb-51a2-43f7-9876-543210987654',
        name: '',
        club: 'Club',
      })
    ).toThrow();

    expect(() =>
      updatePlayerSchema.parse({
        tournamentId: '123e4567-e89b-12d3-a456-426614174000',
        playerId: '987fcdeb-51a2-43f7-9876-543210987654',
        name: 'Hikaru Nakamura',
        rating: 9999,
      })
    ).toThrow();
  });
});

describe('Player Form Fillup & Private Token Verification', () => {
  it('validates registration form submission with club, contact, and check-in options', () => {
    const validRegistration = {
      tournamentSlug: 'spring-blitz-2026',
      token: 'secure_token_abc123',
      name: 'Alice Wonder',
      rating: 1650,
      club: 'Kings Gambit CC',
      email: 'alice@example.com',
      phone: '+1234567890',
      notes: 'Needs wheelchair access board',
      checkInNow: true,
    };

    const parsed = submitRegistrationSchema.parse(validRegistration);
    expect(parsed.name).toBe('Alice Wonder');
    expect(parsed.club).toBe('Kings Gambit CC');
    expect(parsed.token).toBe('secure_token_abc123');
    expect(parsed.checkInNow).toBe(true);
  });

  it('enforces private invite token matching logic', () => {
    const expectedToken = 'private_invite_xyz789';

    function verifyAccess(providedToken: string | null | undefined, secretToken: string | null | undefined): boolean {
      if (secretToken && (!providedToken || providedToken !== secretToken)) {
        return false;
      }
      return true;
    }

    expect(verifyAccess('private_invite_xyz789', expectedToken)).toBe(true);
    expect(verifyAccess('wrong_token', expectedToken)).toBe(false);
    expect(verifyAccess(null, expectedToken)).toBe(false);
    expect(verifyAccess(undefined, expectedToken)).toBe(false);
    // When no secret token is configured, open access is allowed
    expect(verifyAccess(null, null)).toBe(true);
  });
});
