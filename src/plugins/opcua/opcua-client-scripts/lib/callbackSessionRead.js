/* eslint-disable no-unused-vars */
const {
  appRoot,
  inspector,
  assert,
  isString,
} = require('../../../lib');

const {
  isNodeId,
  formatSimpleDataValue,
} = require('../../../opcua/opcua-helper');

const {
  showInfoForHandler2,
} = require('../../../opcua/opcua-subscriptions/lib');

const loOmit = require('lodash/omit');

const defaultReadValueIdOptions = require(`${appRoot}/src/api/opcua/config/ReadValueIdOptions`);

const isDebug = false;

/**
 * @async
 * @example
   *
   *   ``` javascript
   *   const nodesToRead = [{
   *          nodeId: "ns=2;s=Furnace_1.Temperature",
   *          attributeId: AttributeIds.BrowseName
   *        }];
   *   await session.read(nodesToRead) {
   *     ...
   *   });
   *   ```
 * @name callbackSessionRead
 * @param {Object} session 
 * @param {Object} params 
 * @returns {String}
 */
const callbackSessionRead = async (session, params) => {
  let itemNodeIds = [], itemNodeId;
  //-------------------------
  if (isDebug && params) inspector('callbackSessionRead.params:', loOmit(params, ['app']));
  const nodesToRead = params.sessReadOpts.nodesToRead;
  const showReadValues = params.sessReadOpts.showReadValues;
  if (Array.isArray(nodesToRead)) {
    for (let index = 0; index < nodesToRead.length; index++) {
      const nodeToRead = nodesToRead[index];
      if (isString(nodeToRead)) {
        assert(isNodeId(nodeToRead), `Wrong format - nodeId: ${nodeToRead}`);
        itemNodeId = Object.assign({}, defaultReadValueIdOptions, { nodeId: nodeToRead });
        itemNodeIds.push(itemNodeId);
      } else {
        itemNodeId = Object.assign({}, defaultReadValueIdOptions, nodeToRead);
        itemNodeIds.push(itemNodeId);
      }
    }
  } else {
    if (isString(nodesToRead)) {
      assert(isNodeId(nodesToRead), `Wrong format - nodeId: ${nodesToRead}`);
      itemNodeId = Object.assign({}, defaultReadValueIdOptions, { nodeId: nodesToRead });
      itemNodeIds.push(itemNodeId);
    } else {
      itemNodeId = Object.assign({}, defaultReadValueIdOptions, nodesToRead);
      itemNodeIds.push(itemNodeId);
    }
  }

  if (isDebug && itemNodeIds.length) inspector('callbackSessionRead.itemNodeIds:', itemNodeIds);
  // Session read data
  let readValues = await session.read(itemNodeIds);
  // Format simple DataValue
  readValues = formatSimpleDataValue(readValues);
  if (isDebug && readValues.length) inspector('callbackSessionRead.readValues:', readValues);
  // Get statusCode
  let statusCode = readValues.filter(v => v.statusCode.name === 'Good').length === readValues.length;
  if (showReadValues) {
    console.log('<-------------------------------------------------------------------------------------->');
    for (let index = 0; index < itemNodeIds.length; index++) {
      const nodeId = itemNodeIds[index].nodeId;
      showInfoForHandler2({ addressSpaceOption: nodeId }, readValues[index]);
    }
    console.log('<-------------------------------------------------------------------------------------->');
  }

  return { statusCode: statusCode ? 'Good' : 'Bad', readValues };
};

module.exports = callbackSessionRead;