# Frontend Testing Guidelines

This document provides guidelines for writing and maintaining **unit and integration tests** for the **UltimateHealth** frontend (React Native + Expo).

We use **Jest** + **@testing-library/react-native** to ensure reliable, user-focused tests that help maintain high-quality health & wellness features.

---

## Why We Test

- Prevent regressions in critical features (article display, AI chat, moderation flows, navigation, etc.)
- Ensure accessibility and inclusive user experience
- Make refactoring safer
- Improve code quality and developer confidence

---

## 🧪 Testing Best Practices

### 🎯 Core Principles
- **Test behavior, not implementation** — Focus on what the user sees and interacts with.
- **Prefer user-centric queries**:
  - `getByText`
  - `getByRole`
  - `getByPlaceholderText`
  - `getByTestId` *(use sparingly)*
- **Use `getByRole` for accessibility** — Highly encouraged, especially for a health app.
- **Keep tests small and focused** — One behavior per test.
- **Mock external dependencies** — Navigation, API calls, Redux/Context, etc.
- **Write tests alongside features** or when fixing bugs.

---

### ✅ Do
- Use `render` from `@testing-library/react-native`
- Simulate real user actions with:
  - `fireEvent`
  - `userEvent`
- Test **accessibility roles and labels**
- Mock:
  - Network requests
  - Navigation

---

### ❌ Don't
- Test internal state or props directly *(unless absolutely necessary)*
- Rely heavily on snapshots *(they can become brittle)*
- Use real API calls in unit tests
