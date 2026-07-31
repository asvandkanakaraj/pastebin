import { Router } from 'express';
import { PasteController } from '../controllers/paste.controller.js';

const router = Router();

router.post('/', PasteController.createPaste);
router.get('/', PasteController.listPastes);
router.get('/:id', PasteController.getPaste);
router.delete('/:id', PasteController.deletePaste);

export default router;
