import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

import { GameSetup } from './components/game-setup/game-setup';
import { GameArena } from './components/game-arena/game-arena';
import { GameStore } from './store/game.store';

const routes: Routes = [
  { path: 'game-setup', component: GameSetup },
  { path: 'game', component: GameArena },
  { path: '', redirectTo: 'game-setup', pathMatch: 'full' },
  { path: '**', redirectTo: 'game-setup' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideAnimationsAsync(),
    provideHttpClient(),
    GameStore,
  ],
};
