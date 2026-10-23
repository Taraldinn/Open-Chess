import type { PastGame, PlayerInfo, StandingRow, StandingsContext } from '../formats/types';
import { computePlayerScores } from '../formats/swiss';
import { computeColorProfile } from '../formats/swiss/colors';
import { computeBuchholz, computeBuchholzCut1, computeMedianBuchholz } from './buchholz';
import { computeSonnebornBerger } from './sonnebornBerger';
import { computeWins } from './wins';
import { computeDirectEncounter } from './directEncounter';
import type { TiebreakContext } from './types';

export function computeStandingsEngine(ctx: StandingsContext): StandingRow[] {
  const { players, games, settings } = ctx;
  const scores = computePlayerScores(players, games, settings);

  const rows: StandingRow[] = players.map((player) => {
    let played = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;

    for (const g of games) {
      if (g.whiteId !== player.id && g.blackId !== player.id) continue;
      if (g.result === 'unplayed') continue;

      if (g.result === 'bye' || g.blackId === null) {
        // Bye
        played++;
        wins++;
        continue;
      }

      played++;
      const isWhite = g.whiteId === player.id;
      const won =
        (isWhite && (g.result === 'white_win' || g.result === 'black_forfeit_win')) ||
        (!isWhite && (g.result === 'black_win' || g.result === 'white_forfeit_win'));
      const drawn = g.result === 'draw';

      if (won) wins++;
      else if (drawn) draws++;
      else losses++;
    }

    const colorProfile = computeColorProfile(player.id, games);

    const tiebreakCtx: TiebreakContext = {
      playerId: player.id,
      players,
      games,
      scores,
      settings,
    };

    const tiebreaks: Record<string, number> = {
      buchholz: computeBuchholz(tiebreakCtx),
      buchholz_cut1: computeBuchholzCut1(tiebreakCtx),
      median_buchholz: computeMedianBuchholz(tiebreakCtx),
      sonneborn_berger: computeSonnebornBerger(tiebreakCtx),
      wins: computeWins(tiebreakCtx),
      direct_encounter: computeDirectEncounter(tiebreakCtx),
    };

    return {
      playerId: player.id,
      playerName: player.name,
      rank: 0,
      score: scores.get(player.id) ?? 0,
      played,
      wins,
      draws,
      losses,
      tiebreaks,
      colorHistory: colorProfile.history,
      rating: player.rating,
      club: player.club,
    };
  });

  const configuredTieBreaks = settings.tieBreaks || ['buchholz', 'sonneborn_berger', 'wins'];

  // Multi-tier sort
  rows.sort((a, b) => {
    // Primary: Score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Secondary: Configured tie-breaks in order
    for (const tbKey of configuredTieBreaks) {
      const valA = a.tiebreaks[tbKey] ?? 0;
      const valB = b.tiebreaks[tbKey] ?? 0;
      if (valB !== valA) {
        return valB - valA;
      }
    }

    // Tertiary: Most total wins
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    // Quaternary: Seed / rating
    const seedA = players.find((p) => p.id === a.playerId)?.seed ?? 9999;
    const seedB = players.find((p) => p.id === b.playerId)?.seed ?? 9999;
    return seedA - seedB;
  });

  // Assign ranks
  rows.forEach((row, idx) => {
    row.rank = idx + 1;
  });

  return rows;
}
