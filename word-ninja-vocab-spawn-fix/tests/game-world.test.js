const test = require('node:test');
const assert = require('node:assert/strict');

global.window = globalThis;
require('../public/js/vocab.js');
require('../public/js/vocab2.js');
require('../public/js/vocab3.js');
require('../public/js/data.js');
require('../public/js/core.js');

const frontendDataSnapshot = {
  maxLevel: globalThis.GD.MAX_LV,
  maps: JSON.parse(JSON.stringify(globalThis.GD.MAPS)),
  monsters: JSON.parse(JSON.stringify(globalThis.GD.MONSTERS)),
  items: JSON.parse(JSON.stringify(globalThis.GD.ITEMS)),
  skills: JSON.parse(JSON.stringify(globalThis.GD.SKILLS)),
  quests: JSON.parse(JSON.stringify(globalThis.GD.QUESTS)),
};

let gameAct;
let GD;
let CORE;

test('load server-side game rules and vocabulary', async () => {
  const mod = await import('../server/game-world.mjs');
  gameAct = mod.act;
  GD = globalThis.GD;
  CORE = globalThis.CORE;
  assert.equal(typeof gameAct, 'function');
  assert.equal(GD.MAX_LV, 50);
  assert.equal(typeof CORE.sanitize, 'function');
  assert.ok(globalThis.VOCAB_BY_ID.milk);
  // Ensure the server's bundled game rules stay exactly aligned with the FE config.
  assert.equal(GD.MAX_LV, frontendDataSnapshot.maxLevel);
  assert.deepEqual(GD.MAPS, frontendDataSnapshot.maps);
  assert.deepEqual(GD.MONSTERS, frontendDataSnapshot.monsters);
  assert.deepEqual(GD.ITEMS, frontendDataSnapshot.items);
  assert.deepEqual(GD.SKILLS, frontendDataSnapshot.skills);
  assert.deepEqual(GD.QUESTS, frontendDataSnapshot.quests);
});

function makeWorld() {
  const data = new Map();
  return {
    who: { id: 'test-account-1' },
    now: 1_800_000_000_000,
    rng: () => 0.5,
    get(key) { return data.has(key) ? data.get(key) : null; },
    put(key, value) { data.set(key, JSON.parse(JSON.stringify(value))); },
  };
}

test('level-50 content references resolve across maps, quests, skills and weapons', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const questIds = new Set(GD.QUESTS.map((q) => q.id));
  for (const [mapId, map] of Object.entries(GD.MAPS)) {
    for (const spawn of map.spawns || []) assert.ok(GD.MONSTERS[spawn.m], `map ${mapId} references missing monster ${spawn.m}`);
    for (const exit of map.exits || []) assert.ok(GD.MAPS[exit.to], `map ${mapId} references missing map ${exit.to}`);
    if (map.req && map.req.quest) assert.ok(questIds.has(map.req.quest), `map ${mapId} references missing quest ${map.req.quest}`);
    for (const spawn of map.spawns || []) if (spawn.needQuest) assert.ok(questIds.has(spawn.needQuest), `map ${mapId} spawn references missing quest ${spawn.needQuest}`);
  }
  for (const [itemId, item] of Object.entries(GD.ITEMS)) if (item.evolve) assert.ok(GD.ITEMS[item.evolve], `item ${itemId} evolves to missing ${item.evolve}`);
  for (const [skillId, skill] of Object.entries(GD.SKILLS)) for (const required of skill.need || []) assert.ok(GD.SKILLS[required], `skill ${skillId} requires missing skill ${required}`);
  for (const quest of GD.QUESTS) {
    if (quest.giver) assert.ok(GD.NPCS[quest.giver], `quest ${quest.id} references missing NPC ${quest.giver}`);
    if (quest.map) assert.ok(GD.MAPS[quest.map], `quest ${quest.id} references missing map ${quest.map}`);
    if (quest.m) assert.ok(GD.MONSTERS[quest.m], `quest ${quest.id} references missing monster ${quest.m}`);
  }
});

