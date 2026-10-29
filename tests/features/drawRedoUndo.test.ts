import { describe, it, expect } from 'vitest';
import type { GameResult } from '@/lib/formats/types';

describe('Draw Redo and Undo Logic', () => {
  type TournamentState = {
    status: 'draft' | 'published' | 'in_progress' | 'completed';
    rounds: { round_number: number; status: 'pending' | 'paired' | 'in_progress' | 'completed'; gamesCount: number }[];
  };

  function simulateUndoDraw(state: TournamentState, targetRoundNumber: number): TournamentState {
    const roundIdx = state.rounds.findIndex((r) => r.round_number === targetRoundNumber);
    if (roundIdx === -1) throw new Error('Round not found');

    const updatedRounds = [...state.rounds];

    if (targetRoundNumber === 1) {
      // Round 1 undo: reverts tournament back to 'draft', deletes Round 1
      return {
        status: 'draft',
        rounds: [],
      };
    } else {
      // Round N undo: removes round N, reverts tournament status to 'published' with active round N-1
      updatedRounds.splice(roundIdx, 1);
      return {
        status: 'published',
        rounds: updatedRounds,
      };
    }
  }

  it('undoes Round 1 draw and returns tournament to draft state', () => {
    const initialState: TournamentState = {
      status: 'published',
      rounds: [{ round_number: 1, status: 'paired', gamesCount: 4 }],
    };

    const newState = simulateUndoDraw(initialState, 1);
    expect(newState.status).toBe('draft');
    expect(newState.rounds.length).toBe(0);
  });

  it('undoes Round 2 draw and reverts tournament back to completed Round 1', () => {
    const initialState: TournamentState = {
      status: 'in_progress',
      rounds: [
        { round_number: 1, status: 'completed', gamesCount: 4 },
        { round_number: 2, status: 'paired', gamesCount: 4 },
      ],
    };

    const newState = simulateUndoDraw(initialState, 2);
    expect(newState.status).toBe('published');
    expect(newState.rounds.length).toBe(1);
    expect(newState.rounds[0].round_number).toBe(1);
  });

  it('simulates result button toggle-to-undo (clicking current result clears it back to unplayed)', () => {
    function handleResultClick(currentResult: GameResult | null, clickedResult: GameResult): GameResult | null {
      // If clicking the same result, toggle off / reset to null (unplayed)
      if (currentResult === clickedResult) {
        return null;
      }
      return clickedResult;
    }

    let result: GameResult | null = null;

    // Arbiter sets 1-0
    result = handleResultClick(result, '1-0');
    expect(result).toBe('1-0');

    // Arbiter clicks 1-0 again -> should toggle back to null (unplayed)
    result = handleResultClick(result, '1-0');
    expect(result).toBeNull();

    // Arbiter sets 1/2-1/2
    result = handleResultClick(result, '1/2-1/2');
    expect(result).toBe('1/2-1/2');

    // Arbiter clicks 0-1
    result = handleResultClick(result, '0-1');
    expect(result).toBe('0-1');
  });
});
