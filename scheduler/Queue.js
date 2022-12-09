class Queue {
    constructor(compare) {
        this.compare = compare
        this.heap = []
        this.graph = {}
        this.backEdges = {}
        this.priorities = new Map()
    }

    add(item) {
        this.heap.push(item)
        this.graph[item] = {id: item.id, dependencies: item.dependency, priority: item.priority}
        for (let dep of item.dependency) {
            if (this.backEdges[dep]) {
                this.backEdges[dep].push(item)
            } else {
                this.backEdges[dep] = [item]
            }
        }
        this.priorities.set(item.id, item.priority)
        this.bubbleUp(this.heap.length - 1)
    }

    poll() {
        const item = this.heap[0]
        const last = this.heap.pop()
        if (this.heap.length > 0) {
            this.heap[0] = last
            this.sinkDown(0)
        }
        return item
    }

    isEmpty() {
        return this.heap.length === 0
    }

    isDependent(item, parent, visited, result) {
        visited.add(item)
        if (item.id == parent.id) {
            result.val = true
            return
        }
            for (let neighbor of this.graph[item].dependencies) {
                if (!visited.has(neighbor)) {
                    this.isDependent(neighbor, parent, visited, result)
                }
            }
    }

    isDependencyOfHigher(item, child, visited, result) {
        visited.add(item)
        if (this.priorities.get(item.id) <= this.priorities.get(child.id)) {
            result.val = true
            return
        }
        for (let neighbor of this.backEdges[item]) {
            if (!visited.has(neighbor)) {
                this.isDependencyOfHigher(neighbor, child, visited, result)
            }
        }
    }

    bubbleUp(n) {
        const item = this.heap[n]
        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1
            const parent = this.heap[parentN]
            let visited = new Set()
            let result = {val: false}
            this.isDependent(item, parent, visited, result)

            if (result.val || this.compare(this.priorities.get(item.id), this.priorities.get(parent.id)) < 0) break
            visited.clear()
            result.val = false
            this.isDependencyOfHigher(parent, item, visited, result)
            if (result.val) break

            this.heap[parentN] = item
            this.heap[n] = parent
            n = parentN
        }
    }

    sinkDown(n) {
        const length = this.heap.length
        const item = this.heap[n]
        while (true) {
            const child2N = (n + 1) * 2
            const child1N = child2N - 1
            let swap = null
            let visited = new Set()
            if (child1N < length) {
                const child1 = this.heap[child1N]
                let result = {val: false}
                this.isDependencyOfHigher(item, child1, visited, result)
                if (!result.val || this.compare(this.priorities.get(item.id), this.priorities.get(child1.id)) >= 0) swap = child1N
            }
            else if (child2N < length) {
                visited.clear()
                const child2 = this.heap[child2N]
                let result = {val: false}
                this.isDependencyOfHigher(item, child2, visited, result)
                if (!result.val || this.compare(this.priorities.get(item.id), this.priorities.get(child2.id)) >= 0) swap = child2N
            }
            if (swap === null) break
            this.heap[n] = this.heap[swap]
            this.heap[swap] = item
            n = swap
        }
    }
}

/*
const pq = new Queue((a, b) => a[0] - b[0])

const tasks = [
    {id: 1, dependency: [], priority: 3},
    {id: 2, dependency: [{id: 1, dependency: [], priority: 3}], priority: 1},
    {id: 3, dependency: [{id: 1, dependency: [], priority: 3}], priority: 2},
    {id: 4, dependency: [{id: 2, dependency: [{id: 1, dependency: [], priority: 3}], priority: 1}], priority: 2},
    {id: 5, dependency: [{id: 2, dependency: [{id: 1, dependency: [], priority: 3}], priority: 1}], priority: 3},
    {id: 6, dependency: [{id: 5, dependency: [{id: 2, dependency: [{id: 1, dependency: [], priority: 3}], priority: 1}], priority: 3}], priority: 1}
]

for (let task of tasks) {
    pq.add(task)
}

while (!pq.isEmpty()) {
    console.log(pq.poll().id)
}
*/


module.exports = Queue