import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="analytics-container animate-in">
      <div class="header-area">
        <span class="pill">Metrics</span>
        <h1 class="page-title">Platform Analytics</h1>
        <p class="page-copy">A comprehensive overview of system performance, user engagement, and content metrics.</p>
      </div>

      <div class="metrics-grid">
        <!-- Courses Metrics -->
        <article class="metric-card glass-card hover-lift">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(230,176,101,0.2) 0%, rgba(230,176,101,0.05) 100%); color: #e6b065;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Total Courses</span>
            <div class="metric-value">{{ loading() ? '-' : totalCourses() }}</div>
          </div>
        </article>

        <article class="metric-card glass-card hover-lift">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(106,170,106,0.2) 0%, rgba(106,170,106,0.05) 100%); color: #6aaa6a;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Published Courses</span>
            <div class="metric-value" style="color: #6aaa6a;">{{ loading() ? '-' : publishedCourses() }}</div>
          </div>
        </article>

        <article class="metric-card glass-card hover-lift">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(224,92,92,0.2) 0%, rgba(224,92,92,0.05) 100%); color: #e05c5c;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Pending Review</span>
            <div class="metric-value" style="color: #e05c5c;">{{ loading() ? '-' : pendingReview() }}</div>
          </div>
        </article>

        <!-- Users Metrics -->
        <article class="metric-card glass-card hover-lift">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(132,156,220,0.2) 0%, rgba(132,156,220,0.05) 100%); color: #849cdc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Total Users</span>
            <div class="metric-value" style="color: #849cdc;">{{ loading() ? '-' : totalUsers() }}</div>
          </div>
        </article>

        <article class="metric-card glass-card hover-lift">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(154,124,204,0.2) 0%, rgba(154,124,204,0.05) 100%); color: #9a7ccc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Students</span>
            <div class="metric-value" style="color: #9a7ccc;">{{ loading() ? '-' : studentCount() }}</div>
          </div>
        </article>

        <article class="metric-card glass-card hover-lift">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(230,125,188,0.2) 0%, rgba(230,125,188,0.05) 100%); color: #e67dbc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          </div>
          <div class="metric-content">
            <span class="metric-label">Instructors</span>
            <div class="metric-value" style="color: #e67dbc;">{{ loading() ? '-' : instructorCount() }}</div>
          </div>
        </article>
      </div>

    </section>
  `,
  styles: `
    .analytics-container {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .header-area {
      margin-bottom: 0.5rem;
    }
    
    .page-title {
      font-size: clamp(2.2rem, 4vw, 3.2rem); 
      margin-top: 0.8rem;
      background: linear-gradient(to right, #fff, rgba(255,255,255,0.6));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      padding: 1.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: all 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.06);
    }
    
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -10px rgba(0,0,0,0.3);
      border-color: rgba(255,255,255,0.12);
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.95rem;
      color: rgba(255,255,255,0.6);
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .metric-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1;
      color: #fff;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }
    
    .insights-card {
      border-radius: 24px;
      padding: 2rem;
    }
    
    .insights-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .gradient-border {
      position: relative;
      background: var(--el-bg-glass);
      border: none;
    }
    .gradient-border::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 24px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    /* CSS Chart Animation & Styling */
    .chart-placeholder {
      height: 220px;
      display: flex;
      align-items: flex-end;
      padding-top: 1rem;
    }
    
    .css-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      gap: 1rem;
    }
    
    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      height: 100%;
      gap: 0.75rem;
    }
    
    .bar {
      width: 100%;
      max-width: 48px;
      background: linear-gradient(to top, rgba(132,156,220,0.1), rgba(132,156,220,0.8));
      border-radius: 8px 8px 0 0;
      animation: growUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .bar:hover {
      background: linear-gradient(to top, rgba(132,156,220,0.2), rgba(132,156,220,1));
      transform: scaleY(1.02);
      transform-origin: bottom;
    }
    
    .bar-col:nth-child(1) .bar { animation-delay: 0.1s; }
    .bar-col:nth-child(2) .bar { animation-delay: 0.2s; }
    .bar-col:nth-child(3) .bar { animation-delay: 0.3s; }
    .bar-col:nth-child(4) .bar { animation-delay: 0.4s; }
    .bar-col:nth-child(5) .bar { animation-delay: 0.5s; }
    .bar-col:nth-child(6) .bar { animation-delay: 0.6s; }

    .bar-label {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.5);
      font-family: 'Space Grotesk', sans-serif;
    }

    @keyframes growUp {
      from { height: 0; opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 1024px) {
      .insights-grid {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class AdminAnalyticsComponent implements OnInit {
  protected loading = signal(true);
  
  // Courses metrics
  protected totalCourses = signal(0);
  protected publishedCourses = signal(0);
  protected pendingReview = signal(0);
  
  // Users metrics
  protected totalUsers = signal(0);
  protected studentCount = signal(0);
  protected instructorCount = signal(0);

  constructor(private api: ApiService) {}

  ngOnInit() {
    const fetchCoursesCall = (this.api as any).getAllCoursesAdmin 
      ? (this.api as any).getAllCoursesAdmin() 
      : this.api.getAllCourses();

    const fetchUsersCall = this.api.getAllUsers();

    forkJoin({
      courses: fetchCoursesCall,
      users: fetchUsersCall
    }).subscribe({
      next: ({ courses: coursesRes, users: usersRes }) => {
        // Process courses
        const courses: any[] = (coursesRes as any).data || coursesRes || [];
        this.totalCourses.set(courses.length);
        
        let published = 0;
        let pending = 0;
        courses.forEach(c => {
          if (c.published || c.isPublished) published++;
          else pending++;
        });

        this.publishedCourses.set(published);
        this.pendingReview.set(pending);

        // Process users
        const users: any[] = (usersRes as any).data || usersRes || [];
        this.totalUsers.set(users.length);

        let students = 0;
        let instructors = 0;
        users.forEach(u => {
          if (u.role === 'STUDENT') students++;
          if (u.role === 'INSTRUCTOR') instructors++;
        });

        this.studentCount.set(students);
        this.instructorCount.set(instructors);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
