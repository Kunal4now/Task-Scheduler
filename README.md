
# Task Scheduler

A scheduler that ingests tasks from multiple microservices and schedules them on the basis of their priority and dependencies.

## Sample Input For Email and SMS Services

```
{
    "id": 3, -> INTEGER
    "dependency": [2], -> INTEGER ARRAY
    "priority":1 -> INTEGER
}
```