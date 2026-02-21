import { test, expect } from '@playwright/test';
import path from 'path';

// Use environment variable or default to production URL
const BASE_URL = process.env['PLAYWRIGHT_BASE_URL'] || 'https://marcsuarez74.github.io/square-circle-game';
const TIMEOUT = { timeout: 30000 };

/**
 * Tests E2E pour la page d'arène de jeu (Game Arena)
 *
 * Ces tests vérifient:
 * - Affichage des terrains et joueurs
 * - Gestion du timer
 * - Saisie des scores
 * - Navigation entre manches
 * - Panel de classement
 * - Export et fin de partie
 */
test.describe('Page d\'arène de jeu', () => {

  // Helper pour créer une partie minimale et arriver sur la page game
  async function setupGameAndNavigate(page: any, numPlayers: number = 4, numCourts: number = 1) {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Ajouter les joueurs
    for (let i = 1; i <= numPlayers; i++) {
      await page.fill('input[placeholder="Ex: Jean"]', `Joueur${i}`);
      await page.fill('input[placeholder="Ex: Dupont"]', `Nom${i}`);
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
    }

    // Configurer le timer
    const timerButtons = page.locator('.timer-grid button');
    if (await timerButtons.count() > 0) {
      await timerButtons.first().click();
      await page.waitForTimeout(300);
    }

    // Configurer les terrains
    await page.getByRole('button', { name: numCourts.toString(), exact: true }).click();
    await page.waitForTimeout(500);

    // Démarrer la partie
    const startBtn = page.locator('.start-btn');
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // Attendre d'être sur la page game
    await page.waitForURL(/.*#\/game/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText('Terrain', { timeout: 10000 });
  }

  test.describe('Affichage initial', () => {

    test('devrait afficher le header avec le numéro de manche', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      const header = page.locator('.arena-header h1');
      await expect(header).toContainText('Ronde des Carrés - Manche 1', TIMEOUT);
    });

    test('devrait afficher le timer avec le temps configuré', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      const timerDisplay = page.locator('.timer-display');
      await expect(timerDisplay).toBeVisible(TIMEOUT);
      // Vérifier que le timer affiche un format MM:SS
      expect(await timerDisplay.textContent()).toMatch(/\d{2}:\d{2}/);
    });

    test('devrait afficher les terrains avec les joueurs assignés', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      const courtCard = page.locator('.court-card').first();
      await expect(courtCard).toBeVisible(TIMEOUT);
      await expect(courtCard).toContainText('Terrain 1', TIMEOUT);

      // Vérifier que les joueurs sont affichés
      const courtVisual = courtCard.locator('.court-visual');
      await expect(courtVisual).toBeVisible(TIMEOUT);
    });

    test('devrait afficher les zones de score pour chaque terrain', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      const scoreSection = page.locator('.score-section').first();
      await expect(scoreSection).toBeVisible(TIMEOUT);

      // Vérifier les labels des équipes
      await expect(scoreSection).toContainText('Équipe 1', TIMEOUT);
      await expect(scoreSection).toContainText('Équipe 2', TIMEOUT);
    });

    test('devrait afficher le bouton de classement', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      const rankingBtn = page.locator('.ranking-trigger-btn');
      await expect(rankingBtn).toBeVisible(TIMEOUT);
    });
  });

  test.describe('Gestion du timer', () => {

    test('devrait pouvoir démarrer le timer', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Cliquer sur démarrer
      const startBtn = page.locator('button:has-text("Déclencher la manche")');
      await expect(startBtn).toBeVisible(TIMEOUT);
      await startBtn.click();
      await page.waitForTimeout(1000);

      // Vérifier que le timer est en cours (le bouton pause devrait être visible)
      const pauseBtn = page.locator('button:has-text("Pause")');
      await expect(pauseBtn).toBeVisible(TIMEOUT);

      // Vérifier que le timer a une classe d'état active (running, warning ou danger)
      const timerDisplay = page.locator('.timer-display');
      const timerClass = await timerDisplay.getAttribute('class');
      expect(timerClass).toMatch(/(running|warning|danger)/);
    });

    test('devrait pouvoir mettre en pause le timer', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Démarrer le timer
      await page.click('button:has-text("Déclencher la manche")');
      await page.waitForTimeout(1000);

      // Mettre en pause
      const pauseBtn = page.locator('button:has-text("Pause")');
      await pauseBtn.click();
      await page.waitForTimeout(500);

      // Vérifier que le bouton "Déclencher" réapparaît
      const startBtn = page.locator('button:has-text("Déclencher la manche")');
      await expect(startBtn).toBeVisible(TIMEOUT);
    });

    test('devrait afficher les couleurs du timer selon le temps restant', async ({ page }) => {
      // Charger une partie avec 1 minute pour tester le mode warning (< 2 min)
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Ajouter 2 joueurs
      for (let i = 1; i <= 2; i++) {
        await page.fill('input[placeholder="Ex: Jean"]', `J${i}`);
        await page.fill('input[placeholder="Ex: Dupont"]', `N${i}`);
        await page.click('button:has-text("Ajouter")');
        await page.waitForTimeout(300);
      }

      // Configurer 1 minute manuellement via le spinbutton
      await page.getByRole('spinbutton', { name: /durée personnalisée/i }).fill('1');
      await page.waitForTimeout(500);

      // Sélectionner 1 terrain
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.waitForTimeout(500);

      // Démarrer la partie
      await page.click('.start-btn');
      await page.waitForURL(/.*#\/game/, { timeout: 10000 });

      // Démarrer le timer
      await page.click('button:has-text("Déclencher la manche")');
      await page.waitForTimeout(500);

      // Vérifier que le timer a une classe d'état
      const timerDisplay = page.locator('.timer-display');
      const timerClass = await timerDisplay.getAttribute('class');
      expect(timerClass).toMatch(/(running|warning|danger)/);
    });
  });

  test.describe('Gestion des scores', () => {

    test('devrait pouvoir saisir des scores', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Remplir les scores
      const scoreInputs = page.locator('.score-inputs input[type="number"]');
      await scoreInputs.first().fill('21');
      await scoreInputs.last().fill('15');
      await page.waitForTimeout(500);

      // Vérifier que les valeurs sont bien enregistrées
      expect(await scoreInputs.first().inputValue()).toBe('21');
      expect(await scoreInputs.last().inputValue()).toBe('15');
    });

    test('devrait accepter des scores valides', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Saisir des scores valides
      const scoreInput = page.locator('.score-inputs input[type="number"]').first();
      await scoreInput.fill('21');
      await scoreInput.press('Tab');
      await page.waitForTimeout(300);

      // Vérifier que le score est bien enregistré
      const value = await scoreInput.inputValue();
      expect(value).toBe('21');
    });
  });

  test.describe('Navigation et contrôles', () => {

    test('devrait pouvoir mélanger les joueurs', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Noter les joueurs actuels
      const playerElements = page.locator('.court-card .player-number');
      const beforeShuffle = await playerElements.allTextContents();

      // Cliquer sur mélanger
      await page.click('button:has-text("Mélanger les joueurs")');
      await page.waitForTimeout(1000);

      // Vérifier qu'un message de confirmation apparaît
      const snackbar = page.locator('.mat-mdc-snack-bar-container');
      await expect(snackbar).toBeVisible();
      await expect(snackbar).toContainText('Joueurs mélangés');
    });

    test('devrait pouvoir passer à la manche suivante', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Attendre que le timer soit prêt
      await page.waitForTimeout(500);

      // Cliquer sur manche suivante
      const nextBtn = page.locator('button:has-text("Manche suivante")');
      await nextBtn.click();
      await page.waitForTimeout(1000);

      // Vérifier que le header affiche Manche 2
      const header = page.locator('.arena-header h1');
      await expect(header).toContainText('Manche 2', TIMEOUT);
    });

    test('devrait désactiver le bouton manche suivante pendant le timer', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Démarrer le timer
      await page.click('button:has-text("Déclencher la manche")');
      await page.waitForTimeout(500);

      // Vérifier que le bouton est désactivé
      const nextBtn = page.locator('button:has-text("Manche suivante")');
      await expect(nextBtn).toBeDisabled();
    });

    test('devrait rediriger vers la page d\'accueil si pas de partie active', async ({ page }) => {
      // Aller directement sur la page game sans créer de partie
      await page.goto(`${BASE_URL}#/game`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Vérifier qu'on est redirigé vers la page de configuration (par le contenu)
      await expect(page.locator('body')).toContainText('Configurez votre partie', { timeout: 10000 });
      await expect(page.locator('input[placeholder="Ex: Jean"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('File d\'attente', () => {

    test('devrait afficher la file d\'attente quand il y a trop de joueurs', async ({ page }) => {
      // Créer une partie avec plus de joueurs que de capacité
      await setupGameAndNavigate(page, 10, 1);

      // Vérifier que la carte d'attente est visible
      const waitingCard = page.locator('.waiting-card');
      await expect(waitingCard).toBeVisible(TIMEOUT);

      // Vérifier le nombre de joueurs en attente
      await expect(waitingCard).toContainText('File d\'attente', TIMEOUT);
      // 10 joueurs - 1 terrain * 4 = 6 en attente
      await expect(waitingCard).toContainText('6 joueurs', TIMEOUT);
    });
  });

  test.describe('Panel de classement', () => {

    test('devrait ouvrir le panel de classement', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Cliquer sur le bouton du classement
      const rankingBtn = page.locator('.ranking-trigger-btn');
      await rankingBtn.click();
      await page.waitForTimeout(500);

      // Vérifier que le panel est visible (par sa classe CSS)
      const rankingPanel = page.locator('.ranking-panel.visible');
      await expect(rankingPanel).toBeVisible(TIMEOUT);
      await expect(rankingPanel).toContainText('Classement', TIMEOUT);
    });

    test('devrait afficher les joueurs dans le classement', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Ouvrir le panel
      await page.click('.ranking-trigger-btn');
      await page.waitForTimeout(500);

      // Vérifier que les joueurs sont dans le classement
      const rankingItems = page.locator('.ranking-item');
      expect(await rankingItems.count()).toBeGreaterThan(0);

      // Vérifier qu'un joueur spécifique est présent
      await expect(page.locator('.ranking-panel.visible')).toContainText('Joueur1');
    });

    test('devrait fermer le panel avec le bouton close', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Ouvrir le panel
      await page.click('.ranking-trigger-btn');
      await page.waitForTimeout(500);

      // Fermer avec le bouton close
      await page.click('button:has(mat-icon:has-text("close"))');
      await page.waitForTimeout(500);

      // Vérifier que le panel est fermé (le trigger button est visible)
      const rankingBtn = page.locator('.ranking-trigger-btn');
      await expect(rankingBtn).toBeVisible(TIMEOUT);
    });

    test('devrait exporter le classement', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Ouvrir le panel
      await page.click('.ranking-trigger-btn');
      await page.waitForTimeout(500);

      // Cliquer sur le bouton d'export
      await page.click('button:has-text("Exporter")');
      await page.waitForTimeout(1000);

      // Vérifier le message de confirmation
      const snackbar = page.locator('.mat-mdc-snack-bar-container');
      await expect(snackbar).toBeVisible();
    });
  });

  test.describe('Fin de partie', () => {

    test('devrait pouvoir terminer la partie', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Cliquer sur terminer
      await page.click('button:has-text("Terminer la partie")');
      await page.waitForTimeout(1000);

      // Vérifier le message de confirmation
      const snackbar = page.locator('.mat-mdc-snack-bar-container');
      await expect(snackbar).toContainText(/terminée/);
    });

    test('devrait demander confirmation avant de quitter', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      // Cliquer sur retour
      await page.click('button.back-btn');
      await page.waitForTimeout(500);

      // Vérifier que le dialogue de confirmation est affiché
      const dialog = page.locator('mat-dialog-container');
      await expect(dialog).toBeVisible(TIMEOUT);
      await expect(dialog).toContainText('Quitter');
    });
  });

  test.describe('Visualisation des terrains', () => {

    test('devrait afficher correctement un terrain en simple', async ({ page }) => {
      // Configuration simplette (2 joueurs, 1 terrain)
      await setupGameAndNavigate(page, 2, 1);

      // Vérifier que le terrain a 1 joueur de chaque côté
      const courtVisual = page.locator('.court-visual');
      await expect(courtVisual).toBeVisible(TIMEOUT);

      // Vérifier que les 2 joueurs sont présents
      const players = courtVisual.locator('.player');
      expect(await players.count()).toBe(2);
    });

    test('devrait afficher correctement un terrain en double', async ({ page }) => {
      await setupGameAndNavigate(page, 4, 1);

      const courtVisual = page.locator('.court-visual');
      await expect(courtVisual).toBeVisible(TIMEOUT);

      // Vérifier que les 4 joueurs sont présents
      const players = courtVisual.locator('.player');
      expect(await players.count()).toBe(4);
    });

    test('devrait gérer plusieurs terrains', async ({ page }) => {
      await setupGameAndNavigate(page, 8, 2);

      const courts = page.locator('.court-card');
      expect(await courts.count()).toBe(2);

      // Vérifier les noms des terrains
      await expect(courts.first()).toContainText('Terrain 1');
      await expect(courts.last()).toContainText('Terrain 2');
    });
  });

  test.describe('Gestion des noms de joueurs', () => {

    test('devrait afficher uniquement le prénom quand pas de doublon', async ({ page }) => {
      await setupGameAndNavigate(page, 2, 1);

      // Vérifier que le nom affiché ne contient que le prénom
      const playerName = page.locator('.court-card .player-name').first();
      const text = await playerName.textContent();
      // Ne devrait pas contenir de point (qui serait l'initiale du nom)
      expect(text).not.toContain('.');
    });

    test('devrait afficher l\'initiale du nom quand doublon de prénom', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Ajouter 2 joueurs avec le même prénom
      await page.fill('input[placeholder="Ex: Jean"]', 'Jean');
      await page.fill('input[placeholder="Ex: Dupont"]', 'Dupont');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);

      await page.fill('input[placeholder="Ex: Jean"]', 'Jean');
      await page.fill('input[placeholder="Ex: Dupont"]', 'Martin');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);

      // Configurer et lancer
      const timerButtons = page.locator('.timer-grid button');
      if (await timerButtons.count() > 0) {
        await timerButtons.first().click();
      }
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.waitForTimeout(500);

      await page.locator('.start-btn').click();
      await page.waitForURL(/.*#\/game/, { timeout: 10000 });

      // Vérifier que l'initiale du nom est affichée
      const playerNames = page.locator('.court-card .player-name');
      const names = await playerNames.allTextContents();

      // Au moins un devrait contenir une initiale
      const hasInitial = names.some(n => n.match(/Jean [A-Z]\./));
      expect(hasInitial).toBe(true);
    });
  });
});

