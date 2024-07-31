# Eden React Query

Wrapper for Eylsia's Eden to use React Query

## Usage

```typescript
import type { App } from "./path-to-your-elysia";
import { treaty } from "@elysiajs/eden";
import { pact } from "eden-react-query";

const eden = treaty<App>("http://localhost:3000");

const api = pact(eden);
```

```tsx
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

Refer to [Elysia](https://elysiajs.com/) and [React Query](https://tanstack.com/query/latest) documentation for more information.
