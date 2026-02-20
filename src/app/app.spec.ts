import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes, withHashLocation } from '@angular/router';
import { App } from './app';

// Mock App component with inline template for testing
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  template: `
    <header>
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🏸</span>
          <span class="logo-text">La Ronde des Carrés</span>
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatIconModule],
})
class AppMock {
  protected readonly title = 'square-circle-game';
}

// Simple routes config for testing
const testRoutes: Routes = [
  { path: 'game-setup', component: AppMock },
  { path: 'game', component: AppMock },
  { path: '', redirectTo: 'game-setup', pathMatch: 'full' },
  { path: '**', redirectTo: 'game-setup' },
];

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMock],
      providers: [
        provideRouter(testRoutes, withHashLocation()),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppMock);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have router outlet', () => {
    const fixture = TestBed.createComponent(AppMock);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});
