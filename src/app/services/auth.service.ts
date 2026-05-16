import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap, catchError, of } from 'rxjs';

export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  token: string;
  bio?: string;
  mobile?: string;
  headline?: string;
  expertise?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(this.loadFromStorage());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isStudent = computed(() => this._user()?.role === 'STUDENT');
  readonly isInstructor = computed(() => this._user()?.role === 'INSTRUCTOR');
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly userId = computed(() => this._user()?.userId ?? null);

  constructor(private api: ApiService, private router: Router) { }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res: any) => {
        if (res.success) {
          const user: AuthUser = {
            userId: res.userId,
            email: res.email,
            fullName: res.fullName,
            role: res.role as AuthUser['role'],
            token: res.token,
            bio: res.bio,
            mobile: res.mobile,
            headline: res.headline,
            expertise: res.expertise,
          };
          this._user.set(user);
          localStorage.setItem('auth_user', JSON.stringify(user));
          localStorage.setItem('token', res.token);
          this.redirectAfterLogin(user.role);
        }
      }),
    );
  }

  sendOtp(email: string) {
    return this.api.sendOtp(email);
  }

  register(email: string, fullName: string, password: string, role: string, otp: string) {
    return this.api.register(email, fullName, password, role, otp);
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  /** Called by OAuth2CallbackComponent after Google redirect */
  loginWithOAuth2(token: string, role: AuthUser['role'], userId: number) {
    // We don't have fullName/email from the token in the browser directly,
    // so build a minimal user and then refresh from server.
    const user: AuthUser = { userId, email: '', fullName: '', role, token };
    this._user.set(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('token', token);
    // Fetch full profile to populate email/fullName
    this.refreshCurrentUser();
    this.redirectAfterLogin(role);
  }




  /** Update the user signal & localStorage with partial user data */
  updateUser(partial: Partial<AuthUser>) {
    const current = this._user();
    if (!current) return;

    // Filter out null/undefined values to avoid overwriting existing data (like token)
    const cleanPartial = Object.fromEntries(
      Object.entries(partial).filter(([_, v]) => v != null)
    );

    const updated = { ...current, ...cleanPartial };
    this._user.set(updated as AuthUser);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  }

  /** Refresh user from the server via GET /auth/me */
  refreshCurrentUser() {
    this.api.getCurrentUser().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.updateUser({
            userId: res.userId, // KEY FIX: Sync the ID too!
            fullName: res.fullName,
            email: res.email,
            bio: res.bio,
            mobile: res.mobile,
            headline: res.headline,
            expertise: res.expertise,
          });
        }
      },
      error: () => {
        // Token expired or invalid — log out
        this.logout();
      },
    });
  }

  private redirectAfterLogin(role: string) {
    switch (role) {
      case 'STUDENT': this.router.navigate(['/student']); break;
      case 'INSTRUCTOR': this.router.navigate(['/instructor']); break;
      case 'ADMIN': this.router.navigate(['/admin']); break;
      default: this.router.navigate(['/']);
    }
  }
}
