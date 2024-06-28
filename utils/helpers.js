
function isObject (element) {
  if (!element) return false
  if (typeof element !== 'object') return false
  if (element instanceof Array) return false
  return true
}

function flattenArray (array) {
  const a = [];
  for(let i = 0; i < array.length; i++) {
    for(let j = 0; j < array[i].length; j++) {
      a.push(array[i][j]);
    }
  }
  return a;
}

function isArray (prop) {
  if (!prop) return false
  return prop.constructor === Array
}

module.exports = {
  isObject,
  flattenArray,
  isArray
}
