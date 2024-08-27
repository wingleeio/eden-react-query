# Eden React Query

Wrapper for Eylsia's Eden to use React Query

## Installation

```bash
npm i eden-react-query
```

## Usage

```typescript
import type { App } from "./path-to-your-elysia";
import { treaty } from "@elysiajs/eden";
import { createClient } from "eden-react-query";

const eden = treaty<App>("http://localhost:3000");

const hooks = createClient(eden);
```

```tsx
"use client";

import { hooks } from "@/utils/eden";

export default function HomeClient() {
    const countQuery = hooks.count.get.useQuery();
    const countMutation = hooks.count.post.useMutation({
        onSuccess: () => {
            countQuery.refetch();
        },
    });
    return (
        <main>
            <button onClick={() => countMutation.mutate()}>Click me</button>{" "}
            {countQuery.data ? countQuery.data.count : "Loading..."}
        </main>
    );
}
```

```tsx
import HomeClient from "./page.client";
import { HydrationBoundary } from "@tanstack/react-query";
import { createUtils } from "eden-react-query/server";
import { eden } from "@/utils/eden";

export default async function Home() {
    const utils = createUtils(eden);
    await utils.count.get.prefetch();
    return (
        <HydrationBoundary state={utils.dehydrate()}>
            <HomeClient />
        </HydrationBoundary>
    );
}
```

Refer to [Elysia](https://elysiajs.com/) and [React Query](https://tanstack.com/query/latest) documentation for more information.
