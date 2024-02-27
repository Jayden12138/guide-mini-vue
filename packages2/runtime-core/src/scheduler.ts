const queue: any[] = []
const activePreFlushCbs: any = []
let isFlushPending = false
const p = Promise.resolve();

export function nextTick(fn?) {
    return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

export function queuePreFlushCb(fn) {
  activePreFlushCbs.push(fn)
  
  queueFlush()
}


function queueFlush() {
    if (isFlushPending) return
    isFlushPending = true
    nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false

  // 
  flushPreFlushCbs();

  // 组件渲染
  let job
  while ((job = queue.shift())) {
    job()
  }
}

function flushPreFlushCbs() {
  for (let index = 0; index < activePreFlushCbs.length; index++) {
    activePreFlushCbs[index]();
  }
}
