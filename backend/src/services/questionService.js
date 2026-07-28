const fs = require('fs');
const path = require('path');

class QuestionService {
  constructor() {
    this.questionsMap = new Map();
    this.allQuestions = [];
    this.bySubject = {
      math: [],
      english: []
    };
    this.byDifficulty = {
      E: [],
      M: [],
      H: []
    };
    this.isLoaded = false;
  }

  loadQuestions() {
    if (this.isLoaded) return;

    try {
      // Resolve path to questions.json in workspace root
      const candidatePaths = [
        path.resolve(__dirname, '../../../questions.json'),
        path.resolve(process.cwd(), 'questions.json'),
        path.resolve(__dirname, '../../questions.json')
      ];

      let filePath = null;
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          filePath = p;
          break;
        }
      }

      if (!filePath) {
        throw new Error('questions.json not found in workspace root or relative paths.');
      }

      console.log(`Loading question bank from: ${filePath} ...`);
      const startTime = Date.now();
      const rawData = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(rawData);

      let count = 0;
      for (const [uuid, q] of Object.entries(parsed)) {
        if (!q || !q.content) continue;

        const id = uuid;
        const subject = this.classifySubject(q);
        const difficulty = (q.difficulty || 'M').toUpperCase();
        const diffKey = ['E', 'M', 'H'].includes(difficulty) ? difficulty : 'M';

        const enrichedQuestion = {
          ...q,
          id,
          subject,
          difficulty: diffKey
        };

        this.questionsMap.set(id, enrichedQuestion);
        if (q.questionId) {
          this.questionsMap.set(q.questionId, enrichedQuestion);
        }
        if (q.external_id) {
          this.questionsMap.set(q.external_id, enrichedQuestion);
        }

        this.allQuestions.push(enrichedQuestion);
        this.bySubject[subject].push(enrichedQuestion);
        this.byDifficulty[diffKey].push(enrichedQuestion);

        count++;
      }

      const elapsed = Date.now() - startTime;
      console.log(`Successfully indexed ${count} SAT questions in ${elapsed}ms!`);
      console.log(`- Math questions: ${this.bySubject.math.length}`);
      console.log(`- English (Reading/Writing) questions: ${this.bySubject.english.length}`);
      console.log(`- Easy: ${this.byDifficulty.E.length}, Medium: ${this.byDifficulty.M.length}, Hard: ${this.byDifficulty.H.length}`);

      this.isLoaded = true;
    } catch (err) {
      console.error('Failed to load questions.json:', err);
      throw err;
    }
  }

  classifySubject(q) {
    const mod = (q.module || '').toLowerCase();
    const sec = (q.section || '').toLowerCase();
    const pccDesc = (q.primary_class_cd_desc || '').toLowerCase();

    if (mod === 'math' || sec === 'math' || pccDesc.includes('algebra') || pccDesc.includes('geometry') || pccDesc.includes('math')) {
      return 'math';
    }
    if (mod === 'english' || mod === 'rw' || mod === 'reading' || mod === 'writing' || sec.includes('read') || sec.includes('writ') || pccDesc.includes('idea') || pccDesc.includes('craft') || pccDesc.includes('expression')) {
      return 'english';
    }

    // Default fallback based on primary_class_cd
    const pcc = (q.primary_class_cd || '').toUpperCase();
    if (['H', 'P', 'Q', 'S'].includes(pcc)) {
      return 'math';
    }
    return 'english';
  }

  getQuestionById(id) {
    if (!this.isLoaded) this.loadQuestions();
    return this.questionsMap.get(id) || null;
  }

  getBatchByIds(ids) {
    if (!this.isLoaded) this.loadQuestions();
    if (!Array.isArray(ids)) return [];
    return ids.map(id => this.getQuestionById(id)).filter(Boolean);
  }

  getRandomQuestions({ subject = 'both', difficulty = 'MIXED', count = 10 } = {}) {
    if (!this.isLoaded) this.loadQuestions();

    let pool = this.allQuestions;

    // Filter by subject
    if (subject === 'math') {
      pool = this.bySubject.math;
    } else if (subject === 'english') {
      pool = this.bySubject.english;
    } else if (subject === 'both' || subject === 'split') {
      // For split/both, we try to pick half math, half english
      const halfCount = Math.floor(count / 2);
      const otherHalf = count - halfCount;
      const mathSample = this.samplePool(this.filterByDifficulty(this.bySubject.math, difficulty), halfCount);
      const engSample = this.samplePool(this.filterByDifficulty(this.bySubject.english, difficulty), otherHalf);
      return this.shuffle([...mathSample, ...engSample]);
    }

    // Filter by difficulty
    pool = this.filterByDifficulty(pool, difficulty);

    // Sample random questions from pool
    return this.samplePool(pool, count);
  }

  filterByDifficulty(pool, difficulty) {
    if (!difficulty || difficulty === 'MIXED') return pool;
    const diff = difficulty.toUpperCase();
    if (!['E', 'M', 'H'].includes(diff)) return pool;
    return pool.filter(q => q.difficulty === diff);
  }

  samplePool(pool, count) {
    if (!pool || pool.length === 0) return [];
    if (pool.length <= count) return this.shuffle([...pool]);

    const result = [];
    const usedIndices = new Set();
    while (result.length < count) {
      const idx = Math.floor(Math.random() * pool.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        result.push(pool[idx]);
      }
    }
    return result;
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  getStats() {
    if (!this.isLoaded) this.loadQuestions();
    return {
      total: this.allQuestions.length,
      math: this.bySubject.math.length,
      english: this.bySubject.english.length,
      easy: this.byDifficulty.E.length,
      medium: this.byDifficulty.M.length,
      hard: this.byDifficulty.H.length
    };
  }
}

module.exports = new QuestionService();
