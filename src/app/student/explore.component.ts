import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-explore',
  imports: [RouterLink, DecimalPipe],
  template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div>
          <span class="pill">Course discovery</span>
          <h1 class="page-title" style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); margin-top: 0.75rem;">Explore courses</h1>
          <p class="page-copy" style="margin-top: 0.35rem;">Search, sort, and filter the full catalog.</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <input class="el-input" style="width: 230px; padding-block: 0.75rem;" type="search" placeholder="Search courses..." (input)="onSearch($event)" />
        </div>
      </div>

      <div class="explore-content" style="padding: 0; grid-template-columns: 260px minmax(0, 1fr); gap: 1rem;">
        <aside class="explore-sidebar" style="top: 0; max-height: none; position: relative;">
          <div class="filter-group" style="margin-bottom: 1rem; padding-bottom: 1rem;">
            <h3 class="filter-title">Category</h3>
            <div class="filter-options">
              @for (category of categories; track category) {
                <button class="explore-chip" [class.is-active]="selectedCategory() === category" type="button" (click)="onCategoryChange(category)">
                  {{ category }}
                </button>
              }
            </div>
          </div>

          <div class="filter-group" style="margin-bottom: 0; padding-bottom: 0; border: none;">
            <h3 class="filter-title">Level</h3>
            <div class="filter-options">
              @for (level of levels; track level) {
                <label class="filter-checkbox">
                  <input type="radio" name="level" [checked]="selectedLevel() === level" (change)="selectedLevel.set(level)" />
                  <span>{{ level }}</span>
                </label>
              }
            </div>
          </div>
        </aside>

        <div>
          <div class="courses-header">
            <h2 class="courses-title">Available courses</h2>
            <div class="sort-options">{{ filteredCourses().length }} results</div>
          </div>

          @if (loading()) {
            <div style="text-align: center; padding: 2rem;">
              <p class="page-copy">Loading courses...</p>
            </div>
          } @else {
            <div class="explore-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); width: 100%;">
              @for (course of filteredCourses(); track course.courseId) {
                <a [routerLink]="['/course', course.courseId]" class="el-card explore-card" [class.wishlisted-card]="wishlist().has(course.courseId)">
                  @if (wishlist().has(course.courseId)) {
                    <div class="wishlist-badge">♥ Wishlisted</div>
                  }
                  <div
                    class="course-visual"
                    [style.background-image]="course.thumbnailUrl ? 'url(' + course.thumbnailUrl + ')' : null"
                  ></div>
                  <div class="course-body">
                    <div class="course-meta-top">
                      <span class="course-level">{{ course.level }}</span>
                      <span class="course-date">{{ course.category }}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <h3 class="course-title" style="flex: 1; padding-right: 1rem;">{{ course.title }}</h3>
                      <button type="button" class="wishlist-btn" 
                              (click)="toggleWishlist($event, course)"
                              [class.active]="wishlist().has(course.courseId)"
                              [title]="wishlist().has(course.courseId) ? 'Remove from Wishlist' : 'Add to Wishlist'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                            [attr.fill]="wishlist().has(course.courseId) ? '#e05c5c' : 'none'" 
                            [attr.stroke]="wishlist().has(course.courseId) ? '#e05c5c' : 'currentColor'"></path>
                        </svg>
                      </button>
                    </div>
                    <p class="course-description">{{ course.description }}</p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                      <span style="color: #ffc107;">★★★★★</span>
                      <span style="font-weight: bold; font-size: 0.9rem;">{{ course.averageRating ? (course.averageRating | number:'1.1-1') : '0.0' }}</span>
                      <span class="page-copy" style="font-size: 0.8rem;">({{ course.ratingCount || 0 }} reviews)</span>
                    </div>
                    <div class="course-footer">
                      <div class="course-instructor">
                        <div class="instructor-name">{{ course.language || 'English' }}</div>
                      </div>
                      <div class="course-price">{{ course.price === 0 ? 'Free' : '₹' + course.price }}</div>
                    </div>
                  </div>
                </a>
              }

              @if (filteredCourses().length === 0) {
                <article class="glass-card" style="padding: 1rem; border-radius: 18px; grid-column: 1 / -1;">
                  <h3 class="section-title" style="font-size: 1.1rem;">No matching courses</h3>
                  <p class="page-copy" style="margin-top: 0.35rem;">Try a different search term or reset the filters.</p>
                </article>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .wishlist-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--el-text-secondary);
      transition: all 0.2s;
      padding: 0.25rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .wishlist-btn:hover {
      background: rgba(255,255,255,0.1);
      transform: scale(1.15);
    }
    .wishlist-btn.active svg path {
      animation: heartPop 0.3s ease;
    }
    @keyframes heartPop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.4); }
      100% { transform: scale(1); }
    }
    .wishlisted-card {
      border: 2px solid rgba(224, 92, 92, 0.55) !important;
      box-shadow: 0 0 18px rgba(224, 92, 92, 0.18);
      position: relative;
    }
    .wishlist-badge {
      position: absolute;
      top: 0.55rem;
      left: 0.55rem;
      background: linear-gradient(135deg, #e05c5c, #c0392b);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.18rem 0.55rem;
      border-radius: 999px;
      z-index: 10;
      pointer-events: none;
    }
  `
})
export class StudentExploreComponent implements OnInit, OnDestroy {
  protected readonly categories = ['All', 'Design', 'Development', 'Business', 'Marketing', 'Data Science'];
  protected readonly levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  protected readonly selectedCategory = signal('All');
  protected readonly selectedLevel = signal('All');
  protected readonly courses = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly wishlist = signal<Set<number>>(new Set());

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  protected readonly filteredCourses = computed(() => {
    const level = this.selectedLevel();
    const wl = this.wishlist();
    const filtered = this.courses().filter((course) => {
      const levelMatch = level === 'All' || course.level === level;
      return levelMatch;
    });
    // Wishlisted courses always appear first
    return [
      ...filtered.filter(c => wl.has(c.courseId)),
      ...filtered.filter(c => !wl.has(c.courseId)),
    ];
  });

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    this.loadAllCourses();
    this.loadWishlist();

    this.searchSub = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(keyword => {
        if (keyword.trim()) {
          this.loading.set(true);
          this.api.searchCourses(keyword).subscribe({
            next: (res: any) => {
              this.courses.set(res.data || []);
              this.loading.set(false);
            },
            error: () => { this.loading.set(false); },
          });
        } else {
          this.loadAllCourses();
        }
      });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.loading.set(true);
    if (category === 'All') {
      this.loadAllCourses();
    } else {
      this.api.getCoursesByCategory(category).subscribe({
        next: (res: any) => {
          this.courses.set(res.data || []);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); },
      });
    }
  }

  private loadAllCourses() {
    this.loading.set(true);
    this.api.getAllCourses().subscribe({
      next: (res: any) => {
        this.courses.set(res.data || []);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  private loadWishlist() {
    const uid = this.auth.userId();
    if (!uid) return;
    this.api.getWishlist(uid).subscribe({
      next: (res: any) => {
        if (res.success && res.courseIds) {
          this.wishlist.set(new Set(res.courseIds));
        }
      }
    });
  }

  toggleWishlist(event: Event, course: any) {
    event.preventDefault();
    event.stopPropagation();
    
    const uid = this.auth.userId();
    if (!uid) return;

    this.api.toggleWishlist(uid, course.courseId).subscribe({
      next: (res: any) => {
        if (res.success) {
          const newSet = new Set(this.wishlist());
          if (res.isWishlisted) {
            newSet.add(course.courseId);
          } else {
            newSet.delete(course.courseId);
          }
          this.wishlist.set(newSet);
        }
      }
    });
  }
}
