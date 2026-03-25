"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("./auth.js");
const services_anniversaries = require("../services/anniversaries.js");
let checking = false;
async function checkAnniversaryReminderPopup() {
  if (checking || !utils_auth.isLogin()) {
    return;
  }
  checking = true;
  try {
    const reminders = await services_anniversaries.checkAnniversaryReminders();
    if (!Array.isArray(reminders) || !reminders.length) {
      return;
    }
    const content = reminders.map((item) => `${item.title}（${item.eventDate}）`).join("\n");
    common_vendor.index.showModal({
      title: "纪念日提醒",
      content,
      showCancel: false,
      confirmText: "知道了"
    });
  } catch (error) {
  } finally {
    checking = false;
  }
}
exports.checkAnniversaryReminderPopup = checkAnniversaryReminderPopup;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/anniversary-reminder.js.map
