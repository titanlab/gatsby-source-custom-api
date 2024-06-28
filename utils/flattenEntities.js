function removeChildEntities (ent) {
  const { childEntities, ...rest } = ent
  return rest
}

function flattenEntities (entities, flat, timer, level = 0) {
  let flatEntities = flat || []
  entities.forEach((ent, index) => {
    timer.setStatus(`level ${level}: ${index}/${entities.length}`);

    //flatEntities = [...flatEntities, removeChildEntities(ent)]
    flatEntities.push(removeChildEntities(ent));
    if (ent.childEntities) {
      flatEntities = flattenEntities(ent.childEntities, flatEntities, timer, level+1)
    }
  })
  return flatEntities
}

module.exports = flattenEntities
