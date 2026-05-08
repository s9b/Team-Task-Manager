const router = require('express').Router();
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const requireProjectAdmin = require('../middleware/requireProjectAdmin');
const {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');

const projectNameRules = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
];

const memberRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
];

router.get('/', authenticate, listProjects);
router.post('/', authenticate, projectNameRules, createProject);
router.get('/:id', authenticate, getProject);
router.put('/:id', authenticate, requireProjectAdmin, projectNameRules, updateProject);
router.delete('/:id', authenticate, requireProjectAdmin, deleteProject);
router.post('/:id/members', authenticate, requireProjectAdmin, memberRules, addMember);
router.delete('/:id/members/:userId', authenticate, requireProjectAdmin, removeMember);

module.exports = router;
