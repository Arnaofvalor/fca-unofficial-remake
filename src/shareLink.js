"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  return async function shareLink(text, url, threadID, callback) {
    let resolveFunc;
    let rejectFunc;
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    // Tăng số request_id
    ctx.wsReqNumber += 1;

    const payload = {
      app_id: "2220391788200892",
      payload: JSON.stringify({
        tasks: [{
          label: 46, // Label tùy chỉnh cho loại nhiệm vụ
          payload: JSON.stringify({
            otid: utils.generateOfflineThreadingID(),
            source: 524289,
            sync_group: 1,
            send_type: 6,
            mark_thread_read: 0,
            url: url || "",
            text: text || "",
            thread_id: threadID,
            initiating_source: 0
          }),
          queue_name: threadID, // Thay đổi tùy theo yêu cầu
          task_id: ctx.wsTaskNumber, // Sử dụng wsTaskNumber để định danh nhiệm vụ
          failure_count: null
        }],
        epoch_id: utils.generateOfflineThreadingID(),
        version_id: '7191105584331330'
      }),
      request_id: ctx.wsReqNumber,
      type: 3
    };

    // Đăng tải nội dung lên MQTT broker
    ctx.mqttClient.publish('/ls_req', JSON.stringify(payload), {
      qos: 1,
      retain: false
    }, function (error) {
      if (error) {
        return callback(error, null);
      }
      callback(null, 'Message sent successfully');
    });

    return returnPromise;
  };
};
