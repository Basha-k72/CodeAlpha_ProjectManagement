const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);