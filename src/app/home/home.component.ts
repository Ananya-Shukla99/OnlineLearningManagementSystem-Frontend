import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="landing-shell">
      <div class="glow-warm"></div>
      <div class="glow-teal"></div>

      <header class="landing-topbar">
        <a routerLink="/" class="brand-mark brand-link">EDULEARN</a>

        <nav class="landing-nav" aria-label="Primary">
          <a routerLink="/explore" class="el-nav-link">Courses</a>
          <a routerLink="/" [queryParams]="{section: 1}" class="el-nav-link">About</a>
          <a routerLink="/" [queryParams]="{section: 2}" class="el-nav-link">Community</a>
        </nav>

        @if (auth.isLoggedIn()) {
          <a [routerLink]="'/' + auth.user()?.role?.toLowerCase() + (auth.user()?.role === 'ADMIN' ? '' : '/profile')" class="topbar-signin">Profile</a>
        } @else {
          <a routerLink="/auth" [queryParams]="{mode: 'login'}" class="topbar-signin">Sign In</a>
        }
      </header>

      <div class="home-scroll" #scrollContainer (scroll)="handleScroll()">
        <!-- SLIDE 1: MINIMAL INTRO -->
        <section class="home-section hero-slide">
          <div class="el-grain"></div>
          <div class="hero-copy el-fade-1">
            <h1 class="el-heading">Learn without boundaries</h1>
            <p>Immersive courses crafted by world-class creators. Unlock your potential in design, code, and beyond.</p>
          </div>

          <button class="scroll-hint" type="button" (click)="scrollToSection(1)">
            Scroll <span class="arrow-move">→</span>
          </button>
        </section>

        <!-- SLIDE 2: STATS OF APPLICATION -->
        <section class="home-section story-slide">
          <div class="el-grain"></div>
          <div class="story-copy el-fade-2">
            <div class="header-section">
              <p class="platform-header">THE PLATFORM</p>
            </div>
            <h2 class="el-heading">Education reimagined for the modern creative</h2>
            <p>EduLearn brings together the world's most talented instructors with a learning experience that feels alive. Every course is designed to be immersive, hands-on, and endlessly rewarding.</p>
            
            <div class="story-metrics">
              @for (stat of storyStats; track stat.label) {
                <div class="metric">
                  <strong>{{ stat.value }}</strong>
                  <span>{{ stat.label }}</span>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- SLIDE 3: COMMUNITY SLIDE -->
        <section class="home-section community-slide">
          <div class="el-grain"></div>
          <div class="community-grid">
            <div class="community-info el-fade-3">
              <div class="header-section">
                <p class="featured-header">COMMUNITY</p>
              </div>
              <h2 class="el-heading">Connect with a global network of learners</h2>
              <p class="page-copy">Our community is the heart of EduLearn. Join thousands of creators, engineers, and designers sharing their journey, solving problems together, and pushing the boundaries of what's possible.</p>
              
              <div class="community-stats">
                <div class="c-stat">
                  <strong>500+</strong>
                  <span>Daily Discussions</span>
                </div>
                <div class="c-stat">
                  <strong>100+</strong>
                  <span>Countries Represented</span>
                </div>
              </div>
              
              <a routerLink="/auth" class="el-btn" style="display: inline-block; width: auto; margin-top: 1rem;">Join the Community</a>
            </div>
            
            <div class="community-visual el-fade-3">
               <!-- Dense Colorful Obsidian-style Graph -->
               <div class="graph-container">
                 <!-- CENTRAL HUB (ADMIN) -->
                 <div class="graph-node node-admin central">
                   <div class="node-pulse"></div>
                   <span class="node-label show">EduLearn Admin</span>
                 </div>

                 <!-- INSTRUCTOR CLUSTER (Primary Nodes) -->
                 <div class="graph-cluster instructors">
                   <div class="graph-node node-instructor p-i1"><span class="node-label show">Vishal</span></div>
                   <div class="graph-node node-instructor p-i2"><span class="node-label show">Ved</span></div>
                   <div class="graph-node node-instructor p-i3"><span class="node-label show">Om</span></div>
                   <div class="graph-node node-instructor p-i4"><span class="node-label show">Kote</span></div>
                 </div>

                 <!-- STUDENT CLUSTER (Dense Nodes) -->
                 <div class="graph-cluster students">
                   <div class="graph-node node-student p-s1"><span class="node-label">DSA</span></div>
                   <div class="graph-node node-student p-s2"><span class="node-label">Project X</span></div>
                   <div class="graph-node node-student p-s3"><span class="node-label">Cloud Prep</span></div>
                   <div class="graph-node node-student p-s4"><span class="node-label">Portfolio</span></div>
                   <div class="graph-node node-student p-s5"><span class="node-label">Interview</span></div>
                   <div class="graph-node node-student p-s6"><span class="node-label">Hiring</span></div>
                   <div class="graph-node node-student p-s7"><span class="node-label">Multithreading</span></div>
                   <div class="graph-node node-student p-s8"><span class="node-label">React UI</span></div>
                   <div class="graph-node node-student p-s9"><span class="node-label">Vite</span></div>
                   <div class="graph-node node-student p-s10"><span class="node-label">Microservices</span></div>
                 </div>

                 <!-- Connection Lines (SVG) -->
                 <svg class="graph-lines" viewBox="0 0 400 400">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.2)" />
                      </marker>
                    </defs>
                    
                    <!-- Admin to Instructors -->
                    <line x1="200" y1="200" x2="280" y2="120" class="line-pulse l-admin" />
                    <line x1="200" y1="200" x2="120" y2="140" class="line-pulse l-admin" />
                    <line x1="200" y1="200" x2="100" y2="280" class="line-pulse l-admin" />
                    <line x1="200" y1="200" x2="300" y2="300" class="line-pulse l-admin" />
                    
                    <!-- Cross connections (like the screenshot) -->
                    <line x1="120" y1="140" x2="280" y2="120" class="line-dim" />
                    <line x1="100" y1="280" x2="160" y2="340" class="line-dim" marker-end="url(#arrowhead)" />
                    <line x1="300" y1="300" x2="350" y2="200" class="line-dim" />
                    
                    <!-- Background Orbital paths -->
                    <circle cx="200" cy="200" r="90" class="orbit-path" />
                    <circle cx="200" cy="200" r="160" class="orbit-path" />
                 </svg>
               </div>
               <div class="community-blob color-mix"></div>
            </div>
          </div>
        </section>

        <!-- SLIDE 4: ESSENCE CARDS -->
        <section class="home-section essence-slide">
          <div class="el-grain"></div>
          <div class="slide-header el-fade-4" style="padding: 0 clamp(48px, 8vw, 140px); width: 100%; margin-bottom: 2rem;">
            <div class="header-section">
              <p class="featured-header">OUR ESSENCE</p>
            </div>
            <h2 class="el-heading" style="font-size: clamp(30px, 3.8vw, 48px); font-weight: 500;">Why choose EduLearn?</h2>
          </div>

          <div class="essence-strip el-fade-4">
            <article class="essence-card">
              <div class="essence-num">01.</div>
              <h3 class="essence-title">Mastery</h3>
              <p class="essence-desc">Go beyond the basics. Our courses are structured to build profound understanding, taking you from novice to expert through structured, progressive challenges.</p>
            </article>

            <article class="essence-card">
              <div class="essence-num">02.</div>
              <h3 class="essence-title">Collaboration</h3>
              <p class="essence-desc">Learn together. Our platform encourages peer-to-peer learning and instructor mentorship to ensure you never learn in isolation.</p>
            </article>

            <article class="essence-card">
              <div class="essence-num">03.</div>
              <h3 class="essence-title">Innovation</h3>
              <p class="essence-desc">Learn the latest tools, frameworks, and methodologies. Our curriculum adapts continuously to match the cutting-edge demands of the industry.</p>
            </article>
          </div>
        </section>

        <!-- SLIDE 5: CLOSING & AUTH BUTTONS -->
        <section class="home-section login-slide">
          <div class="el-grain"></div>
          <article class="el-card sign-in-card el-fade-5" style="text-align: center;">
            <h2 class="el-heading">Ready to begin?</h2>
            <p class="page-copy" style="margin: 1rem 0 2.5rem; font-size: 1.1rem; opacity: 0.8;">
              Take the next step in your learning journey. Join EduLearn today and unlock a world of possibilities.
            </p>

            <div class="home-login-buttons" style="display: flex; flex-direction: column; gap: 1rem;">
              <a routerLink="/auth" class="el-btn" style="text-decoration: none; text-align: center; display: block; width: 100%; padding: 16px;">
                Create an Account
              </a>
              <a routerLink="/auth" class="el-btn home-login-btn-alt" style="text-decoration: none; text-align: center; display: block; width: 100%; padding: 16px;">
                Sign In
              </a>
            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
              <a routerLink="/explore" class="auth-link-btn" style="color: var(--el-text-muted); font-size: 0.9rem;">
                Continue as Guest <span class="arrow-move">→</span>
              </a>
            </div>
          </article>
        </section>
      </div>

      <!-- NAVIGATION -->
      <div class="el-dots" aria-label="Landing sections">
        @for (section of sections; track section) {
          <button class="el-dot" type="button" [class.el-dot--active]="section === currentSection" (click)="scrollToSection(section)" [attr.aria-label]="'Go to section ' + (section + 1)" [attr.aria-current]="section === currentSection"></button>
        }
      </div>
    </div>
  `,
  styles: `
    .community-slide {
      background: rgba(0,0,0,0.2);
    }
    
    .community-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 4rem;
      padding: 0 clamp(48px, 8vw, 140px);
      width: 100%;
      align-items: center;
    }
    
    .community-info h2 {
      font-size: clamp(32px, 4.5vw, 56px);
      margin: 1.5rem 0;
      line-height: 1.1;
    }
    
    .community-info p {
      font-size: 1.1rem;
      max-width: 50ch;
      opacity: 0.8;
      margin-bottom: 2.5rem;
    }
    
    .community-stats {
      display: flex;
      gap: 3rem;
      margin-bottom: 2rem;
    }
    
    .c-stat strong {
      display: block;
      font-size: 2.5rem;
      font-family: 'Space Grotesk', sans-serif;
      color: var(--el-text-primary);
    }
    
    .c-stat span {
      font-size: 0.9rem;
      color: var(--el-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .community-visual {
      position: relative;
      height: 550px;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1200px;
    }
    
    .graph-container {
      position: relative;
      width: 450px;
      height: 450px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-style: preserve-3d;
      animation: graphRotate 25s infinite linear;
    }

    @keyframes graphRotate {
      0% { transform: rotateY(0deg) rotateX(5deg); }
      50% { transform: rotateY(180deg) rotateX(-5deg); }
      100% { transform: rotateY(360deg) rotateX(5deg); }
    }

    .graph-node {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      z-index: 10;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .node-label {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 9px;
      font-family: 'Space Grotesk', sans-serif;
      color: rgba(255,255,255,0.7);
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: 0.05em;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
    }

    .node-label.show { opacity: 0.9; transform: translateX(-50%) translateY(5px); }
    .graph-node:hover .node-label { opacity: 1; transform: translateX(-50%) translateY(5px); }
    .graph-node:hover { transform: scale(1.5); }

    /* Admin Styles (Gold) */
    .node-admin {
      width: 14px;
      height: 14px;
      background: #ffd700;
      box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
    }
    .node-admin .node-pulse { border-color: rgba(255, 215, 0, 0.4); }

    /* Instructor Styles (Cyan) */
    .node-instructor {
      width: 10px;
      height: 10px;
      background: #00f2ff;
      box-shadow: 0 0 15px rgba(0, 242, 255, 0.5);
    }
    .node-instructor .node-label { color: #00f2ff; font-weight: 600; }

    /* Student Styles (Sunset) */
    .node-student {
      width: 5px;
      height: 5px;
      background: #ff00ff;
      box-shadow: 0 0 10px rgba(255, 0, 255, 0.4);
    }

    /* Node Positioning (to match dense screenshot) */
    .p-i1 { transform: translate(80px, -80px); }
    .p-i2 { transform: translate(-80px, -60px); }
    .p-i3 { transform: translate(-100px, 80px); }
    .p-i4 { transform: translate(100px, 100px); }

    .p-s1 { transform: translate(20px, -140px); }
    .p-s2 { transform: translate(150px, -30px); }
    .p-s3 { transform: translate(-160px, 10px); }
    .p-s4 { transform: translate(50px, 160px); }
    .p-s5 { transform: translate(-40px, 180px); }
    .p-s6 { transform: translate(-140px, -130px); }
    .p-s7 { transform: translate(140px, 130px); }
    .p-s8 { transform: translate(170px, -90px); }
    .p-s9 { transform: translate(-180px, 90px); }
    .p-s10 { transform: translate(0px, -180px); }

    .graph-lines {
      position: absolute;
      inset: -50px;
      width: calc(100% + 100px);
      height: calc(100% + 100px);
      pointer-events: none;
      overflow: visible;
    }

    .line-pulse {
      stroke: rgba(255,255,255,0.15);
      stroke-width: 0.8;
      stroke-dasharray: 4,4;
      animation: lineFlow 15s infinite linear;
    }
    .l-admin { stroke-width: 1.2; stroke: rgba(255, 215, 0, 0.2); }

    .line-dim {
      stroke: rgba(255,255,255,0.06);
      stroke-width: 0.5;
    }

    .orbit-path {
      fill: none;
      stroke: rgba(255,255,255,0.03);
      stroke-width: 1;
    }

    @keyframes lineFlow {
      to { stroke-dashoffset: -100; }
    }
    
    .color-mix {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle at center, 
        rgba(0, 242, 255, 0.05) 0%, 
        rgba(255, 0, 255, 0.05) 30%, 
        transparent 70%);
      filter: blur(80px);
      z-index: 1;
    }

    .essence-slide {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: rgba(0,0,0,0.4);
    }
    
    .essence-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 0 clamp(48px, 8vw, 140px);
      width: 100%;
      z-index: 2;
    }
    
    .essence-card {
      background: var(--el-card-bg);
      border: 1px solid var(--el-card-border);
      border-radius: 20px;
      padding: 36px 32px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s ease;
      cursor: pointer;
    }
    
    .essence-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      border-color: rgba(255,255,255,0.2);
    }
    
    .essence-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
      margin-bottom: 24px;
      letter-spacing: 0.05em;
    }
    
    .essence-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 500;
      color: var(--el-text-primary);
      margin-bottom: 16px;
    }
    
    .essence-desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: var(--el-text-secondary);
      margin: 0;
    }

    .home-login-buttons {
      margin-top: 0.5rem;
    }
    
    .sign-in-card {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      color: #fff !important;
    }

    .sign-in-card .el-heading {
      color: #fff !important;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .sign-in-card .page-copy {
      color: rgba(255, 255, 255, 0.8) !important;
      font-size: 0.95rem;
    }

    .sign-in-card .field span {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.85rem;
      text-transform: none;
      letter-spacing: normal;
    }

    .sign-in-card .el-input {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      color: #fff !important;
      border-radius: 12px;
    }

    .sign-in-card .el-input::placeholder {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .sign-in-card .el-btn:not(.home-login-btn-alt) {
      background: #fff !important;
      color: #1a1a1a !important;
      border-radius: 12px;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s;
    }
    
    .sign-in-card .el-btn:not(.home-login-btn-alt):hover {
      background: #f0f0f0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.2);
    }
    
    @media (max-width: 900px) {
      .community-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }
      .community-info p { margin-left: auto; margin-right: auto; }
      .community-stats { justify-content: center; }
      .community-visual { height: 200px; }
    }
  `,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private readonly scrollContainer?: ElementRef<HTMLDivElement>;
  
  protected readonly sections = [0, 1, 2, 3, 4];
  protected readonly totalSections = 5;
  protected currentSection = 0;
  protected readonly storyStats = [
    { label: 'Students', value: '15K+' },
    { label: 'Courses', value: '300+' },
    { label: 'Satisfaction', value: '99%' },
  ];

  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoScrollInterval: ReturnType<typeof setInterval> | null = null;
  private querySectionSub: Subscription | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    protected readonly router: Router,
    public readonly auth: AuthService,
  ) { }

  ngOnInit(): void {
    // Note: If you want to keep featured courses nearby, you can still fetch them. 
    // They are removed from the template, but we keep the auth check intact if needed.
  }

  ngAfterViewInit(): void {
    this.querySectionSub = this.route.queryParamMap.subscribe((params) => {
      const sectionParam = params.get('section');
      if (sectionParam === null) {
        this.scrollToSection(0);
        return;
      }

      const parsed = Number(sectionParam);
      if (Number.isInteger(parsed)) {
        this.scrollToSection(parsed);
      }
    });

    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.querySectionSub?.unsubscribe();
    this.stopAutoScroll();
  }

  private startAutoScroll(): void {
    this.stopAutoScroll();
    this.autoScrollInterval = setInterval(() => {
      const nextSection = (this.currentSection + 1) % this.totalSections;
      this.scrollToSection(nextSection);
    }, 3000);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  protected scrollToSection(index: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const clamped = Math.max(0, Math.min(index, this.totalSections - 1));
    const sectionWidth = container.offsetWidth;
    container.scrollTo({ left: clamped * sectionWidth, behavior: 'smooth' });
    this.currentSection = clamped;

    // Reset auto-scroll timer on manual navigation
    this.startAutoScroll();
  }

  protected handleScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const container = this.scrollContainer?.nativeElement;
      if (!container || container.offsetWidth === 0) return;
      this.currentSection = Math.round(container.scrollLeft / container.offsetWidth);

      // Keep auto-scroll running, but reset its clock after user manually scrolled
      this.startAutoScroll();
    }, 100);
  }
}
