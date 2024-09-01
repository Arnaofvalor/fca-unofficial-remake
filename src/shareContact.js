"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  return function shareContact(text, senderID, threadID, callback) {
    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }

    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    var form = {
      app_id: '2220391788200892',
      payload: JSON.stringify({
        tasks: [{
          label: '359',
          payload: JSON.stringify({
            contact_id: senderID,
            sync_group: 1,
            text: text || "",
            thread_id: threadID
          }),
          queue_name: 'messenger_contact_sharing',
          task_id: ctx.wsTaskNumber,
          failure_count: null,
        }],
        epoch_id: parseInt(utils.generateOfflineThreadingID()),
        version_id: '7214102258676893',
      }),
      request_id: ctx.wsReqNumber,
      type: 3
    };

    if (isCallable(callback)) {
      ctx.reqCallbacks[ctx.wsReqNumber] = callback;
    }

    ctx.mqttClient.publish('/ls_req', JSON.stringify(form), { qos: 1, retain: false });
  };
};

function isCallable(func) {
  try {
    Reflect.apply(func, null, []);
    return true;
  } catch (error) {
    return false;
  }
}
