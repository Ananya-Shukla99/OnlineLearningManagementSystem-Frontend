import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, AuthUser } from '../services/auth.service';

/**
 * Landing page at /oauth2/callback
 * The backend (OAuth2SuccessHandler) redirects here with ?token=...&role=...&userId=...
 * This component stores the token and redirects to the appropriate dashboard.
 */
@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  template: `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-bg-base, #0d1117);
      color: #fff;
      font-family: 'Inter', sans-serif;
      flex-direction: column;
      gap: 1rem;
    ">
      <div style="
        width: 44px; height: 44px;
        border: 3px solid rgba(255,255,255,0.15);
        border-top-color: #6aaa6a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <p style="opacity:0.6; font-size: 0.9rem;">Signing you in with Google…</p>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    </div>
  `,
})
export class OAuth2CallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit() {
    const token  = this.route.snapshot.queryParamMap.get('token');
    const role   = this.route.snapshot.queryParamMap.get('role');
    const userId = this.route.snapshot.queryParamMap.get('userId');

    if (!token || !role || !userId) {
      // Missing params — send back to login
      this.router.navigate(['/auth']);
      return;
    }

    this.auth.loginWithOAuth2(token, role as AuthUser['role'], Number(userId));
  }
}
