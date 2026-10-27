const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

// కొత్త ప్రాజెక్ట్ క్రియేట్ చేయడం
router.post('/', auth, async (req, res) => {
    try {
        const newProject = new Project({ 
            name: req.body.name, 
            description: req.body.description,
            userId: req.user.id 
        });
        res.status(201).json(await newProject.save());
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// నా ప్రాజెక్టులు చూడటం
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id });
        res.json(projects);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

//
router.delete('/:id', auth, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        await Task.deleteMany({ projectId: req.params.id });
        res.json({ msg: 'Project deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

module.exports = router;