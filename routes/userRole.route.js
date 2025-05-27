import express from 'express';
import { createRole, getUserRoleList, editRole, deleteRole } from '../controllers/userRole.controller.js';

const router = express.Router();

router.post('/super-new-user-role', createRole);
router.get('/super-user-role-list', getUserRoleList);
router.put('/super-user-role/:id', editRole);
router.delete('/super-user-role/:id', deleteRole);

export default router;
