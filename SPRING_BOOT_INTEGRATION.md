# Spring Boot API Integration Guide

This guide explains how to integrate your Next.js frontend with a Spring Boot backend.

## Configuration

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Spring Boot API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 2. API Client Setup

The API client is located at `lib/api-client.ts` and provides:

- **Automatic authentication** via Bearer token
- **Token management** in HTTP-only cookies
- **Error handling** with automatic redirect on 401
- **Type-safe responses** with TypeScript generics
- **Query parameter** support

## Available Functions

### HTTP Methods

```typescript
// GET request
const result = await apiGet<User[]>('/users', { page: 0, size: 10 });

// POST request
const result = await apiPost<User>('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const result = await apiPut<User>('/users/123', { name: 'John Updated' });

// PATCH request
const result = await apiPatch<User>('/users/123', { email: 'new@example.com' });

// DELETE request
const result = await apiDelete('/users/123');
```

### Token Management

```typescript
// Set token after login
await setAccessToken('your-jwt-token', 7); // 7 days

// Remove token on logout
await removeAccessToken();

// Check authentication status
const isAuth = await isAuthenticated();
```

## Usage Examples

### Example 1: Fetching Data in Server Component

```typescript
// app/dashboard/users/page.tsx
import { apiGet } from '@/lib/api-client';

export default async function UsersPage() {
  const result = await apiGet<User[]>('/users');

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div>
      {result.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: Server Actions with Mutations

```typescript
// app/actions/users.ts
'use server';

import { apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createUser(data: UserData) {
  const session = await auth();
  if (!session) return { success: false, error: 'Unauthorized' };

  const result = await apiPost<User>('/users', data);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/users');
  return { success: true, data: result.data };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session) return { success: false, error: 'Unauthorized' };

  const result = await apiDelete(`/users/${id}`);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/users');
  return { success: true };
}
```

### Example 3: React Client Component with React Query

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory } from '@/app/actions/categories';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  // Query
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Category created!');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast.error(result.error);
      }
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.data.map(cat => (
        <div key={cat.id}>{cat.name}</div>
      ))}
    </div>
  );
}
```

### Example 4: Login with Spring Boot

```typescript
// app/auth/login/page.tsx
'use client';

import { loginWithBackend } from '@/app/actions/auth';

export default function LoginPage() {
  return (
    <form action={loginWithBackend}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Response Types

### Standard Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
```

## Error Handling

The API client handles errors automatically:

1. **401 Unauthorized**: Clears token and redirects to login
2. **Network errors**: Returns error message
3. **Parse errors**: Returns "Failed to parse response"

You can also handle errors manually:

```typescript
const result = await apiGet('/users');

if (!result.success) {
  if (result.status === 404) {
    // Handle not found
  } else if (result.status === 403) {
    // Handle forbidden
  } else {
    // Handle other errors
    console.error(result.error);
  }
}
```

## Query Parameters

Dynamic query parameters are supported:

```typescript
// Simple params
await apiGet('/users', { page: 0, size: 10 });

// With search and sort
await apiGet('/products', {
  search: 'laptop',
  category: 'electronics',
  sort: 'name,asc',
  page: 0,
  size: 20,
});

// Null/undefined values are automatically excluded
await apiGet('/orders', {
  status: 'pending',
  userId: null, // This will be excluded
  minAmount: 100,
});
```

## Spring Boot Backend Requirements

Your Spring Boot backend should:

1. **Use JWT tokens** for authentication
2. **Return proper HTTP status codes** (200, 201, 400, 401, 403, 404, 500)
3. **Return JSON responses** with consistent structure
4. **Support CORS** from your Next.js origin
5. **Use standard REST conventions** for endpoints

### Example Spring Boot Controller

```java
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<Category>> getCategories(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(categoryService.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CategoryDTO dto) {
        return ResponseEntity.status(201).body(categoryService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
        @PathVariable String id,
        @RequestBody CategoryDTO dto
    ) {
        return ResponseEntity.ok(categoryService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Best Practices

1. **Always use Server Actions** for mutations (create, update, delete)
2. **Use React Query** for client-side data fetching and caching
3. **Validate data** with Zod on both client and server
4. **Handle loading states** in UI components
5. **Show toast notifications** for success/error feedback
6. **Invalidate queries** after mutations to refresh data
7. **Use TypeScript** for type safety across API calls

## Troubleshooting

### CORS Errors

Add CORS configuration to your Spring Boot application:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Token Expiration

Implement token refresh logic:

```typescript
// Check token expiry before API calls
// Or use refresh token endpoint
const result = await refreshToken(refreshToken);
```

### Connection Refused

Ensure Spring Boot is running on the correct port:

```bash
# Check if Spring Boot is running
curl http://localhost:8080/api/v1/health
```

## Files Reference

- `lib/api-client.ts` - Core API client functions
- `lib/auth.ts` - NextAuth configuration
- `app/actions/auth.ts` - Authentication server actions
- `app/actions/categories.ts` - Example CRUD actions
- `examples/categories-example.tsx` - Complete UI example
