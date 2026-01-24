/**
 * bcrypt Worker Thread
 * Procesa operaciones de bcrypt en thread separado
 */

import { parentPort } from 'worker_threads';
import bcrypt from 'bcryptjs';

parentPort.on('message', async (msg) => {
  try {
    if (msg.action === 'hash') {
      const result = await bcrypt.hash(msg.password, msg.rounds);
      parentPort.postMessage({ success: true, result });
    } else if (msg.action === 'compare') {
      const result = await bcrypt.compare(msg.password, msg.hash);
      parentPort.postMessage({ success: true, result });
    } else {
      parentPort.postMessage({ 
        success: false, 
        error: `Unknown action: ${msg.action}` 
      });
    }
  } catch (error) {
    parentPort.postMessage({ 
      success: false, 
      error: error.message 
    });
  }
});
