import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

const BASE_URL = 'https://marcsuarez74.github.io/square-circle-game/';

/**
 * Tests E2E pour la page de configuration de la partie (Game Setup)
 */
test.describe('Page de configuration de la partie', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Attendre que la page soit chargée
    await expect(page.locator('.setup-container')).toBeVisible();
  });

  test.describe('Navigation et affichage initial', () => {
    
    test('devrait afficher le titre de la page', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('La Ronde des Carrés');
    });

    test('devrait afficher les sections principales', async ({ page }) => {
      // Section des joueurs
      await expect(page.locator('text=Gestion des Joueurs')).toBeVisible();
      
      // Section de configuration
      await expect(page.locator('text=Configuration de la Partie')).toBeVisible();
      
      // Section récapitulative
      await expect(page.locator('text=Récapitulatif')).toBeVisible();
    });

    test('devrait afficher le formulaire d\'ajout de joueur', async ({ page }) => {
      await expect(page.locator('mat-label:has-text("Prénom")')).toBeVisible();
      await expect(page.locator('mat-label:has-text("Nom")')).toBeVisible();
      await expect(page.locator('button:has-text("Ajouter")')).toBeVisible();
    });

    test('devrait afficher les zones d\'import', async ({ page }) => {
      await expect(page.locator('text=Importer depuis Excel')).toBeVisible();
      await expect(page.locator('text=Charger une partie sauvegardée')).toBeVisible();
    });
  });

  test.describe('Ajout de joueurs manuel', () => {
    
    test('devrait ajouter un joueur avec succès', async ({ page }) => {
      // Remplir le formulaire
      // Trouver l'input Prénom (premier matInput dans le player-form)
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      await prenomInput.fill('Jean');
      await nomInput.fill('Dupont');
      
      // Cliquer sur ajouter
      await page.click('button:has-text("Ajouter")');
      
      // Attendre que le joueur apparaisse
      await page.waitForTimeout(500);
      
      // Vérifier que le joueur apparaît dans la liste
      await expect(page.locator('.player-name:has-text("Jean Dupont")')).toBeVisible();
      
      // Vérifier le compteur
      await expect(page.locator('.players-count')).toContainText('1');
    });

    test('devrait ajouter plusieurs joueurs', async ({ page }) => {
      const joueurs = [
        { prenom: 'Alice', nom: 'Martin' },
        { prenom: 'Bob', nom: 'Bernard' },
        { prenom: 'Charlie', nom: 'Dubois' },
      ];

      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');

      for (const joueur of joueurs) {
        await prenomInput.fill(joueur.prenom);
        await nomInput.fill(joueur.nom);
        await page.click('button:has-text("Ajouter")');
        await page.waitForTimeout(300);
      }

      // Vérifier que tous les joueurs sont présents
      for (const joueur of joueurs) {
        await expect(page.locator(`.player-name:has-text("${joueur.prenom} ${joueur.nom}")`)).toBeVisible();
      }

      // Vérifier le compteur
      await expect(page.locator('.players-count')).toContainText('3');
    });

    test('devrait supprimer un joueur', async ({ page }) => {
      // Ajouter un joueur
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      await prenomInput.fill('Test');
      await nomInput.fill('Suppression');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Vérifier qu'il est présent
      await expect(page.locator('.player-name:has-text("Test Suppression")')).toBeVisible();
      
      // Supprimer le joueur (bouton avec icône close)
      await page.locator('.player-card:has-text("Test Suppression") button.delete-btn').click();
      
      // Vérifier qu'il a été supprimé
      await expect(page.locator('.player-name:has-text("Test Suppression")')).not.toBeVisible();
    });

    test('devrait supprimer tous les joueurs', async ({ page }) => {
      // Ajouter quelques joueurs
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      await prenomInput.fill('Joueur1');
      await nomInput.fill('Test');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      await prenomInput.fill('Joueur2');
      await nomInput.fill('Test');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Cliquer sur "Tout supprimer"
      await page.click('button:has-text("Tout supprimer")');
      
      // Vérifier que la liste est vide
      await expect(page.locator('text=Aucun joueur inscrit')).toBeVisible();
    });
  });

  test.describe('Import Excel', () => {
    
    test('devrait importer des joueurs depuis un fichier Excel', async ({ page }) => {
      const filePath = path.join(__dirname, 'random-players.xlsx');
      
      // Cliquer sur la zone de drop Excel
      await page.locator('.drop-zone').first().click();
      
      // Uploader le fichier (le file input est caché)
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(filePath);
      
      // Attendre le traitement
      await page.waitForTimeout(2000);
      
      // Vérifier que des joueurs ont été importés (le compteur doit être > 0)
      const countText = await page.locator('.players-count').textContent();
      const count = parseInt(countText || '0');
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Configuration du timer', () => {
    
    test('devrait configurer le timer avec les presets', async ({ page }) => {
      // Cliquer sur un preset (30 sec est généralement le premier)
      await page.locator('.timer-grid button').first().click();
      
      // Vérifier que le bouton est sélectionné
      await expect(page.locator('.timer-grid button.active')).toBeVisible();
    });

    test('devrait permettre une durée personnalisée', async ({ page }) => {
      // Remplir le champ de durée personnalisée
      const durationInput = page.locator('input[type="number"]').first();
      await durationInput.fill('15');
      await durationInput.blur();
      
      // Vérifier que la valeur est prise en compte (dans le récapitulatif)
      await expect(page.locator('.summary-row:has-text("Durée/match") .value')).toContainText('15 min');
    });
  });

  test.describe('Configuration des terrains', () => {
    
    test('devrait changer le nombre de terrains', async ({ page }) => {
      // Cliquer sur le bouton 3
      await page.locator('.court-btn:has-text("3")').click();
      
      // Vérifier que le bouton 3 est actif
      await expect(page.locator('.court-btn:has-text("3")')).toHaveClass(/active/);
      
      // Vérifier dans le récapitulatif
      await expect(page.locator('.summary-row:has-text("Terrains") .value')).toContainText('3');
    });

    test('devrait afficher le récapitulatif correctement', async ({ page }) => {
      // Ajouter des joueurs
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      await prenomInput.fill('Test');
      await nomInput.fill('Terrain');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Configurer le timer
      await page.locator('.timer-grid button').first().click();
      
      // Configurer 2 terrains
      await page.locator('.court-btn:has-text("2")').click();
      
      // Vérifier le récapitulatif
      const summaryRows = page.locator('.summary-row');
      await expect(summaryRows.filter({ hasText: 'Joueurs' })).toContainText('1');
      await expect(summaryRows.filter({ hasText: 'Terrains' })).toContainText('2');
    });
  });

  test.describe('Validation et démarrage', () => {
    
    test('devrait désactiver le bouton démarrer avec moins de 2 joueurs', async ({ page }) => {
      // Ajouter un seul joueur
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      await prenomInput.fill('Solo');
      await nomInput.fill('Joueur');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Configurer le timer (nécessaire pour que le form soit presque valide)
      await page.locator('.timer-grid button').first().click();
      
      // Vérifier que le bouton est désactivé
      await expect(page.locator('.start-btn')).toBeDisabled();
    });

    test('devrait désactiver le bouton démarrer sans timer', async ({ page }) => {
      // Ajouter 2 joueurs
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      await prenomInput.fill('Joueur1');
      await nomInput.fill('Test1');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      await prenomInput.fill('Joueur2');
      await nomInput.fill('Test2');
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
      
      // Ne pas configurer de timer
      
      // Vérifier que le bouton est désactivé
      await expect(page.locator('.start-btn')).toBeDisabled();
    });

    test('devrait démarrer la partie avec succès', async ({ page }) => {
      // Ajouter 4 joueurs
      const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
      const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
      
      for (let i = 1; i <= 4; i++) {
        await prenomInput.fill(`Joueur${i}`);
        await nomInput.fill(`Test${i}`);
        await page.click('button:has-text("Ajouter")');
        await page.waitForTimeout(300);
      }
      
      // Configurer le timer
      await page.locator('.timer-grid button').first().click();
      
      // Configurer 1 terrain
      await page.locator('.court-btn:has-text("1")').click();
      
      // Vérifier que le bouton est actif
      await expect(page.locator('.start-btn')).toBeEnabled();
      
      // Cliquer sur démarrer
      await page.click('.start-btn');
      
      // Attendre la redirection vers l'arène
      await page.waitForURL(/.*game/, { timeout: 5000 });
      
      // Vérifier qu'on arrive sur la page de jeu
      await expect(page.locator('.arena-container')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Import et restauration de partie', () => {
    
    test('devrait importer une partie depuis JSON', async ({ page }) => {
      // Créer un fichier JSON temporaire
      const jsonData = {
        exportDate: new Date().toISOString(),
        gameState: {
          courts: [
            { id: 1, name: 'Terrain 1', players: [] }
          ],
          waitingQueue: [],
          isTimerRunning: false,
          remainingTime: 600,
          currentSet: 2
        },
        players: [
          { id: '1', number: 1, firstName: 'JSON', lastName: 'Import', totalPoints: 15, matchesPlayed: 3, wins: 2 }
        ],
        matchScores: {}
      };
      
      const tmpDir = os.tmpdir();
      const filePath = path.join(tmpDir, 'test-game-import.json');
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      
      // Cliquer sur la zone d'import JSON (deuxième drop-zone)
      await page.locator('.json-zone').click();
      
      // Uploader le fichier JSON (deuxième input file)
      const fileInput = page.locator('input[type="file"]').nth(1);
      await fileInput.setInputFiles(filePath);
      
      // Attendre le traitement
      await page.waitForTimeout(1000);
      
      // Vérifier que les données ont été importées
      await expect(page.locator('.player-name:has-text("JSON Import")')).toBeVisible();
      
      // Nettoyer le fichier temporaire
      fs.unlinkSync(filePath);
    });
  });

  test.describe('Interface utilisateur', () => {
    
    test('devrait avoir un thème sombre par défaut', async ({ page }) => {
      const body = page.locator('body');
      const classAttr = await body.getAttribute('class');
      // Vérifier qu'on a la classe dark
      expect(classAttr).toMatch(/dark/);
    });

    test('devrait permettre de changer de thème saisonnier', async ({ page }) => {
      // Le sélecteur de thème est dans le header
      await expect(page.locator('.theme-selector-btn')).toBeVisible();
      
      // Cliquer pour ouvrir le dropdown
      await page.click('.theme-selector-btn');
      
      // Vérifier que le dropdown s'affiche
      await expect(page.locator('.theme-dropdown')).toBeVisible();
    });
  });
});

test.describe('Tests de flux complet', () => {
  
  test('flux complet: création et démarrage d\'une partie avec Excel', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Étape 1: Importer des joueurs depuis Excel
    const filePath = path.join(__dirname, 'random-players.xlsx');
    await page.locator('.drop-zone').first().click();
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
    await page.waitForTimeout(2000);
    
    // Vérifier que des joueurs ont été importés
    const countText = await page.locator('.players-count').textContent();
    const joueursCount = parseInt(countText || '0');
    expect(joueursCount).toBeGreaterThan(0);
    
    // Étape 2: Configurer le timer (15 min)
    await page.locator('.timer-grid button').nth(2).click();
    
    // Étape 3: Configurer le nombre de terrains (4)
    await page.locator('.court-btn:has-text("4")').click();
    
    // Étape 4: Vérifier le récapitulatif
    await expect(page.locator('.summary-row:has-text("Terrains") .value')).toContainText('4');
    
    // Étape 5: Démarrer la partie
    await expect(page.locator('.start-btn')).toBeEnabled();
    await page.click('.start-btn');
    
    // Étape 6: Vérifier qu'on arrive sur la page de jeu
    await page.waitForURL(/.*game/, { timeout: 5000 });
    await expect(page.locator('.arena-container')).toBeVisible({ timeout: 5000 });
  });

  test('flux complet: configuration manuelle', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Ajouter 8 joueurs manuellement
    const prenomInput = page.locator('.player-form mat-form-field').first().locator('input');
    const nomInput = page.locator('.player-form mat-form-field').nth(1).locator('input');
    
    for (let i = 1; i <= 8; i++) {
      await prenomInput.fill(`Joueur${i}`);
      await nomInput.fill(`Nom${i}`);
      await page.click('button:has-text("Ajouter")');
      await page.waitForTimeout(300);
    }
    
    // Configurer 2 terrains
    await page.locator('.court-btn:has-text("2")').click();
    
    // Configurer le timer
    await page.locator('.timer-grid button').first().click();
    
    // Démarrer
    await expect(page.locator('.start-btn')).toBeEnabled();
    await page.click('.start-btn');
    
    // Vérifier la redirection
    await page.waitForURL(/.*game/, { timeout: 5000 });
    await expect(page.locator('.court-card')).toHaveCount(2, { timeout: 5000 });
  });
});
