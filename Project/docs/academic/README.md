# AlgoFlow — Academic Project Documentation

## Project Information
- **Project Title**: AlgoFlow (Distributed Online Code Judge Platform)
- **Course**: Database Systems Engineering and Distributed Backend Development (25CS1302E)
- **Academic Year**: Y25 - 2026-2027 (Trimester 4)

---

## Directory Contents

| File / Resource | Description | Status |
| :--- | :--- | :--- |
| [`Project abstract.pdf`](./Project%20abstract.pdf) | Official course project abstract submission form and architecture overview | Submitted |
| `Review-1-Presentation.pptx` | Review 1: Requirements, ER Modeling, and Microservices Architecture | In Directory |
| `Review-2-Presentation.pptx` | Review 2: Sandboxed Docker Execution, Redis Queues, and Benchmark Results | In Directory |
| `Architecture-Diagrams/` | High-resolution database schemas, Redis BullMQ queues, and system topology | Asset Storage |

---

## System Architecture Summary

1. **Frontend Client**: React.js 18 + TypeScript + Tailwind CSS with Monaco Editor integration for multi-language code editing (C++, Python 3, Java, JavaScript).
2. **API Gateway & Microservices**: Node.js & Express.js covering Problem Service, Submission Router, and Contest Management.
3. **Task Queue & In-Memory Store**: Redis powering BullMQ job queues for async submission dispatching and Redis Sorted Sets for $O(\log n)$ real-time contest leaderboard ranking.
4. **Sandboxed Code Execution**: Docker container isolation per submission with strict CPU, memory, and timeout guards.
5. **Persistence**: MongoDB database optimized for submission history aggregation pipelines and contest leaderboards.
