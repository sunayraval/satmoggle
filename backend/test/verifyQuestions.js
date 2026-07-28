const questionService = require('../src/services/questionService');
const eloService = require('../src/services/eloService');

console.log('--- Running SATmoggle Backend Verification ---');

try {
  // 1. Test Question Service Loading
  console.log('\n[1/3] Testing questionService indexer...');
  questionService.loadQuestions();
  const stats = questionService.getStats();

  if (stats.total === 0) {
    throw new Error('No questions loaded from questions.json!');
  }
  console.log('✅ Question indexing successful! Summary:', stats);

  // 2. Test Question Sampling
  console.log('\n[2/3] Testing random question sampling...');
  const mathSample = questionService.getRandomQuestions({ subject: 'math', difficulty: 'M', count: 3 });
  const engSample = questionService.getRandomQuestions({ subject: 'english', difficulty: 'H', count: 2 });

  if (mathSample.length === 0 || engSample.length === 0) {
    throw new Error('Failed to sample math or english questions!');
  }
  console.log(`✅ Successfully sampled ${mathSample.length} Math questions and ${engSample.length} English questions.`);
  console.log('Sample Math ID:', mathSample[0].id, '| Type:', mathSample[0].type || mathSample[0].answer?.style);
  console.log('Sample English ID:', engSample[0].id, '| Type:', engSample[0].type || engSample[0].answer?.style);

  // 3. Test Elo Service
  console.log('\n[3/3] Testing Elo rating calculation for Bomb Party / Multiplayer...');
  const mockPlayers = [
    { id: 'player1', elo: 1200, rank: 1, gamesPlayed: 5 }, // Winner
    { id: 'player2', elo: 1300, rank: 2, gamesPlayed: 50 }, // 2nd
    { id: 'player3', elo: 1150, rank: 3, gamesPlayed: 10 }, // 3rd
    { id: 'player4', elo: 1250, rank: 4, gamesPlayed: 2 }   // Eliminated first (4th)
  ];
  const eloResults = eloService.calculateMultiplayer(mockPlayers);
  console.log('✅ Multiplayer Elo Results:', eloResults);

  console.log('\n🎉 ALL BACKEND VERIFICATION CHECKS PASSED!');
  process.exit(0);
} catch (err) {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
}
