class PriorityQueue {
    constructor(compare) {
      this.compare = compare;
      this.heap = [];
    }
  
    add(item) {
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
    }
  
    poll() {
      const item = this.heap[0];
      const last = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.sinkDown(0);
      }
      return item;
    }
  
    isEmpty() {
      return this.heap.length === 0;
    }
  
    bubbleUp(n) {
      const item = this.heap[n];
      while (n > 0) {
        const parentN = Math.floor((n + 1) / 2) - 1;
        const parent = this.heap[parentN];
        if (this.compare(item, parent) >= 0) break;
        this.heap[parentN] = item;
        this.heap[n] = parent;
        n = parentN;
      }
    }
  
    sinkDown(n) {
      const length = this.heap.length;
      const item = this.heap[n];
      while (true) {
        const child2N = (n + 1) * 2;
        const child1N = child2N - 1;
        let swap = null;
        if (child1N < length) {
          const child1 = this.heap[child1N];
          if (this.compare(child1, item) < 0) swap = child1N;
        }
        if (child2N < length) {
          const child2 = this.heap[child2N];
          if (this.compare(child2, item) < 0) swap = child2N;
        }
        if (swap === null) break;
        this.heap[n] = this.heap[swap];
        this.heap[swap] = item;
        n = swap;
      }
    }
  }
  
  module.exports = PriorityQueue;