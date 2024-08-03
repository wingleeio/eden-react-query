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
import { pact } from "eden-react-query";

const eden = treaty<App>("http://localhost:3000");

const api = pact(eden);
```

```tsx
"use client";

import { api } from "@/lib/eden";

export default function Home() {
    const query = api.index.get.useQuery();
    const mutation = api.index.post.useMutation({
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error) => {
            console.log(error);
        },
    });
    return null;
}
```

```tsx
import { eden } from "@/lib/eden";
import { createServerHelper } from "eden-react-query/server";

export default function Home() {
    const api = createServerHelper(eden);
    await api.index.get.prefetch({ query: { name: "string" } });
    return (
        <HydrationBoundary state={api.dehydrate()}>
            <SomeClientComponent />
        </HydrationBoundary>
    );
}
```

Refer to [Elysia](https://elysiajs.com/) and [React Query](https://tanstack.com/query/latest) documentation for more information.
