import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('🧪 Starting San Lorenzo Historico Data Integrity & Consistency Tests...\n');

  const dataPath = path.resolve('public/data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ ERROR: public/data.json does not exist. Please generate it first.');
    process.exit(1);
  }

  // 1. Load Data
  let data;
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(raw);
    console.log('✅ PASS: public/data.json parses successfully as valid JSON.');
  } catch (err) {
    console.error('❌ FAIL: Failed to parse public/data.json:', err.message);
    process.exit(1);
  }

  // 2. Structural Keys
  if (!data.candidates || !Array.isArray(data.candidates)) {
    console.error('❌ FAIL: "candidates" field is missing or not an array.');
    process.exit(1);
  } else {
    console.log(`✅ PASS: "candidates" array loaded with ${data.candidates.length} candidates.`);
  }

  if (!data.agrupaciones || typeof data.agrupaciones !== 'object') {
    console.error('❌ FAIL: "agrupaciones" field is missing or not an object.');
    process.exit(1);
  } else {
    const groupingCount = Object.keys(data.agrupaciones).length;
    console.log(`✅ PASS: "agrupaciones" object loaded with ${groupingCount} political reviews.`);
  }

  // 3. Candidate & History Checks
  let totalCandidacies = 0;
  let missingListNames = 0;
  let emptyHistoryCount = 0;
  const uniqueCandidateLists = new Set();

  data.candidates.forEach((c, idx) => {
    if (!c.name || typeof c.name !== 'string') {
      console.warn(`⚠️ WARNING: Candidate at index ${idx} is missing a valid name.`);
    }

    if (!c.history || !Array.isArray(c.history)) {
      console.warn(`⚠️ WARNING: Candidate "${c.name || idx}" is missing a history array.`);
    } else if (c.history.length === 0) {
      emptyHistoryCount++;
    } else {
      c.history.forEach((h, hIdx) => {
        totalCandidacies++;
        if (!h.list) {
          missingListNames++;
          console.warn(`⚠️ WARNING: Candidate "${c.name}" has empty list name at history index ${hIdx}.`);
        } else {
          uniqueCandidateLists.add(h.list);
        }
      });
    }
  });

  if (emptyHistoryCount > 0) {
    console.warn(`⚠️ WARNING: There are ${emptyHistoryCount} candidates with empty history lists.`);
  } else {
    console.log('✅ PASS: All candidates have active history lists.');
  }

  if (missingListNames > 0) {
    console.error(`❌ FAIL: Found ${missingListNames} candidacies with empty list names.`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: Checked all ${totalCandidacies} candidacies, none are missing a list name.`);
  }

  // 4. Grouping Reference & Normalization Gaps
  console.log('\n🔍 Cross-referencing candidates lists with political groupings descriptions...');
  let missingDescriptions = 0;
  const listNamesWithoutReviews = [];

  uniqueCandidateLists.forEach(listName => {
    if (listName === '(Sin datos)') return;

    if (!data.agrupaciones[listName]) {
      missingDescriptions++;
      listNamesWithoutReviews.push(listName);
    }
  });

  if (missingDescriptions > 0) {
    console.warn(`⚠️ INFO: There are ${missingDescriptions} list names appearing in candidates but without reviews inside the "agrupaciones" sheet:`);
    listNamesWithoutReviews.forEach(l => console.log(`   - "${l}"`));
    console.log('   (Note: This is expected if the AGRUPACIONES sheet does not provide reviews for every single list version.)');
  } else {
    console.log('✅ PASS: Every single political list mentioned in the candidates history has a matching historical review description!');
  }

  // 5. Check descriptions text content
  let emptyReviews = 0;
  Object.entries(data.agrupaciones).forEach(([name, desc]) => {
    if (!desc || typeof desc !== 'string' || !desc.trim()) {
      emptyReviews++;
      console.warn(`⚠️ WARNING: Grouping "${name}" has an empty review description.`);
    }
  });

  if (emptyReviews > 0) {
    console.warn(`⚠️ WARNING: Found ${emptyReviews} political groupings with empty reviews.`);
  } else {
    console.log('✅ PASS: All political groupings descriptions are populated and non-empty.');
  }

  console.log('\n🎉 ALL DATA INTEGRITY TESTS COMPLETED SUCCESSFULY!');
}

runTests();
