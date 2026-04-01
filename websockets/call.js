const jwt = require("jsonwebtoken")
const Call = require("../models/call");
require("dotenv").config();

// function to initiate call
const initiateCall = async (message, socket, io) => {
  // check for required fields
  if (
    !message.token ||
    !message.caller_id ||
    !message.receiver_id ||
    // !message.user_call_token ||
    // !message.vendor_call_token ||
    !message.call_token ||
    !message.channel_name ||
    !message.caller_fullname ||
    !message.caller_img_url ||
    !message.receiver_fullname ||
    !message.receiver_img_url ||
    !message.designation
  ) {
    io.sockets.emit(`receive-error-message-${message.token}`, "all fields must be filled");
    return
  }
  try {
    // // update caller call document
    // const caller = await Call.findOneAndUpdate({ user_id: message.caller_id }, {
    //   disable_other_incoming_calls: true, call_in_progress: true, is_calling: true,
    //   call_token: message.call_token, channel_name: message.channel_name, designation: message.designation,
    //   fullname: message.receiver_fullname, img_url: message.receiver_img_url
    // }, { new: true }).lean();

    // update receiver call document
    const receiver = await Call.findOneAndUpdate({ user_id: message.receiver_id }, {
      is_calling: true, disable_other_incoming_calls: true, designation: message.designation,
      call_token: message.call_token, channel_name: message.channel_name, designation: message.designation,
      fullname: message.caller_fullname, img_url: message.caller_img_url
    }, { new: true }).lean();


    io.sockets.emit(`call-${message.receiver_id}`, { status: "ok", msg: "success", message: receiver });
  } catch (e) {
    console.log(e);
    // send error message to all sockets that belong to that room with the same conversation id
    io.to(message.token).emit(`receive-error-message`, e);
  }

}

// function to accept call
const acceptCall = async (message, socket, io) => {
  // check for required fields
  if (
    !message.token ||
    !message.receiver_id ||
    !message.call_token
  ) {
    io.sockets.emit(`receive-error-message-${message.token}`, "all fields must be filled");
    return
  }
  try {
    // update receiver call document
    const receiver = await Call.findOneAndUpdate({ user_id: message.receiver_id }, {
      disable_other_incoming_calls: true, call_in_progress: true, is_calling: true,
    }, { new: true }).lean();

    io.sockets.emit(`call-${message.call_token}`, { status: "ok", msg: "success", message: receiver });

  } catch (e) {
    console.log(e);
    // send error message to all sockets that belong to that room with the same conversation id
    io.to(message.token).emit(`receive-error-message`, e);
  }
}

// function to end call
const endCall = async (message, socket, io) => {
  // check for required fields
  if (
    !message.token ||
    !message.receiver_id ||
    !message.call_token ||
    !message.caller_id
  ) {
    io.sockets.emit(`receive-error-message-${message.token}`, "all fields must be filled");
    return
  }
  try {
    // update caller call document
    const caller = await Call.findOneAndUpdate({ user_id: message.caller_id }, {
      disable_other_incoming_calls: false, call_in_progress: false, is_calling: false
    }, { new: true }).lean();

    // update receiver call document
    const receiver = await Call.findOneAndUpdate({ user_id: message.receiver_id }, {
      disable_other_incoming_calls: false, is_calling: false, call_in_progress: false,
      call_token: "", channel_name: "", designation: "",
      fullname: "", img_url: ""
    }, { new: true }).lean();

    io.sockets.emit(`call-${message.call_token}`, { status: "ok", msg: "success", message: receiver });

  } catch (e) {
    console.log(e);
    // send error message to all sockets that belong to that room with the same conversation id
    io.to(message.token).emit(`receive-error-message`, e);
  }
}

module.exports = {
  initiateCall,
  acceptCall,
  endCall
}