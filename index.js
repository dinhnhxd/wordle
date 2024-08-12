const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
const fs = require('fs');
function loadFiveLetterWords() {
    const words = fs.readFileSync('words.txt', 'utf-8').split('\n');
    const fiveLetterWords = words.filter(word => word.length === 5);
    return fiveLetterWords;
  }
  
const wordList = loadFiveLetterWords();

function getTargetWord(seed) {
    const seedString = seed.toString(); // Chuyển đổi seed thành chuỗi
    const hash = crypto.createHash('sha256').update(seedString).digest('hex');
    const index = parseInt(hash.slice(0, 8), 16) % wordList.length;
    return wordList[index];
  }

// Hàm để kiểm tra kết quả đoán
function checkGuess(guess, targetWord) {
  return guess.split('').map((char, index) => {
    let result = 'wrong';
    if (char === targetWord[index]) {
      result = 'correct';
    } else if (targetWord.includes(char)) {
      result = 'present';
    }
    return {
      slot: index,
      guess: char,
      result: result
    };
  });
}

app.get('/random', (req, res) => {
  const { guess, seed } = req.query;
  if (!guess || !seed) {
    return res.status(400).json({ error: 'Guess and seed are required' });
  }
  if (!guess || guess.length !== 5) {
    return res.status(400).json({ error: 'Guess must be exactly 5 letters long' });
  }

  // Kiểm tra điều kiện của seed
  if (!seed || isNaN(parseInt(seed)) || parseInt(seed) < 0) {
    return res.status(400).json({ error: 'Seed must be a non-negative integer' });
  }

  const targetWord = getTargetWord(parseInt(seed));
  const result = checkGuess(guess, targetWord);

  res.json(result);

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
