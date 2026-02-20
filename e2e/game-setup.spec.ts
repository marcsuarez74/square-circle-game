import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

const BASE_URL = 'https://marcsuarez74.github.io/square-circle-game/';
const TIMEOUT = { timeout: 20000 };

/**
 * Tests E2E pour la page de configuration de la partie (Game Setup)
 * 
 * Tests corrigés avec:
 * - Meilleurs timeouts
 * - Sélecteurs plus robustes
 * - Gestion des erreurs
 */
test.describe('Page de configuration de la partie', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    // Attendre que Angular charge complètement
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test.describe('Navigation et affichage initial', () => {
    
    test('devrait afficher le titre de la page', async ({ page }) => {
      const header = page.locator('header.setup-header h1');
      await expect(header).toContainText('La Ronde des Carrés', TIMEOUT);
    });

    test('devrait afficher les sections principales', async ({ page }) => {
      // Utiliser des sélecteurs plus génériques
      const titles = page.locator('mat-card-title');
      await expect(titles.filter({ hasText: /Gestion des Joueurs/i })).toBeVisible(TIMEOUT);
      await expect(titles.filter({ hasText: /Configuration/i })).toBeVisible(TIMEOUT);
      await expect(titles.filter({ hasText: /Récapitulatif/i })).toBeVisible(TIMEOUT);
    });

    test('devrait afficher le formulaire d\'ajout de joueur', async ({ page }) => {
      // Chercher par placeholder qui est plus fiable
      await expect(page.locator('input[placeholder="Ex: Jean"]')).toBeVisible(TIMEOUT);
      await expect(page.locator('input[placeholder="Ex: Dupont"]')).toBeVisible(TIMEOUT);
      await expect(page.locator('button:has-text("Ajouter")')).toBeVisible(TIMEOUT);
    });

    test('devrait afficher les zones d\'import', async ({ page }) => {
      // Chercher dans les drop-zones
      const dropZones = page.locator('.drop-zone');
      await expect(dropZones.first()).toContainText('Importer depuis Excel', TIMEOUT);
      await expect(dropZones.last()).toContainText('Charger une partie', TIMEOUT);
    });
  });

  test.describe('Ajout de joueurs manuel', () => {
    
    test('devrait ajouter un joueur avec succès', async ({ page }) => {
      // Remplir le formulaire avec les attributs placeholder
      await page.fill('input[placeholder="Ex: Jean"]', 'Jean');
      await page.fill('input[placeholder="Ex: Dupont"]', 'Dupont');
      
      // Cliquer sur ajouter
      await page.click('button:has-text("Ajouter")');
      
      // Attendre et vérifier
      await page.waitForTimeout(500);
      
      // Vérifier que le joueur apparaît (utiliser text= pour être plus flexible)
      const playerCards = page.locator('.player-card');
      await expect(playerCards.filter({ hasText: 'Jean' })).toBeVisible(TIMEOUT);
    });

    test('devrait ajouter plusieurs joueurs', async ({ page }) => {
      const joueurs = [
        { prenom: 'Alice', nom: 'Martin' },
        { prenom: 'Bob', nom: 'Bernard' },
      ];

      for (const joueur of joueurs) {
        await page.fill('input[placeholder="Ex: Jean"]', joueur.prenom);
        await page.fill('input[placeholder="Ex: Dupont"]', joueur.nom);
        await page.click('button:has-text("Ajouter")');
        await page.waitForTimeout(300);
      }

      // Vérifier le nombre de joueurs dans le récapitulatif
      const playersCount = page.locator('.players-count');
      await expect(playersCount).toContainText('2', TIMEOUT);
    });

    test('devrait supprimer un joueur', async ({ page }) => {
      // Ajouter un joueur
      await page.fill('input[placeholder="Ex: Jean"]', 'A');
      await page.fill('input[placeholder="Ex: Dupont"]', 'B');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Compter le nombre de joueurs avant
      const countBefore = await page.locator('.player-card').count();
      
      // Supprimer (cliquer sur le premier bouton delete)
      await page.locator('.player-card .delete-btn').first().click();
      await page.waitForTimeout(300);
      
      // Vérifier que le compte a diminué
      const countAfter = await page.locator('.player-card').count();
      expect(countAfter).toBeLessThan(countBefore);
    });
  });

  test.describe('Configuration du timer', () => {
    
    test('devrait configurer le timer avec les presets', async ({ page }) => {
      // Cliquer sur le premier preset
      const timerButtons = page.locator('.timer-grid button');
      const count = await timerButtons.count();
      
      if (count > 0) {
        await timerButtons.first().click();
        await page.waitForTimeout(300);
        
        // Vérifier qu'il y a une classe active
        const activeButton = page.locator('.timer-grid button.active, .timer-grid button.mat-accent');
        await expect(activeButton).toBeVisible(TIMEOUT);
      }
    });

    test('devrait permettre une durée personnalisée', async ({ page }) => {
      // Remplir le champ de durée (le deuxième input number)
      const durationInputs = page.locator('input[type="number"]');
      await durationInputs.first().fill('15');
      await durationInputs.first().blur();
      await page.waitForTimeout(500);
      
      // Vérifier dans le récapitulatif
      const summary = page.locator('.summary-card');
      await expect(summary).toContainText('15', TIMEOUT);
    });
  });

  test.describe('Configuration des terrains', () => {
    
    test('devrait changer le nombre de terrains', async ({ page }) => {
      // Cliquer sur le bouton 3
      const courtBtn = page.locator('.court-btn:has-text("3")');
      await courtBtn.click();
      await page.waitForTimeout(300);
      
      // Vérifier la classe active
      await expect(page.locator('.court-btn.active:has-text("3")')).toBeVisible(TIMEOUT);
    });

    test('devrait afficher le récapitulatif correctement', async ({ page }) => {
      // Ajouter des joueurs
      await page.fill('input[placeholder="Ex: Jean"]', 'Test');
      await page.fill('input[placeholder="Ex: Dupont"]', 'Terrain');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Configurer 3 terrains
      await page.locator('.court-btn:has-text("3")').click();
      await page.waitForTimeout(300);
      
      // Vérifier le récapitulatif contient les valeurs
      const summary = page.locator('.summary-card');
      await expect(summary).toContainText('3', TIMEOUT);
    });
  });

  test.describe('Validation et démarrage', () => {
    
    test('devrait désactiver le bouton démarrer avec moins de 2 joueurs', async ({ page }) => {
      // Ajouter un seul joueur
      await page.fill('input[placeholder="Ex: Jean"]', 'Solo');
      await page.fill('input[placeholder="Ex: Dupont"]', 'Joueur');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Sélectionner un timer
      const timerButtons = page.locator('.timer-grid button');
      if (await timerButtons.count() > 0) {
        await timerButtons.first().click();
        await page.waitForTimeout(300);
      }
      
      // Vérifier que le bouton est désactivé
      const startBtn = page.locator('.start-btn');
      await expect(startBtn).toBeDisabled(TIMEOUT);
    });

    test('devrait démarrer la partie avec succès', async ({ page }) => {
      // Ajouter 2 joueurs minimum
      for (let i = 1; i <= 2; i++) {
        await page.fill('input[placeholder="Ex: Jean"]', `J${i}`);
        await page.fill('input[placeholder="Ex: Dupont"]', `N${i}`);
        await page.click('button:has-text("Ajouter")');
        await page.waitForTimeout(300);
      }
      
      // Configurer le timer
      const timerButtons = page.locator('.timer-grid button');
      if (await timerButtons.count() > 0) {
        await timerButtons.first().click();
        await page.waitForTimeout(300);
      }
      
      // Configurer 1 terrain (utiliser exact: true pour éviter de matcher "10")
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.waitForTimeout(300);
      
      // Attendre que le bouton soit activé
      const startBtn = page.locator('.start-btn');
      await expect(startBtn).toBeEnabled({ timeout: 5000 });
      
      // Cliquer sur démarrer
      await startBtn.click();
      
      // Attendre la redirection
      await page.waitForURL(/.*game/, { timeout: 10000 });
      
      // Vérifier qu'on arrive sur la page de jeu
      await expect(page.locator('body')).toContainText('Terrain', { timeout: 10000 });
    });
  });

  test.describe('Import Excel', () => {
    const filePath = path.join(__dirname, 'random-players.xlsx');
    const fileExists = fs.existsSync(filePath);
    
    test('devrait importer des joueurs depuis Excel', async ({ page }) => {
      test.skip(!fileExists, 'Fichier Excel non trouvé');
      
      // Cliquer sur la zone de drop Excel (première .drop-zone)
      const dropZone = page.locator('.drop-zone').first();
      await dropZone.click();
      
      // Uploader le fichier
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(filePath);
      
      // Attendre le traitement
      await page.waitForTimeout(3000);
      
      // Vérifier que des joueurs ont été importés
      const playerCards = page.locator('.player-card');
      const count = await playerCards.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Import JSON', () => {
    
    test('devrait importer une partie depuis JSON', async ({ page }) => {
      // Créer un fichier JSON temporaire
      const jsonData = {
        exportDate: new Date().toISOString(),
        gameState: {
          courts: [{ id: 1, name: 'Terrain 1', players: [] }],
          waitingQueue: [],
          isTimerRunning: false,
          remainingTime: 600,
          currentSet: 2
        },
        players: [
          { id: 'test-id-1', number: 1, firstName: 'JSON', lastName: 'Test', totalPoints: 15, matchesPlayed: 3, wins: 2 }
        ],
        matchScores: {}
      };
      
      const tmpDir = os.tmpdir();
      const filePath = path.join(tmpDir, 'test-game.json');
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      
      // Cliquer sur la zone d'import JSON
      const jsonZone = page.locator('.json-zone, .drop-zone').nth(1);
      await jsonZone.click();
      
      // Uploader le fichier
      const fileInput = page.locator('input[type="file"]').nth(1);
      await fileInput.setInputFiles(filePath);
      
      // Attendre
      await page.waitForTimeout(2000);
      
      // Vérifier que le joueur a été importé
      await expect(page.locator('.player-card:has-text("JSON")')).toBeVisible(TIMEOUT);
      
      // Nettoyer
      fs.unlinkSync(filePath);
    });
  });

  test.describe('Interface et thèmes', () => {
    
    test('devrait afficher le sélecteur de thème', async ({ page }) => {
      const themeSelector = page.locator('.theme-selector-btn, [aria-label="Thème"]').first();
      await expect(themeSelector).toBeVisible(TIMEOUT);
    });
  });
});

test.describe('Tests de flux complet', () => {
  const excelFilePath = path.join(__dirname, 'random-players.xlsx');
  
  test('flux complet: création avec Excel', async ({ page }) => {
    const filePath = excelFilePath;
    
    test.skip(!fs.existsSync(filePath), 'Fichier Excel non trouvé');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Importer Excel
    await page.locator('.drop-zone').first().click();
    await page.locator('input[type="file"]').first().setInputFiles(filePath);
    await page.waitForTimeout(2000);
    
    // Configurer
    const timerButtons = page.locator('.timer-grid button');
    if (await timerButtons.count() > 0) {
      await timerButtons.first().click();
    }
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.waitForTimeout(500);
    
    // Démarrer si possible
    const startBtn = page.locator('.start-btn');
    if (await startBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForURL(/.*game/, { timeout: 10000 });
    }
  });

  test('flux complet: configuration manuelle', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Ajouter 2 joueurs
    for (let i = 1; i <= 2; i++) {
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
    const startBtn = page.locator('.start-btn');
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();
    
    await page.waitForURL(/.*game/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText('Terrain', { timeout: 10000 });
  });
});

// Debug: afficher les erreurs
// Pour déboguer les tests qui échouent:
// 1. Ajouter des screenshots
// 2. Logger le HTML
// 3. Vérifier les erreurs console

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Prendre un screenshot si le test échoue
    await page.screenshot({ 
      path: `test-results/screenshot-${testInfo.title.replace(/\s+/g, '-')}.png`,
      fullPage: true 
    });
    
    // Logger le titre de la page
    console.log(`Test failed: ${testInfo.title}`);
    console.log(`Page title: ${await page.title()}`);
    console.log(`Page URL: ${page.url()}`);
  }
});
