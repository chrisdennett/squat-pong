export function getRandomArrayItem(arr) {
  const max = arr.length - 1;
  const randInt = getRandomInt(0, max);
  return arr[randInt];
}

export function getRandomInt(min, max) {
  const range = max - min;
  return min + Math.round(range * Math.random());
}
