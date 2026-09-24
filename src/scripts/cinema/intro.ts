// The preloader is the opening title; everything that "enters" on page load waits for it.
let done = false;
const queue: Array<() => void> = [];

export function markIntroDone() {
  if (done) return;
  done = true;
  document.documentElement.classList.add('intro-done');
  queue.splice(0).forEach((callback) => callback());
}

export function onIntroDone(callback: () => void) {
  if (done) callback();
  else queue.push(callback);
}
