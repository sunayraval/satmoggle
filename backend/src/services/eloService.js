class EloService {
  /**
   * Calculate standard 1v1 Elo change
   * @param {number} ratingA - Current rating of Player A
   * @param {number} ratingB - Current rating of Player B
   * @param {number} scoreA - 1 if A won, 0.5 if tie, 0 if A lost
   * @param {number} kFactor - K-factor (default 32 for new players, 16 for established)
   */
  calculate1v1(ratingA, ratingB, scoreA, kFactor = 32) {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const deltaA = Math.round(kFactor * (scoreA - expectedA));
    return {
      deltaA,
      newRatingA: ratingA + deltaA
    };
  }

  /**
   * Calculate multiplayer Elo changes (e.g. for Bomb Party or Classic Battle Royale)
   * Treats a multiplayer game as pairwise matches between all participants.
   * @param {Array} players - Array of { id, elo, rank } where rank 1 is winner, 2 is 2nd place, etc.
   * @param {number} defaultK - K-factor to use
   */
  calculateMultiplayer(players, defaultK = 32) {
    const n = players.length;
    if (n < 2) return players.map(p => ({ id: p.id, eloDelta: 0, newElo: p.elo }));

    const results = players.map(p => ({
      id: p.id,
      oldElo: p.elo || 1200,
      k: p.gamesPlayed > 30 ? 16 : defaultK,
      rank: p.rank,
      totalDelta: 0
    }));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const p1 = results[i];
        const p2 = results[j];

        let score1 = 0.5;
        if (p1.rank < p2.rank) score1 = 1.0;
        else if (p1.rank > p2.rank) score1 = 0.0;

        const exp1 = 1 / (1 + Math.pow(10, (p2.oldElo - p1.oldElo) / 400));
        const exp2 = 1 - exp1;

        // Pairwise delta scaled down by (N - 1) so total rating change is balanced
        const delta1 = (p1.k * (score1 - exp1)) / (n - 1);
        const delta2 = (p2.k * ((1 - score1) - exp2)) / (n - 1);

        p1.totalDelta += delta1;
        p2.totalDelta += delta2;
      }
    }

    return results.map(r => {
      const roundedDelta = Math.round(r.totalDelta);
      return {
        id: r.id,
        eloDelta: roundedDelta,
        newElo: Math.max(100, r.oldElo + roundedDelta) // Floor at 100 Elo
      };
    });
  }
}

module.exports = new EloService();