test('init does not create a blank save before local migration', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const w = makeWorld();
  const result = gameAct(w, { cmd: 'init', init: true });
  assert.equal(result.exists, false);
  assert.equal(result.state.level, 1);
  assert.equal(w.get('core:test-account-1'), null);
});

test('imports legacy progress through the sanitizer and preserves level 50 data', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const w = makeWorld();
  const legacy = CORE.newState(w.now);
  legacy.level = 50;
  legacy.cls = 'kiem';
  legacy.gold = 12345;
  const imported = gameAct(w, { cmd: 'import', data: legacy, words: { hello: { seen: 4, c: 3, wr: 1, streak: 2, box: 2, due: 0, last: 10 } } });
  assert.equal(imported.imported, true);
  assert.equal(imported.state.level, 50);
  assert.equal(imported.state.gold, 12345);
  assert.equal(imported.words.hello.c, 3);
  const init = gameAct(w, { cmd: 'init', init: true });
  assert.equal(init.exists, true);
  assert.equal(init.state.level, 50);
});

test('sync batches are idempotent by batch id', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const w = makeWorld();
  gameAct(w, { cmd: 'import', data: CORE.newState(w.now), words: {} });
  const batch = { cmd: 'sync', bid: 'same-batch-id', ops: [{ op: 'settings', a: { press: 'none' } }] };
  const first = gameAct(w, batch);
  const stateAfterFirst = w.get('core:test-account-1').data;
  const second = gameAct(w, batch);
  const stateAfterSecond = w.get('core:test-account-1').data;
  assert.equal(first.results[0].ok, true);
  assert.equal(second.replay, true);
  assert.equal(stateAfterFirst.syncRev, stateAfterSecond.syncRev);
  assert.equal(stateAfterSecond.settings.press, 'none');
});

test('server rejects client-submitted battle answers and validates answers in combat flow', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const w = makeWorld();
  gameAct(w, { cmd: 'import', data: CORE.newState(w.now), words: {} });
  const forged = gameAct(w, { cmd: 'sync', bid: 'forged-answer', ops: [{ op: 'answer', a: { id: 'milk', answerText: 'MILK', ok: true, t: 'food', w: 'milk' } }] });
  assert.equal(forged.results[0].ok, false);
  assert.equal(forged.results[0].why, 'server-authoritative-answer');
  assert.equal(forged.state.words.milk, undefined);
});

test('server charge skill resolves on the third correct answer for its 10-hit animation', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const w = makeWorld();
  w.vocab = [{ id: 'charge_test_milk', w: 'milk', word_key: 'milk', vi: 'sữa', lv: 'A1', t: 'food', pos: 'noun', ready: true, isCommon: true, alt: [] }];
  const legacy = CORE.newState(w.now);
  legacy.level = 30;
  legacy.cls = 'anh';
  legacy.map = 'farm1';
  legacy.mp = 99999;
  legacy.skills = { a10: 1, a15: 1, a20: 1, a25: 1 };
  gameAct(w, { cmd: 'import', data: legacy, words: {} });

  const fightId = 'charge-animation-test';
  let q = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId, spawnId: 'farm1:0:radish' });
  assert.equal(q.ok, true, JSON.stringify(q));
  const armed = gameAct(w, { cmd: 'combatSkill', fightId, questionToken: q.question.questionToken, skillId: 'a25' });
  assert.equal(armed.ok, true, JSON.stringify(armed));
  assert.equal(armed.fx.kind0, 'charge');

  async function answerCurrent() {
    const combat = w.get('combat:test-account-1');
    assert.ok(combat && combat.question, 'server should have a current question');
    // Keep the monster alive so the test isolates charge timing, not combat balance.
    combat.hp = 1000000; combat.maxHp = 1000000;
    w.put('combat:test-account-1', combat);
    w.now += 650;
    return gameAct(w, { cmd: 'vocabAnswer', monsterId: 'radish', fightId,
      questionToken: combat.question.token, answerText: combat.question.word });
  }

  const first = await answerCurrent();
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.ok(first.tags.some((tag) => tag.includes('đang tích')));
  let combat = w.get('combat:test-account-1');
  assert.equal(combat.effects.charge.count, 1);
  assert.equal(combat.effects.charge.turns, 2);

  q = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId, spawnId: 'farm1:0:radish' });
  assert.equal(q.ok, true, JSON.stringify(q));
  const second = await answerCurrent();
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.ok(!second.tags.some((tag) => tag.includes('hoàn thành')));

  q = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId, spawnId: 'farm1:0:radish' });
  assert.equal(q.ok, true, JSON.stringify(q));
  const third = await answerCurrent();
  assert.equal(third.ok, true, JSON.stringify(third));
  assert.ok(third.tags.some((tag) => tag.includes('hoàn thành')), JSON.stringify(third.tags));
  combat = w.get('combat:test-account-1');
  assert.equal(combat.effects.charge, undefined, 'charge effect should clear after its final strike');
});

