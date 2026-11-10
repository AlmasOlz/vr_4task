const { test } = require('node:test');
const assert = require('node:assert/strict');
const nav = require('../../src/navigation');
test('original QR ids match the shortest sample route to room 903', () => {
  assert.deepEqual(nav.shortestPath(64, 3).steps.map(s => [s.from.id, s.to.id]),
    [[64,65],[65,66],[66,67],[67,68],[68,69]]);
});
test('every marker has a connected shortest route to every destination', () => {
  for (const marker of Object.values(nav.nodes)) for (const goal of nav.goals) {
    const route = nav.shortestPath(marker.id, goal.id);
    assert.equal(route.target.placeObject.id, goal.id);
    const seen = new Set([marker.id]);
    let current = marker.id;
    for (const step of route.steps) {
      assert.equal(step.from.id, current);
      assert.ok(!seen.has(step.to.id));
      assert.ok(step.from.relationships.some(edge => edge.to === step.to.title));
      seen.add(step.to.id); current = step.to.id;
    }
    assert.equal(current, route.target.id);
    assert.equal(route.reached, marker.id === route.target.id);
  }
});
test('wrong-way scan builds a fresh route and arrival ends the route', () => {
  assert.equal(nav.shortestPath(243, 3).steps[0].from.id,243);
  assert.equal(nav.shortestPath(69, 3).reached,true);
  assert.deepEqual(nav.shortestPath(69, 3).steps,[]);
});
test('invalid scans and destinations are rejected', () => {
  assert.throws(() => nav.shortestPath(9999,3));
  assert.throws(() => nav.shortestPath(64,9999));
});