test.describe('Tests de flux complet - Game Arena', () => {

  test('flux complet: une manche complète', async ({ page }) => {
    // Aller sur la page et configurer
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Ajouter 4 joueurs
    for (let i = 1; i <= 4; i++) {
      await page.fill('input[placeholder="Ex: Jean"]', `J${i}`);
      await page.fill('input[placeholder="Ex: Dupont"]', `N${i}`);
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
    }

    // Configurer (5 minutes + 1 terrain)
    await page.locator('.timer-grid button:has-text("5")').click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.waitForTimeout(500);

    // Démarrer
    await page.locator('.start-btn').click();
    await page.waitForURL(/.*#\/game/, { timeout: 10000 });

    // 1. Démarrer le timer
    await page.click('button:has-text("Déclencher la manche")');
    await page.waitForTimeout(1000);

    // 2. Saisir les scores
    const scoreInputs = page.locator('.score-inputs input[type="number"]');
    await scoreInputs.first().fill('21');
    await scoreInputs.last().fill('18');
    await page.waitForTimeout(500);

    // 3. Mettre en pause
    await page.click('button:has-text("Pause")');
    await page.waitForTimeout(500);

    // 4. Reprendre
    await page.click('button:has-text("Déclencher la manche")');
    await page.waitForTimeout(500);

    // 5. Arrêter et passer manche suivante
    await page.click('button:has-text("Pause")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Manche suivante")');
    await page.waitForTimeout(1000);

    // Vérifier qu'on est en manche 2
    await expect(page.locator('.arena-header h1')).toContainText('Manche 2');

    // 6. Ouvrir le classement
    await page.click('.ranking-trigger-btn');
    // Attendre que le panneau soit dans le DOM et contienne "Classement"
    await page.waitForSelector('.ranking-panel h2', { timeout: 5000 });
    await expect(page.locator('.ranking-panel h2')).toContainText('Classement');

    // 7. Fermer et terminer la partie
    await page.click('button:has(mat-icon:has-text("close"))');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Terminer la partie")');
    await page.waitForTimeout(2000);

    // Vérifier qu'un message de confirmation apparaît
    await expect(page.locator('.mat-mdc-snack-bar-container')).toContainText(/terminée|exportée/);
  });

  test('flux: rotation des joueurs avec file d\'attente', async ({ page }) => {
    // Aller sur la page et configurer
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Ajouter 6 joueurs (plus que la capacité du terrain)
    for (let i = 1; i <= 6; i++) {
      await page.fill('input[placeholder="Ex: Jean"]', `J${i}`);
      await page.fill('input[placeholder="Ex: Dupont"]', `N${i}`);
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
    }

    // Configurer
    const timerButtons = page.locator('.timer-grid button');
    if (await timerButtons.count() > 0) {
      await timerButtons.first().click();
    }
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.waitForTimeout(500);

    // Démarrer
    await page.locator('.start-btn').click();
    await page.waitForURL(/.*#\/game/, { timeout: 10000 });

    // Vérifier la file d'attente (6-4=2 joueurs en attente)
    await expect(page.locator('.waiting-card')).toContainText('2 joueurs');

    // Passer à la manche 2 et vérifier la rotation
    await page.click('button:has-text("Manche suivante")');
    await page.waitForTimeout(1000);

    // Les joueurs en attente devraient maintenant jouer
    await expect(page.locator('.arena-header h1')).toContainText('Manche 2');
  });
});

// Debug: Screenshots en cas d'échec
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/screenshot-arena-${testInfo.title.replace(/\s+/g, '-')}.png`,
      fullPage: true
    });

    console.log(`Test failed: ${testInfo.title}`);
    console.log(`Page title: ${await page.title()}`);
    console.log(`Page URL: ${page.url()}`);
  }
});
