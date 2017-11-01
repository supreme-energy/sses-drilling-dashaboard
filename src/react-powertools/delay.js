/**
 * Returns a promise that will resolve after ms time has passed.
 * (e.g. a Promisified setTimeout)
 * @param ms
 * @returns {Promise}
 */
export default function delay(ms) {
  return new Promise(resolve => {
    if (ms > 0) {
      setTimeout(resolve, ms);
    }
    else {
      resolve();
    }
  });
}
