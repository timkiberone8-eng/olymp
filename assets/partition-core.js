(function (scope) {
  const outline = ['1100000', '1100001', '1111111', '1111111', '1100001', '1100000'];
  const cells = outline.flatMap((row, y) => [...row].flatMap((bit, x) => bit === '1' ? [[x, y]] : []));
  function connected(points) {
    const unseen = new Set(points.map(([x, y]) => `${x},${y}`));
    const queue = [points[0]];
    unseen.delete(points[0].join(','));
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${x + dx},${y + dy}`;
        if (unseen.delete(key)) queue.push([x + dx, y + dy]);
      }
    }
    return unseen.size === 0;
  }
  function signature(points) {
    const variants = [];
    for (const mirror of [1, -1]) {
      let turned = points.map(([x, y]) => [x * mirror, y]);
      for (let turn = 0; turn < 4; turn++) {
        const minX = Math.min(...turned.map(p => p[0]));
        const minY = Math.min(...turned.map(p => p[1]));
        variants.push(turned.map(([x, y]) => [x - minX, y - minY]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(p => p.join(',')).join(';'));
        turned = turned.map(([x, y]) => [-y, x]);
      }
    }
    return variants.sort()[0];
  }
  function validate(assignment) {
    if (!Array.isArray(assignment) || assignment.length !== cells.length || assignment.some(v => ![1, 2, 3].includes(v))) return 'coverage';
    const parts = [1, 2, 3].map(part => cells.filter((_, i) => assignment[i] === part));
    if (parts.some(part => part.length !== 8)) return 'size';
    if (parts.some(part => !connected(part))) return 'connected';
    if (new Set(parts.map(signature)).size !== 1) return 'shape';
    return 'valid';
  }
  const api = {cells, signature, validate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.PartitionPuzzle = api;
})(globalThis);