test('forge view keeps evolution card in the view function scope', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const panels = fs.readFileSync(path.join(__dirname, '../public/js/panels.js'), 'utf8');
  const start = panels.indexOf('VIEWS.forge = function () {');
  const end = panels.indexOf('// The ladder of the class weapon', start);
  assert.ok(start >= 0 && end > start, 'forge view should exist');
  const forgeView = panels.slice(start, end);
  assert.match(forgeView, /let evo = ["']{2};/, 'evo must be declared in the forge view scope');
  assert.match(forgeView, /evo = evolutionCard\(it\);/, 'evo should be assigned when an item is selected');
  assert.match(forgeView, /\$\{evo\}/, 'forge template should render the evolution card');
});

test('respawn cooldown is attached to one spawn, not every monster of the same type', async () => {
  if (!gameAct) gameAct = (await import('../server/game-world.mjs')).act;
  const w = makeWorld();
  w.vocab = [{ id: 'test_milk', w: 'milk', word_key: 'milk', vi: 'sữa', lv: 'A1', t: 'food', pos: 'noun', ready: true, isCommon: true, alt: [] }];
  const legacy = CORE.newState(w.now);
  legacy.map = 'farm1';
  gameAct(w, { cmd: 'import', data: legacy, words: {} });

  const firstFight = 'fight-radish-spawn-0';
  let next = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId: firstFight, spawnId: 'farm1:0:radish' });
  assert.equal(next.ok, true, JSON.stringify(next));
  let defeated = false;
  for (let hit = 0; hit < 12; hit++) {
    const combat = w.get('combat:test-account-1');
    assert.ok(combat && combat.active && combat.question, 'first spawn should have an active question');
    w.now += 650;
    const answered = gameAct(w, {
      cmd: 'vocabAnswer', monsterId: 'radish', fightId: firstFight,
      questionToken: combat.question.token, answerText: combat.question.word,
    });
    assert.equal(answered.ok, true, JSON.stringify(answered));
    if (answered.monsterDefeated) { defeated = true; break; }
    w.now += 10;
    next = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId: firstFight, spawnId: 'farm1:0:radish' });
    assert.equal(next.ok, true, JSON.stringify(next));
  }
  assert.equal(defeated, true, 'first radish should be defeated during the test');
  const saved = w.get('core:test-account-1').data;
  assert.ok(saved.spawnKills['farm1:0:radish'] > w.now, 'cooldown should be saved for the exact killed spawn');

  const second = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId: 'fight-radish-spawn-1', spawnId: 'farm1:1:radish' });
  assert.equal(second.ok, true, 'a different radish spawn must remain attackable');
  const firstAgain = gameAct(w, { cmd: 'vocabQuestion', monsterId: 'radish', fightId: 'fight-radish-spawn-0-retry', spawnId: 'farm1:0:radish' });
  assert.equal(firstAgain.ok, false);
  assert.equal(firstAgain.why, 'respawn', 'the killed physical spawn should still observe its own cooldown');
});
