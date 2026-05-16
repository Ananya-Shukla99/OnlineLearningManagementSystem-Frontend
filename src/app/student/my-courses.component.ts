import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-my-courses',
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap;">
        <div>
          <span class="pill">Learning path</span>
          <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">My courses</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">{{ visibleCourses().length }} courses shown · Average progress {{ averageProgress() }}%</p>
        </div>
        <div style="display: flex; gap: 0.45rem; flex-wrap: wrap;">
          @for (filter of filters; track filter) {
            <button class="chip" type="button" [class.role-option--active]="activeFilter() === filter" (click)="activeFilter.set(filter)">{{ filter }}</button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 1rem;">
          <article class="glass-card" style="padding: 1.5rem; border-radius: 18px; text-align: center;">
            <p class="page-copy">Loading your courses…</p>
          </article>
        </div>
      } @else {
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top: 1rem;">
          <article class="soft-card" style="padding: 1rem; border-radius: 18px;">
            <div class="page-copy" style="font-size: 0.82rem;">Courses enrolled</div>
            <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem;">{{ enrolledCourses().length }}</strong>
          </article>
          <article class="soft-card" style="padding: 1rem; border-radius: 18px;">
            <div class="page-copy" style="font-size: 0.82rem;">Active learning</div>
            <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem;">{{ activeCount() }}</strong>
          </article>
          <article class="soft-card" style="padding: 1rem; border-radius: 18px;">
            <div class="page-copy" style="font-size: 0.82rem;">Completed</div>
            <strong style="font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem;">{{ completedCount() }}</strong>
          </article>
        </div>

        <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-top: 1rem;">
          @for (course of visibleCourses(); track course.courseId) {
            <article class="glass-card" style="padding: 1rem; border-radius: 18px;">
              <h3 class="section-title" style="font-size: 1.2rem;">{{ course.title }}</h3>
              <p class="page-copy" style="margin-top: 0.35rem;">{{ course.category }} · {{ course.level }}</p>
              <p class="page-copy" style="margin-top: 0.5rem;">{{ course.description }}</p>

              <!-- Average Rating Display -->
              <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem;">
                <div class="star-row">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span [style.color]="star <= (courseRatings()[course.courseId]?.avg || 0) ? '#ffc107' : 'rgba(255,255,255,0.2)'" style="font-size: 1rem;">★</span>
                  }
                </div>
                <span style="font-weight: 700; font-size: 0.9rem;">
                  {{ courseRatings()[course.courseId]?.avg ? (courseRatings()[course.courseId].avg | number:'1.1-1') : '0.0' }}
                </span>
                <span class="page-copy" style="font-size: 0.78rem;">
                  ({{ courseRatings()[course.courseId]?.count || 0 }} ratings)
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.85rem;">
                <span class="pill">{{ course.progressPercent }}% complete</span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <button type="button" class="btn-secondary"
                    style="padding: 0.3rem 0.7rem; font-size: 0.8rem; border-color: rgba(255,255,255,0.2);"
                    (click)="toggleReviewPanel(course.courseId)">
                    {{ reviewPanelId() === course.courseId ? 'Close' : '★ Rate & Reviews' }}
                  </button>
                  <a [routerLink]="['/course', course.courseId, 'lesson', 1]" class="view-all-link">Resume</a>
                </div>
              </div>

              <!-- Review / Rating Panel -->
              @if (reviewPanelId() === course.courseId) {
                <div class="review-panel" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">

                  <!-- Submit your rating -->
                  <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--el-text);">Rate this course</h4>
                  <div style="display: flex; gap: 0.2rem; margin-bottom: 0.5rem;">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span class="rate-star"
                            [class.lit]="star <= ratingHover() || (!ratingHover() && star <= ratingValue())"
                            (click)="ratingValue.set(star)"
                            (mouseenter)="ratingHover.set(star)"
                            (mouseleave)="ratingHover.set(0)">★</span>
                    }
                  </div>
                  <textarea class="el-input" rows="2"
                    placeholder="Write a review... (optional)"
                    [value]="ratingComment()"
                    (input)="ratingComment.set($any($event.target).value)"
                    style="margin-bottom: 0.5rem;">
                  </textarea>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span [style.color]="ratingMsg()?.isError ? '#e05c5c' : '#6aaa6a'" style="font-size: 0.8rem;">{{ ratingMsg()?.text }}</span>
                    <div style="display: flex; gap: 0.5rem;">
                      <button type="button" class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border: none;" (click)="reviewPanelId.set(null)">Cancel</button>
                      <button type="button" class="el-btn" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" (click)="submitRating(course.courseId)">Submit</button>
                    </div>
                  </div>

                  <!-- All reviews -->
                  @if (courseReviews()[course.courseId]?.length) {
                    <div style="margin-top: 1rem;">
                      <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--el-text-secondary);">All student reviews</h4>
                      @for (review of courseReviews()[course.courseId]; track review.reviewId) {
                        <div class="review-item">
                          <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <div class="star-row">
                              @for (s of [1,2,3,4,5]; track s) {
                                <span [style.color]="s <= review.rating ? '#ffc107' : 'rgba(255,255,255,0.15)'" style="font-size: 0.85rem;">★</span>
                              }
                            </div>
                            <span class="page-copy" style="font-size: 0.73rem;">{{ review.createdAt | date:'dd MMM yyyy' }}</span>
                          </div>
                          @if (review.comment) {
                            <p class="page-copy" style="font-size: 0.82rem; margin-top: 0.25rem; font-style: italic;">"{{ review.comment }}"</p>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="page-copy" style="font-size: 0.82rem; margin-top: 0.75rem; text-align: center; opacity: 0.6;">No reviews yet. Be the first to rate this course!</p>
                  }
                </div>
              }

              <div style="height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); margin-top: 0.7rem; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #6aaa6a, #b9d9a0);" [style.width.%]="course.progressPercent"></div>
              </div>
            </article>
          }

          @if (visibleCourses().length === 0) {
            <article class="glass-card" style="padding: 1rem; border-radius: 18px;">
              <h3 class="section-title" style="font-size: 1.1rem;">No courses in this filter</h3>
              <p class="page-copy" style="margin-top: 0.35rem;">Switch to a different status to continue learning.</p>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .star-row { display: flex; gap: 0.1rem; }
    .rate-star {
      cursor: pointer;
      font-size: 1.5rem;
      color: rgba(255,255,255,0.2);
      transition: color 0.15s, transform 0.15s;
      user-select: none;
    }
    .rate-star.lit { color: #ffc107; transform: scale(1.1); }
    .review-panel { animation: slideDown 0.25s ease; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .review-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .review-item:last-child { border-bottom: none; }
  `
})
export class StudentMyCoursesComponent implements OnInit {
  protected readonly filters = ['All', 'In Progress', 'Completed'] as const;
  protected readonly activeFilter = signal<(typeof this.filters)[number]>('All');
  protected readonly loading = signal(true);

  protected readonly enrolledCourses = signal<any[]>([]);

  protected readonly visibleCourses = computed(() => {
    const filter = this.activeFilter();
    return this.enrolledCourses().filter((course) => {
      if (filter === 'All') return true;
      if (filter === 'Completed') return course.status === 'COMPLETED';
      return course.status === 'ACTIVE';
    });
  });

  protected readonly activeCount = computed(() => this.enrolledCourses().filter((c: any) => c.status === 'ACTIVE').length);
  protected readonly completedCount = computed(() => this.enrolledCourses().filter((c: any) => c.status === 'COMPLETED').length);
  protected readonly averageProgress = computed(() => {
    const courses = this.enrolledCourses();
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((sum: number, c: any) => sum + (c.progressPercent || 0), 0) / courses.length);
  });

  // Rating form state
  protected reviewPanelId = signal<number | null>(null);
  protected ratingValue = signal<number>(5);
  protected ratingHover = signal<number>(0);
  protected ratingComment = signal<string>('');
  protected ratingMsg = signal<{text: string, isError: boolean} | null>(null);

  // Map of courseId -> { avg, count }
  protected courseRatings = signal<Record<number, { avg: number; count: number }>>({});

  // Map of courseId -> Review[]
  protected courseReviews = signal<Record<number, any[]>>({});

  constructor(private api: ApiService, private auth: AuthService) {}

  toggleReviewPanel(courseId: number) {
    if (this.reviewPanelId() === courseId) {
      this.reviewPanelId.set(null);
    } else {
      this.reviewPanelId.set(courseId);
      this.ratingValue.set(5);
      this.ratingHover.set(0);
      this.ratingComment.set('');
      this.ratingMsg.set(null);
      this.loadReviews(courseId);
    }
  }

  private loadReviews(courseId: number) {
    this.api.getCourseReviews(courseId).subscribe({
      next: (res: any) => {
        const reviews: any[] = res.data || [];
        const existing = { ...this.courseReviews() };
        existing[courseId] = reviews;
        this.courseReviews.set(existing);
      }
    });
  }

  submitRating(courseId: number) {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.submitReview(courseId, {
      studentId: uid,
      rating: this.ratingValue(),
      comment: this.ratingComment()
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.ratingMsg.set({ text: 'Review submitted successfully!', isError: false });
          // Refresh rating stats and reviews for this course
          this.api.getCourseRating(courseId).subscribe({
            next: (r: any) => {
              if (r.success) {
                const updated = { ...this.courseRatings() };
                updated[courseId] = { avg: r.averageRating, count: r.ratingCount };
                this.courseRatings.set(updated);
              }
            }
          });
          this.loadReviews(courseId);
        } else {
          this.ratingMsg.set({ text: res.message || 'Failed to submit', isError: true });
        }
      },
      error: (err: any) => {
        this.ratingMsg.set({ text: err.error?.message || 'Failed to submit', isError: true });
      }
    });
  }

  ngOnInit() {
    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }

    this.api.getEnrollmentsByStudent(uid).subscribe({
      next: (res: any) => {
        const enrollments: any[] = res.data || res || [];
        if (enrollments.length === 0) {
          this.loading.set(false);
          return;
        }

        // Fetch course details for each enrollment in parallel
        const courseRequests = enrollments.map((e: any) => this.api.getCourseById(e.courseId));
        forkJoin(courseRequests).subscribe({
          next: (courseResults: any) => {
            const combined = enrollments.map((enrollment: any, index: number) => {
              const courseData = courseResults[index]?.data || courseResults[index] || {};
              return {
                ...courseData,
                enrollmentId: enrollment.enrollmentId,
                progressPercent: enrollment.progressPercent || 0,
                status: enrollment.status || 'ACTIVE',
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
              };
            });
            this.enrolledCourses.set(combined);
            this.loading.set(false);

            // Load average ratings for all enrolled courses
            const ratingMap: Record<number, { avg: number; count: number }> = {};
            const ratingRequests = combined.map((c: any) =>
              this.api.getCourseRating(c.courseId)
            );
            forkJoin(ratingRequests).subscribe({
              next: (ratingResults: any) => {
                combined.forEach((c: any, i: number) => {
                  const r = ratingResults[i];
                  if (r?.success) {
                    ratingMap[c.courseId] = { avg: r.averageRating, count: r.ratingCount };
                  }
                });
                this.courseRatings.set(ratingMap);
              }
            });
          },
          error: () => {
            const fallback = enrollments.map(e => ({
              courseId: e.courseId,
              title: `Course #${e.courseId}`,
              category: '',
              level: '',
              description: '',
              progressPercent: e.progressPercent || 0,
              status: e.status || 'ACTIVE',
              enrollmentId: e.enrollmentId,
            }));
            this.enrolledCourses.set(fallback);
            this.loading.set(false);
          },
        });
      },
      error: () => { this.loading.set(false); },
    });
  }
}
