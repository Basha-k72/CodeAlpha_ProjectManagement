const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// కొత్త టాస్క్ యాడ్ చేయడం
router.post('/', auth, async (req, res) => {
    try {
        const newTask = new Task({ 
            title: req.body.title, 
            projectId: req.body.projectId 
        });
        res.status(201).json(await newTask.save());
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// ఒక ప్రాజెక్ట్ లోని టాస్క్స్ చూడటం
router.get('/:projectId', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId });
        res.json(tasks);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// టాస్క్ స్టేటస్ మార్చడం (Todo -> Done)
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(task);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// టాస్క్ డిలీట్ చేయడం
router.delete('/:id', auth, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

module.exports = router;