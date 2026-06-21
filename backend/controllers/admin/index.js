const login          = require('./login');
const listComments   = require('./listComments');
const updateComment  = require('./updateComment');
const deleteComment  = require('./deleteComment');
const approveComment = require('./approveComment');
const suggestReply   = require('./suggestReply');

module.exports = { login, listComments, updateComment, deleteComment, approveComment, suggestReply };
