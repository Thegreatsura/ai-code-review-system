# AI Code Review System

A monorepo for automated code review using AI.

## What's inside?

### Apps and Packages

- `apps/web`: a [Next.js](https://nextjs.org/) app
- `packages/logger`: a logging utility shared across services
- `services/ai-review-worker`: AI review worker service
- `services/github-comment-service`: GitHub comment service
- `services/pr-processor`: PR processor service
- `services/webhook-service`: Webhook service

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Turborepo](https://turbo.build/) for build orchestration

### Build

To build all apps and packages, run the following command:

```sh
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```sh
pnpm dev
```

You can develop a specific package by using a filter:

```sh
pnpm dev --filter=web
pnpm dev --filter=ai-review-worker
```

```mermaid
flowchart TD

    %% Frontend
    A[User] --> B[apps/web Next.js]

    %% Repo connection
    B --> C[Connect GitHub Repo]

    C --> D[Store Repo Info]
    D --> DB[(Postgres)]

    C --> E[Attach GitHub Webhook]

    %% Repo indexing
    C --> F[services/repo-indexer]

    F --> G[Clone Repository]
    G --> H[Chunk Code]
    H --> I[Generate Embeddings]
    I --> J[(Pinecone Vector DB)]

    %% PR event
    K[User Creates PR] --> L[GitHub Webhook]

    L --> M[services/webhook-service]

    M --> N[Kafka: pr-events]

    %% PR processing
    N --> O[services/pr-processor]

    O --> P[Fetch PR Diff from GitHub]

    P --> Q[Kafka: review-jobs]

    %% AI review worker
    Q --> R[services/ai-review-worker]

    R --> S[Check Redis Cache]

    S -->|Cache Hit| T[Return Cached Review]

    S -->|Cache Miss| U[Retrieve Context from Pinecone]

    U --> V[Gemini AI Review]

    V --> W[Store Review in Redis]

    W --> X[Kafka: review-results]

    %% Comment service
    X --> Y[services/github-comment-service]

    Y --> Z[Post Comment on PR]
```
