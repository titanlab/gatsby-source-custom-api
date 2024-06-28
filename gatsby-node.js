const fetch = require('node-fetch')
const createNodeEntities = require('./createNodeEntities')
const normalizeKeys = require('./utils/normalizeKeys')
const flattenEntities = require('./utils/flattenEntities')
const loadImages = require('./utils/loadImages')
const getUrl = require('./utils/getUrl')
const getTypeDefs = require('./utils/getTypeDefs')
const buildNode = require('./utils/buildNode')

exports.createSchemaCustomization = async ({ actions }, configOptions) => {
  const { createTypes } = actions;
  const {
    imageKeys = ["image"],
    schemas = {}
  } = configOptions;

  const typeDefs = getTypeDefs(schemas, imageKeys);
  createTypes(typeDefs);
};

exports.sourceNodes = async (
  {
    actions, createNodeId, createContentDigest, store, cache, reporter
  },
  configOptions
) => {
  const { createNode, touchNode } = actions
  const {
    url,
    headers,
    auth,
    rootKey = 'customAPI',
    imageKeys = ['image'],
    schemas = {}
  } = configOptions

  const URL = getUrl(process.env.NODE_ENV, url)

  let timer = reporter.activityTimer(`requesting ${rootKey} from custom API ${URL}`)
  timer.start();
  const data = await fetch(URL, { headers }).then(res => res.json()).catch(err => console.log(err))
  timer.end();

  // build entities and correct schemas, where necessary
  timer = reporter.activityTimer(`sourcing ${rootKey}: creating ${data.length} node entities`);
  timer.start();
  let entities = createNodeEntities({
    name: rootKey,
    data,
    schemas,
    createNodeId
  })
  timer.end();

  // flatten them
  timer = reporter.activityTimer(`sourcing ${rootKey}: flattening ${entities.length} node entities`);
  timer.start();
  entities = flattenEntities(entities, [], timer);
  timer.end();

  // check for problematic keys
  timer = reporter.activityTimer(`sourcing ${rootKey}: checking for problematic keys`);
  timer.start();
  entities = entities.map(entity => ({
    ...entity,
    data: normalizeKeys(entity.data)
  }))
  timer.end();

  // load images or default-dummy-image
  timer = reporter.activityTimer(`sourcing ${rootKey}: loading images`);
  timer.start();
  entities = await loadImages({
    entities, imageKeys, createNode, createNodeId, touchNode, store, cache, createContentDigest, auth
  })
  timer.end();

  // build gatsby-node-object
  timer = reporter.activityTimer(`sourcing ${rootKey}: building gatsby-node objects`);
  timer.start();
  entities = entities.map(entity => buildNode({ entity, createContentDigest }))
  timer.end();


  // render nodes
  timer = reporter.activityTimer(`sourcing ${rootKey}: creating nodes from ${entities.length} entities`);
  timer.start();
  entities.forEach((entity) => {
    createNode(entity)
  })
  timer.end();

  reporter.info(`sourcing ${rootKey}: finished`);
}
