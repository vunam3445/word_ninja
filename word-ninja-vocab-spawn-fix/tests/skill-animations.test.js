const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const world = fs.readFileSync(path.join(root, 'public/js/world.js'), 'utf8');
const battle = fs.readFileSync(path.join(root, 'public/js/battle.js'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server/game-world.mjs'), 'utf8');

test('ported world scene contains the attack, ultimate, buff and status VFX primitives', () => {
  for (const method of [
    '_blade(', '_crescent(', '_ring(', '_burst(', '_shadow(', 'playHit(', 'fxStrike(',
    'fxMulti(', 'fxOrb(', 'fxNeedles(', 'fxCrescent(', 'fxWhirl(', 'fxUltimate(',
    'castBuff(', 'fxGuard(', 'guardBlock(', 'fxBind(', 'fxZone(', 'zonePulse(',
    'fxCalm(', 'fxEvade(', 'fxDash(', 'fxChainStart(', 'fxChainStep(',
    'fxChargeStart(', 'fxChargeStep(', 'fxChargeStepForClass(', 'playChargeFinish(',
    'procPoison(', 'procFollowUp(', 'procShield(', 'procCrit(', 'procDodge(',
    'clearStatusFx(', 'attackFx(', 'inkSlash(', 'hitMonster(',
  ]) assert.ok(world.includes(method), `missing animation method ${method}`);
});

test('battle answer flow uses server-resolved damage/tags only to trigger VFX', () => {
  for (const hook of ['resolveVisualFx(', 'playServerAnswerVfx(', 'scene.playHit?.(', 'scene.castBuff?.(', 'scene.playChargeFinish?.(', 'scene.fxChainStep?.(']) {
    assert.ok(battle.includes(hook), `missing battle VFX hook ${hook}`);
  }
  assert.match(battle, /const chainWasActive = this\._vfxChainTurns > 0;/);
  assert.match(battle, /else if \(chainWasActive && !handledByCharge\)/);
  assert.match(battle, /fxChargeStepForClass\?\.\(this\._vfxCharge\.count, this\._vfxCharge\.cls \|\| cls\)/);
});

test('server charge skill counts the cast answer as its first correct step', () => {
  assert.match(server, /combat\.effects\.charge = \{ turns: Math\.max\(1, Number\(fx\.n \|\| 3\)\), count: 1,/);
  assert.match(server, /tags\.push\(\(combat\.effects\.charge\.name \|\| 'Tích lực'\) \+ ' hoàn thành'\)/);
});
