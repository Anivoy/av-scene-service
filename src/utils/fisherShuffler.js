/**
 * Fisher–Yates shuffle (in-place)
 * @template T
 * @param {T[]} array - the array to shuffle (will be mutated)
 * @returns {T[]} same array, shuffled
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
