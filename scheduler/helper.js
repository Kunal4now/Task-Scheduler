function schedule(graph, visited, copy) {
    let ordering = [];
    function dfs(node, visited) {
        visited.add(node)
        for (let neighbor of graph[node].dependencies) {
            if (!visited.has(neighbor)) {
                dfs(neighbor, visited);
            }
        }
        ordering.push(`Job ${node}`);
    }

    while (!copy.isEmpty()) {
        let [priority, id] = copy.poll();
        if (!visited.has(id)) {
            dfs(id, visited);
        }
    }

    return ordering;
}

module.exports = schedule;