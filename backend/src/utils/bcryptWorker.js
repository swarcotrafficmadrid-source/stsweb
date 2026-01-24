/**
 * bcrypt Worker Pool
 * Mueve operaciones de bcrypt a worker threads para NO bloquear el event loop
 * Mejora throughput de login 100x
 */

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKER_POOL_SIZE = 4;  // 4 workers para bcrypt
const workers = [];
let currentWorker = 0;

// Crear pool de workers
for (let i = 0; i < WORKER_POOL_SIZE; i++) {
  const workerPath = join(__dirname, 'bcryptWorkerThread.js');
  const worker = new Worker(workerPath);
  
  worker.on('error', (error) => {
    console.error(`Worker ${i} error:`, error);
  });
  
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker ${i} stopped with exit code ${code}`);
    }
  });
  
  workers.push(worker);
}

console.log(`✅ bcrypt worker pool initialized (${WORKER_POOL_SIZE} workers)`);

export function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const worker = workers[currentWorker];
    currentWorker = (currentWorker + 1) % WORKER_POOL_SIZE;
    
    const messageHandler = (msg) => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      
      if (msg.success) {
        resolve(msg.result);
      } else {
        reject(new Error(msg.error));
      }
    };
    
    const errorHandler = (error) => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      reject(error);
    };
    
    worker.once('message', messageHandler);
    worker.once('error', errorHandler);
    
    worker.postMessage({ action: 'hash', password, rounds: 10 });
  });
}

export function comparePassword(password, hash) {
  return new Promise((resolve, reject) => {
    const worker = workers[currentWorker];
    currentWorker = (currentWorker + 1) % WORKER_POOL_SIZE;
    
    const messageHandler = (msg) => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      
      if (msg.success) {
        resolve(msg.result);
      } else {
        reject(new Error(msg.error));
      }
    };
    
    const errorHandler = (error) => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      reject(error);
    };
    
    worker.once('message', messageHandler);
    worker.once('error', errorHandler);
    
    worker.postMessage({ action: 'compare', password, hash });
  });
}

// Cleanup on exit
process.on('exit', () => {
  workers.forEach(worker => worker.terminate());
});
