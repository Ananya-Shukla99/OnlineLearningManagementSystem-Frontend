# EduLearn Frontend

EduLearn is an Angular-based e-learning platform frontend that supports three distinct user roles: Student, Instructor, and Admin. The application provides course discovery and enrollment, lesson delivery, quiz assessments, payment integration, discussion boards, certificate management, and a full administrative dashboard.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Routing](#routing)
5. [Authentication and Authorization](#authentication-and-authorization)
6. [Role-Based Modules](#role-based-modules)
   - [Student](#student)
   - [Instructor](#instructor)
   - [Admin](#admin)
7. [Shared Components](#shared-components)
8. [Services](#services)
9. [Configuration and Environment](#configuration-and-environment)
10. [Running the Application](#running-the-application)
11. [Frontend Testing](#frontend-testing)
12. [Test Results](#test-results)

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Angular (standalone component model) |
| Styling | Custom CSS with design tokens and glassmorphism effects |
| HTTP Client | Angular `HttpClient` with Bearer token interceptor |
| State | Angular `signal` and `computed` reactive primitives |
| Payment | Razorpay Checkout SDK |
| Build | Angular CLI |
| Testing | Playwright (end-to-end) |

---

## Project Structure

```
src/
  app/
    admin/              # Admin role components
    auth/               # Login and registration
    course/             # Public course detail and lesson player
    course-detail/      # Course detail page
    explore/            # Public course discovery
    guards/             # Route guards
    home/               # Landing page
    instructor/         # Instructor role components
      quiz-builder/     # Nested quiz creation component
    services/           # ApiService and AuthService
    shared/             # Shell layout, discussion, info page, app-data
    student/            # Student role components
  environments/         # environment.ts / environment.prod.ts
  index.html
  main.ts
  styles.css
```

---

## Architecture Overview

The application is bootstrapped as a standalone Angular application using `bootstrapApplication`. No `NgModule` is used. Each component explicitly declares its imports, enabling fine-grained tree-shaking.

The HTTP layer communicates with a single API Gateway. The `ApiService` prepends the gateway URL (configured per environment) to all requests and attaches a JWT Bearer token from `localStorage` where required.

Reactive state throughout the application relies on Angular signals. `AuthService` exposes read-only signals such as `isLoggedIn`, `isStudent`, `isInstructor`, and `isAdmin` that drive conditional template rendering and route guards without triggering full change detection cycles.

The `DashboardShellComponent` acts as a layout container for all three role dashboards. It renders a collapsible sidebar with role-specific navigation links, a notification bell with unread badge, and a profile shortcut. Child routes rendered via `RouterOutlet` share this shell layout.

---

## Routing

Routes are defined in `app.routes.ts` and organized by feature domain.

```
/                        HomeComponent           (public)
/auth                    AuthComponent           (public)
/explore                 ExploreComponent        (public)
/course/:courseId        CourseDetailComponent   (public)
/course/:courseId/lesson/:lessonId  LessonPlayerComponent  (auth required)

/student                 DashboardShellComponent (auth, role: STUDENT)
  /student               StudentDashboardComponent
  /student/my-courses    StudentMyCoursesComponent
  /student/explore       StudentExploreComponent
  /student/certificates  StudentCertificatesComponent
  /student/profile       StudentProfileComponent
  /student/discussion    DiscussionComponent
  /student/progress      StudentProgressComponent

/instructor              DashboardShellComponent (auth, role: INSTRUCTOR)
  /instructor            InstructorDashboardComponent
  /instructor/my-courses InstructorMyCoursesComponent
  /instructor/create-course  InstructorCreateCourseComponent
  /instructor/students   InstructorStudentsComponent
  /instructor/discussion DiscussionComponent
  /instructor/profile    InstructorProfileComponent

/admin                   DashboardShellComponent (auth, role: ADMIN)
  /admin                 AdminDashboardComponent
  /admin/courses         AdminCoursesComponent
  /admin/users           AdminUsersComponent
  /admin/approve-courses AdminApproveCoursesComponent
  /admin/analytics       AdminAnalyticsComponent

/**                      Redirects to /
```

Unmatched routes redirect to the home page.

---

## Authentication and Authorization

Authentication is handled entirely on the frontend through `AuthService` and the `authGuard` route guard.

On successful login the API response is stored in `localStorage` under the key `auth_user` alongside a `token` key. `AuthService` initializes its internal signal from `localStorage` on startup, so sessions persist across page reloads.

The `authGuard` function (a `CanActivateFn`) performs two checks in sequence. First it verifies that a user is logged in. If not, it redirects to `/auth`. Second, if the route carries a `role` datum, the guard compares that role against the current user's role and redirects cross-role access attempts to the correct dashboard.

The `AuthService` exposes the following computed signals available application-wide:

- `isLoggedIn` — true when a user object is present
- `isStudent` / `isInstructor` / `isAdmin` — role predicates
- `userId` — the numeric identifier of the current user
- `user` — read-only signal of the full `AuthUser` object

Logout clears both `localStorage` keys and navigates to `/`.

---

## Role-Based Modules

### Student

The student area is accessible at `/student` and requires the `STUDENT` role.

**Dashboard** (`/student`) displays an overview of enrolled courses, recent activity, and progress statistics fetched from the API.

**My Courses** (`/student/my-courses`) lists all courses the student is enrolled in with progress indicators.

**Explore** (`/student/explore`) provides in-dashboard course browsing and enrollment capability with keyword search and category filtering.

**Certificates** (`/student/certificates`) shows earned certificates with download or sharing options for completed courses.

**Progress** (`/student/progress`) renders a detailed breakdown of lesson completion and quiz scores across all enrolled courses.

**Discussion** (`/student/discussion`) is a shared discussion board rendered via `DiscussionComponent`.

**Profile** (`/student/profile`) allows students to update their name and email, with changes synced through `AuthService.updateUser`.

**Payments** (`/student/payments`) shows the current subscription plan, expiry date, transaction history, and integrates with Razorpay for new payments or plan upgrades. The Razorpay checkout script is loaded globally via `index.html`.

**Quizzes** (`/student/quizzes`) allows students to attempt quizzes attached to enrolled courses.

### Instructor

The instructor area is accessible at `/instructor` and requires the `INSTRUCTOR` role.

**Dashboard** (`/instructor`) shows summary statistics (students, revenue, ratings, published courses) and a table of recent courses.

**My Courses** (`/instructor/my-courses`) lists all courses created by the instructor with status indicators (Published, Draft, Pending Review).

**Create Course** (`/instructor/create-course`) is a multi-step course editor. It supports creating or editing course metadata (title, description, category, price, thumbnail) and managing a curriculum of sections and lessons. Each lesson supports content types of `VIDEO`, `VIDEO_URL`, `ARTICLE`, and `PDF`. File upload to the server is handled with progress reporting. The same route serves both creation and edit modes via `ActivatedRoute` query parameters.

**Quiz Builder** (`/instructor/quiz-builder`) is a nested component accessible from the course editor. Instructors can add questions of types `MCQ_SINGLE`, `MCQ_MULTI`, and `TRUE_FALSE`, define answer options, and assign marks per question.

**Students** (`/instructor/students`) displays a list of all students enrolled across the instructor's courses.

**Discussion** (`/instructor/discussion`) renders the shared discussion board.

**Profile** (`/instructor/profile`) allows instructors to update their display name and email.

**Notifications** are accessible from the `DashboardShellComponent` header and show unread notification count with an inline dropdown. Clicking a notification marks it read. A "Mark all read" action is also available.

### Admin

The admin area is accessible at `/admin` and requires the `ADMIN` role.

**Dashboard** (`/admin`) presents a high-level platform overview including user counts, course counts, revenue, and recent activity.

**Users** (`/admin/users`) displays a searchable and paginated table of all registered users with role management controls.

**Approve Courses** (`/admin/approve-courses`) lists courses submitted for review. Admins can approve or reject each course. Approved courses become publicly visible on the platform.

**All Courses** (`/admin/courses`) shows the full catalog of courses across all instructors, including unpublished and rejected ones, with filtering options.

**Analytics** (`/admin/analytics`) presents platform-wide analytics including enrollment trends, revenue over time, and user growth visualized via charts.

---

## Shared Components

**`DashboardShellComponent`** — The layout wrapper for all three role dashboards. Renders the collapsible sidebar (`NavItem[]` driven, role-specific), top bar with notification bell, profile chip, and avatar initials. Notifications are fetched on `OnInit` and polled on route changes. The sidebar collapses on mobile via toggle.

**`DiscussionComponent`** — A shared threaded discussion board used by both students and instructors within their respective dashboard paths.

**`InfoPageComponent`** — A generic static page renderer used for informational routes such as About or Terms of Service.

**`HomeComponent`** — The public landing page. Composed of full-viewport scroll-snap sections covering a hero headline, platform statistics, featured course cards, a call-to-action enrollment prompt, and a footer. Uses `ChangeDetectionStrategy.OnPush` for performance. Course cards are sourced from `app-data.ts` as static seed data with dynamic overlay from the API.

**`ExploreComponent`** — The public course browse page with category tab filtering and keyword search backed by `ApiService`.

**`CourseDetailComponent`** — Public course detail showing curriculum sections, instructor information, pricing, and an enroll button. Enrolled users are shown a "Continue Learning" link.

**`LessonPlayerComponent`** — Authenticated lesson delivery. Renders video, article, or PDF content depending on lesson type. Tracks completion and submits progress updates to the API.

**`AuthComponent`** — Combined login and registration form with `mode` query parameter toggling between modes (`login` / `register`). Registration allows selection of the `STUDENT` or `INSTRUCTOR` role.

---

## Services

### ApiService

`ApiService` is the single HTTP abstraction layer. It is provided at the root level and injected throughout the application. All requests are routed through a single `GATEWAY` URL derived from the active environment.

Authentication endpoints: `POST /auth/login`, `POST /auth/register`, `GET /auth/validate`, `POST /auth/refresh`, `GET /auth/me`.

Course endpoints cover full CRUD operations including `GET /api/v1/courses`, `GET /api/v1/courses/:id`, search, category filter, featured, instructor filter, admin-only listing, create, update, publish, and approve.

Additional endpoint groups include enrollments, lessons, progress tracking, assessments and quizzes, payments and subscriptions (Razorpay order creation and verification), notifications (fetch, mark read, mark all read), discussion threads, certificate retrieval, and user management for admins.

Requests requiring authentication attach a `Bearer <token>` header via a private `headers()` helper that reads from `localStorage`.

### AuthService

`AuthService` manages session state using Angular signals. It persists the authenticated user object to `localStorage` on login and removes it on logout. It provides `login`, `register`, `logout`, `updateUser`, and `refreshCurrentUser` methods. After login it reads the user role and navigates automatically to the appropriate dashboard.

---

## Configuration and Environment

Environment files live in `src/environments/`.

`environment.ts` (development):
```ts
export const environment = {
  production: false,
  apiGateway: 'http://localhost:8080',
};
```

`environment.prod.ts` (production):
```ts
export const environment = {
  production: true,
  apiGateway: '<production-gateway-url>',
};
```

The `apiGateway` value is the base URL of the backend API gateway. All service calls construct their full URL by prepending this value.

The Razorpay checkout script is loaded unconditionally in `index.html` via a `<script>` tag pointing to `https://checkout.razorpay.com/v1/checkout.js`.

---

## Running the Application

**Prerequisites**

- Node.js 18 or later
- Angular CLI (`npm install -g @angular/cli`)

**Install dependencies**

```bash
npm install
```

**Development server**

```bash
ng serve
```

The application starts at `http://localhost:4200`. The development build proxies API requests to `http://localhost:8080` as configured in the environment file. Ensure the backend API gateway is running and reachable before navigating beyond the public routes.

**Production build**

```bash
ng build --configuration production
```

Output is placed in `dist/`. Serve the contents of this directory with any static file server or deploy to a CDN. The router uses the HTML5 history API, so the server must return `index.html` for all non-asset paths.

---

## Frontend Testing

End-to-end tests are written with [Playwright](https://playwright.dev/) and reside in the `student-journey.spec.ts` test file. The tests exercise real browser behaviour against a running instance of the full application and backend.

**Install Playwright**

```bash
npx playwright install
```

**Run tests**

```bash
npx playwright test
```

**Run with UI mode (interactive)**

```bash
npx playwright test --ui
```

**View the HTML report**

```bash
npx playwright show-report
```

### Test Coverage

The test suite currently contains one comprehensive end-to-end scenario covering the complete student journey from registration through course exploration.

**Test: Student Comprehensive Journey — `should complete registration, login, and course exploration`**

This test verifies the following user flow in sequence:

1. Registration — A new student account is created through the `/auth` registration form with a unique email, full name, password, and `STUDENT` role selection.
2. Login — The newly registered account is authenticated through the login form. The test asserts that the browser navigates to the student dashboard on success.
3. Course Exploration — The student navigates to the Explore section and performs a keyword search. The test asserts that course results are returned and rendered.
4. Course Detail — The student selects a course from the results and verifies the course detail page loads with title, description, and curriculum sections visible.
5. Navigation — The test confirms sidebar navigation links are present and functional.

The test runs in a headless Chromium browser using Playwright's full network stack. A trace artifact is captured for each run, enabling step-by-step visual replay of failures via `npx playwright show-report`.

### Extending the Test Suite

New test files should be placed in the `e2e/` or `tests/` directory and follow the Playwright `spec.ts` naming convention. Recommended additions for broader coverage include:

- Instructor course creation and lesson upload flow
- Admin course approval workflow
- Payment flow with Razorpay sandbox credentials
- Authentication guard behaviour for unauthorized role access
- Notification read and unread state transitions

---

## Test Results

| Suite | Test | Status | Duration |
|---|---|---|---|
| Student Comprehensive Journey | should complete registration, login, and course exploration | Passed | 11.2 s |

**Overall:** 1 test, 1 passed, 0 failed, 0 skipped.

The trace file recorded during this run can be inspected by opening the Playwright HTML report and selecting the test. The trace viewer provides a timeline of every action, network request, and screenshot captured during execution.
