import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-wishlist',
  imports: [RouterLink, DecimalPipe],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
        <div>
          <span class="pill">Saved for later</span>
          <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">My Wishlist</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">
            {{ wishlistedCourses().length }} course{{ wishlistedCourses().length !== 1 ? 's' : '' }} saved
          </p>
        </div>
        <a routerLink="/student/explore" class="el-btn" style="padding: 0.55rem 1.1rem; font-size: 0.9rem;">+ Explore More</a>
      </div>

      @if (loading()) {
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          <article class="glass-card" style="padding: 1.5rem; border-radius: 18px; text-align: center;">
            <p class="page-copy">Loading your wishlist…</p>
          </article>
        </div>
      } @else if (wishlistedCourses().length === 0) {
        <article class="glass-card empty-state" style="border-radius: 24px; text-align: center; padding: 3.5rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🤍</div>
          <h2 class="section-title" style="font-size: 1.3rem;">Your wishlist is empty</h2>
          <p class="page-copy" style="margin-top: 0.5rem; margin-bottom: 1.5rem;">
            Browse the catalog and click the ♥ icon on any course to save it here.
          </p>
          <a routerLink="/student/explore" class="el-btn">Explore Courses</a>
        </article>
      } @else {
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          @for (course of wishlistedCourses(); track course.courseId) {
            <article class="glass-card wishlist-course-card" style="border-radius: 18px; overflow: hidden; display: flex; flex-direction: column;">
              <!-- Thumbnail -->
              <div class="course-thumb"
                [style.background-image]="course.thumbnailUrl ? 'url(' + course.thumbnailUrl + ')' : null">
                <div class="thumb-overlay">
                  <span class="pill" style="font-size: 0.7rem;">{{ course.level || 'Course' }}</span>
                </div>
                <button type="button" class="remove-btn" title="Remove from wishlist" (click)="removeFromWishlist(course.courseId)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#e05c5c" stroke="#e05c5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div style="padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
                <span class="page-copy" style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7;">{{ course.category }}</span>
                <h3 class="section-title" style="font-size: 1.05rem; line-height: 1.3;">{{ course.title }}</h3>
                <p class="page-copy" style="font-size: 0.82rem; flex: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ course.description }}</p>

                <!-- Rating Row -->
                <div style="display: flex; align-items: center; gap: 0.35rem; margin-top: 0.3rem;">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span [style.color]="star <= (course.averageRating || 0) ? '#ffc107' : 'rgba(255,255,255,0.18)'" style="font-size: 0.9rem;">★</span>
                  }
                  <span style="font-weight: 700; font-size: 0.85rem;">{{ course.averageRating ? (course.averageRating | number:'1.1-1') : '0.0' }}</span>
                  <span class="page-copy" style="font-size: 0.75rem;">({{ course.ratingCount || 0 }})</span>
                </div>

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem; flex-wrap: wrap; gap: 0.4rem;">
                  <span style="font-size: 1rem; font-weight: 700; color: var(--el-accent);">
                    {{ course.price === 0 ? 'Free' : '₹' + course.price }}
                  </span>
                  <a [routerLink]="['/course', course.courseId]" class="el-btn" style="padding: 0.35rem 0.85rem; font-size: 0.82rem;">View Course</a>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .wishlist-course-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: 1px solid rgba(224, 92, 92, 0.3);
    }
    .wishlist-course-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(224, 92, 92, 0.15);
    }
    .course-thumb {
      height: 150px;
      background-size: cover;
      background-position: center;
      background-color: rgba(255,255,255,0.05);
      position: relative;
      display: flex;
      align-items: flex-end;
    }
    .thumb-overlay {
      padding: 0.5rem 0.75rem;
      background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
      width: 100%;
    }
    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(0,0,0,0.55);
      border: none;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    .remove-btn:hover {
      background: rgba(224,92,92,0.8);
      transform: scale(1.12);
    }
    .empty-state { max-width: 480px; margin: 3rem auto; }
  `
})
export class StudentWishlistComponent implements OnInit {
  protected readonly loading = signal(true);
  protected readonly wishlistedCourses = signal<any[]>([]);
  private wishlistIds = signal<Set<number>>(new Set());

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const uid = this.auth.userId();
    if (!uid) { this.loading.set(false); return; }

    this.api.getWishlist(uid).subscribe({
      next: (res: any) => {
        const ids: number[] = res.courseIds || [];
        this.wishlistIds.set(new Set(ids));
        if (ids.length === 0) { this.loading.set(false); return; }

        // Fetch full course details for each wishlisted course
        const requests = ids.map(id => this.api.getCourseById(id));
        forkJoin(requests).subscribe({
          next: (results: any[]) => {
            const courses = results.map(r => r?.data || r || {});
            this.wishlistedCourses.set(courses);
            this.loading.set(false);
          },
          error: () => { this.loading.set(false); }
        });
      },
      error: () => { this.loading.set(false); }
    });
  }

  removeFromWishlist(courseId: number) {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.toggleWishlist(uid, courseId).subscribe({
      next: (res: any) => {
        if (res.success && !res.isWishlisted) {
          this.wishlistedCourses.update(list => list.filter(c => c.courseId !== courseId));
        }
      }
    });
  }
}
