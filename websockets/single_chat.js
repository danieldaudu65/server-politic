// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const Conversation = require('../models/conversation');
// const Message = require("../models/message");
// const User = require("../models/User");

// const { sendNotificationToDevice } = require("../controllers/push_notification_controller");
// const verifyToken = require("../utils/verifyToken");

// // function to send push notification
// const handleNotification = async (receiver_id, post_img, notiTitle, notiSubtitle, data) => {
//     const user = await User.findOne({ _id: receiver_id }, { settings: 1, device_token: 1, os_type: 1 }).lean();
//     if (user?.device_token && user.settings?.receive_notifications === 'yes') {
//         sendNotificationToDevice([user.device_token], post_img, notiTitle, notiSubtitle, data, user.os_type);
//     }
// }

// /**
//  * Send a single chat message
//  * @param {Object} message
//  * @param {Socket} socket
//  * @param {Server} io
//  * @param {Function} callback
//  */
// const singleChatSendMessage = async (message, socket, io, callback) => {
//     // required fields check
//     if (
//         !message.token ||
//         !message.conversation_id ||
//         !message.sender_name ||
//         !message.sender_id ||
//         !message.sender_img ||
//         !message.receiver_id ||
//         !message.message ||
//         !message.msg_type
//     ) {
//         io.sockets.emit(`receive-error-message-${message.token}`, "All fields must be filled");
//         return;
//     }

//     try {
//         // verify JWT
//         const user = verifyToken(message.token);

//         // create message document
//         const nMessage = new Message({
//             timestamp: Date.now(),
//             conversation_id: message.conversation_id,
//             sender_name: message.sender_name,
//             sender_id: message.sender_id,
//             sender_img: message.sender_img,
//             receiver_id: message.receiver_id,
//             message: message.message,
//             msg_type: message.msg_type,
//         });

//         await nMessage.save();

//         // update conversation last message
//         await Conversation.updateOne(
//             { _id: message.conversation_id },
//             {
//                 $set: {
//                     lastest_msg: {
//                         latest_message: message.message,
//                         latest_message_timestamp: Date.now(),
//                         fullname: message.sender_name,
//                         img_url: message.sender_img,
//                     },
//                 },
//                 $inc: { msg_count: 1 },
//             }
//         );

//         // emit message to all listeners in this conversation
//         io.sockets.emit(`receive-message-${message.conversation_id}`, {
//             status: "ok",
//             msg: "Message sent",
//             message: nMessage,
//         });

//         // callback to sender
//         if (callback) {
//             callback({
//                 status: "ok",
//                 msg: "Message delivered successfully",
//                 message: nMessage,
//             });
//         }

//         // optional push notification
//         const notification = {
//             noti_type: 'msg',
//             message: message.message,
//             conv_id: message.conversation_id,
//             sender_name: message.sender_name,
//             sender_id: message.sender_id,
//             read: false,
//             timestamp: Date.now(),
//             msg_type: message.msg_type,
//             sender_img: message.sender_img,
//         };

//         const subTitle = `${message.sender_name}: ${message.message}`;
//         setTimeout(handleNotification, 1000, message.receiver_id, message.sender_img, process.env.APP_NAME, subTitle, notification);

//     } catch (e) {
//         console.error("Error sending message:", e);
//         io.to(message.token).emit(`receive-error-message`, e.message || "Something went wrong");

//         if (callback) {
//             callback({
//                 status: "error",
//                 msg: e.message || "Something went wrong",
//             });
//         }
//     }
// }

// module.exports = { singleChatSendMessage };
