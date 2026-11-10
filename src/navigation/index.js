// Browser-side implementation of the original marker graph (api/managedb.php).
const graph = require('./graph.json');
const nodes = {};
const byTitle = {};
const goals = graph.placeObjects.filter(room => room.type !== 'service');
graph.placeObjects.forEach(room => room.markers.forEach(marker => {
  nodes[marker.id] = { ...marker, placeObject: room };
  byTitle[marker.title] = marker.id;
}));

function shortestPath(startId, goalId) {
  const start = nodes[startId];
  const goal = goals.find(item => item.id === Number(goalId));
  if (!start || !goal) throw new Error('Unknown marker or destination');
  const target = goal.markers.find(marker => marker.primary !== false);
  if (!target) throw new Error('Destination has no primary marker');
  const queue = [start.id];
  const parent = new Map([[start.id, null]]);
  while (queue.length) {
    const id = queue.shift();
    if (id === target.id) break;
    for (const edge of nodes[id].relationships || []) {
      const next = byTitle[edge.to];
      if (next !== undefined && !parent.has(next)) {
        parent.set(next, { id, edge });
        queue.push(next);
      }
    }
  }
  if (!parent.has(target.id)) throw new Error('No route to destination');
  const steps = [];
  let id = target.id;
  while (parent.get(id)) {
    const previous = parent.get(id);
    steps.unshift({ from: nodes[previous.id], to: nodes[id], directions: previous.edge.directions });
    id = previous.id;
  }
  return { steps, target: nodes[target.id], reached: start.id === target.id };
}

function directionText(degrees) {
  if (degrees < 23 || degrees >= 338) return 'Пройдите прямо';
  if (degrees < 68) return 'Повернитесь немного правее';
  if (degrees < 113) return 'Повернитесь направо';
  if (degrees < 248) return 'Развернитесь';
  if (degrees < 293) return 'Повернитесь налево';
  return 'Повернитесь немного левее';
}
module.exports = { graph, nodes, goals, shortestPath, directionText };
