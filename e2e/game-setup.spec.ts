import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'https://marcsuarez74.github.io/square-circle-game/';

/**
 * Tests E2E pour la page de configuration de la partie (Game Setup)
 * Cette page permet de:
 * - Ajouter des joueurs manuellement
 * - Importer des joueurs via Excel
 * - Configurer le nombre de terrains
 * - Configurer la durée du match
 * - Démarrer la partie
 */
test.describe('Page de configuration de la partie', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Attendre que la page soit chargée
    await expect(page.locator('.setup-container')).toBeVisible();
  });

  test.describe('Navigation et affichage initial', () => {
    
    test('devrait afficher le titre de la page', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Configuration');
    });

    test('devrait afficher les sections principales', async ({ page }) => {
      // Section des joueurs
      await expect(page.locator('text=Joueurs')).toBeVisible();
      
      // Section de configuration
      await expect(page.locator('text=Configuration')).toBeVisible();
      
      // Section récapitulative
      await expect(page.locator('text=Récapitulatif')).toBeVisible();
    });

    test('devrait afficher les champs de saisie des joueurs', async ({ page }) => {
      await expect(page.locator('input[placeholder="Prénom"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Nom"]')).toBeVisible();
      await expect(page.locator('button:has-text("Ajouter")')).toBeVisible();
    });
  });

  test.describe('Ajout de joueurs manuel', () => {
    
    test('devrait ajouter un joueur avec succès', async ({ page }) => {
      // Remplir le formulaire
      await page.fill('input[placeholder="Prénom"]', 'Jean');
      await page.fill('input[placeholder="Nom"]', 'Dupont');
      
      // Cliquer sur ajouter
      await page.click('button:has-text("Ajouter")');
      
      // Vérifier que le joueur apparaît dans la liste
      await expect(page.locator('text=Jean Dupont')).toBeVisible();
      
      // Vérifier le compteur
      await expect(page.locator('text=1 joueur')).toBeVisible();
    });

    test('devrait ajouter plusieurs joueurs', async ({ page }) => {
      const joueurs = [
        { prenom: 'Alice', nom: 'Martin' },
        { prenom: 'Bob', nom: 'Bernard' },
        { prenom: 'Charlie', nom: 'Dubois' },
      ];

      for (const joueur of joueurs) {
        await page.fill('input[placeholder="Prénom"]', joueur.prenom);
        await page.fill('input[placeholder="Nom"]', joueur.nom);
        await page.click('button:has-text("Ajouter")');
      }

      // Vérifier que tous les joueurs sont présents
      for (const joueur of joueurs) {
        await expect(page.locator(`text=${joueur.prenom} ${joueur.nom}`)).toBeVisible();
      }

      // Vérifier le compteur
      await expect(page.locator('text=3 joueurs')).toBeVisible();
    });

    test('devrait empêcher l\'ajout sans prénom ou nom', async ({ page }) => {
      // Essayer d'ajouter sans remplir
      await page.click('button:has-text("Ajouter")');
      
      // Vérifier le message d'erreur
      await expect(page.locator('text=Veuillez remplir le prénom et le nom')).toBeVisible();
      
      // Vérifier qu'aucun joueur n'a été ajouté
      await expect(page.locator('text=0 joueur')).toBeVisible();
    });

    test('devrait supprimer un joueur', async ({ page }) => {
      // Ajouter un joueur
      await page.fill('input[placeholder="Prénom"]', 'Test');
      await page.fill('input[placeholder="Nom"]', 'Suppression');
      await page.click('button:has-text("Ajouter")');
      
      // Vérifier qu'il est présent
      await expect(page.locator('text=Test Suppression')).toBeVisible();
      
      // Supprimer le joueur
      await page.click('button[mat-icon-button] mat-icon:has-text("delete")');
      
      // Vérifier qu'il a été supprimé
      await expect(page.locator('text=Test Suppression')).not.toBeVisible();
    });
  });

  test.describe('Import Excel', () => {
    
    test('devrait importer des joueurs depuis un fichier Excel', async ({ page }) => {
      const filePath = path.join(__dirname, 'random-players.xlsx');
      
      // Cliquer sur le bouton d'import Excel
      await page.click('button:has-text("Importer Excel")');
      
      // Uploader le fichier
      const inputFile = page.locator('input[type="file"]');
      await inputFile.setInputFiles(filePath);
      
      // Attendre le traitement
      await page.waitForTimeout(1000);
      
      // Vérifier que des joueurs ont été importés
      const joueursCount = await page.locator('.player-item').count();
      expect(joueursCount).toBeGreaterThan(0);
      
      // Vérifier qu'un message de succès s'affiche
      await expect(page.locator('text=joueurs importés')).toBeVisible();
    });
  });

  test.describe('Configuration du timer', () => {
    
    test('devrait configurere le timer avec les presets', async ({ page }) => {
      // Cliquer sur un preset (par exemple 10 minutes)
      await page.click('button:has-text("10 min")');
      
      // Vérifier que le bouton est sélectionné (classe active)
      await expect(page.locator('button.active:has-text("10 min")')).toBeVisible();
      
      // Vérifier l'affichage
      await expect(page.locator('text=(10 min)')).toBeVisible();
    });

    test('devrait permettre une durée personnalisée', async ({ page }) => {
      // Remplir le champ de durée personnalisée
      await page.fill('input[type="number"]', '15');
      
      // Vérifier que la valeur est prise en compte
      await expect(page.locator('text=(15 min)')).toBeVisible();
    });

    test('devrait afficher la durée en secondes si < 1 minute', async ({ page }) => {
      // Sélectionner 30 secondes (0.5 minutes)
      await page.click('button:has-text("30 sec")');
      
      // Vérifier l'affichage en secondes
      await expect(page.locator('text=(30 sec)')).toBeVisible();
    });
  });

  test.describe('Configuration des terrains', () => {
    
    test('devrait changer le nombre de terrains', async ({ page }) => {
      // Modifier le slider ou l'input des terrains
      await page.fill('input[type="number"]', '3');
      
      // Vérifier que la valeur est mise à jour
      await expect(page.locator('text=3 terrains')).toBeVisible();
    });

    test('devrait afficher le récapitulatif correctement', async ({ page }) => {
      // Ajouter des joueurs
      await page.fill('input[placeholder="Prénom"]', 'Test');
      await page.fill('input[placeholder="Nom"]', 'Terrain');
      await page.click('button:has-text("Ajouter")');
      
      // Configurer le timer
      await page.click('button:has-text("10 min")');
      
      // Configurer 2 terrains
      await page.fill('input[type="number"]', '2');
      
      // Vérifier le récapitulatif
      await expect(page.locator('text=1 joueur')).toBeVisible();
      await expect(page.locator('text=2 terrains')).toBeVisible();
      await expect(page.locator('text=10 min')).toBeVisible();
    });
  });

  test.describe('Validation et démarrage', () => {
    
    test('devrait désactiver le bouton démarrer avec moins de 2 joueurs', async ({ page }) => {
      // Ajouter un seul joueur
      await page.fill('input[placeholder="Prénom"]', 'Solo');
      await page.fill('input[placeholder="Nom"]', 'Joueur');
      await page.click('button:has-text("Ajouter")');
      
      // Vérifier que le bouton est désactivé
      await expect(page.locator('button:has-text("Lancer la partie")')).toBeDisabled();
      
      // Vérifier le message
      await expect(page.locator('text=Il manque 1 joueur')).toBeVisible();
    });

    test('devrait désactiver le bouton démarrer sans timer', async ({ page }) => {
      // Ajouter 2 joueurs
      await page.fill('input[placeholder="Prénom"]', 'Joueur1');
      await page.fill('input[placeholder="Nom"]', 'Test1');
      await page.click('button:has-text("Ajouter")');
      
      await page.fill('input[placeholder="Prénom"]', 'Joueur2');
      await page.fill('input[placeholder="Nom"]', 'Test2');
      await page.click('button:has-text("Ajouter")');
      
      // Ne pas configurer de timer
      
      // Vérifier que le bouton est désactivé
      await expect(page.locator('button:has-text("Lancer la partie")')).toBeDisabled();
      
      // Vérifier le message
      await expect(page.locator('text=Définissez une durée de match')).toBeVisible();
    });

    test('devrait démarrer la partie avec succès', async ({ page }) => {
      // Ajouter 4 joueurs
      for (let i = 1; i <= 4; i++) {
        await page.fill('input[placeholder="Prénom"]', `Joueur${i}`);
        await page.fill('input[placeholder="Nom"]', `Test${i}`);
        await page.click('button:has-text("Ajouter")');
      }
      
      // Configurer le timer
      await page.click('button:has-text("10 min")');
      
      // Configurer 1 terrain
      await page.fill('input[type="number"]', '1');
      
      // Vérifier que le bouton est actif
      await expect(page.locator('button:has-text("Lancer la partie")')).toBeEnabled();
      
      // Cliquer sur démarrer
      await page.click('button:has-text("Lancer la partie")');
      
      // Vérifier la redirection vers l'arène
      await expect(page).toHaveURL(/.*game/);
    });
  });

  test.describe('Import et restauration de partie', () => {
    
    test('devrait afficher le bouton pour reprendre une partie sauvegardée', async ({ page }) => {
      // Simuler l'ajout d'une partie dans le localStorage
      await page.evaluate(() => {
        localStorage.setItem('square-circle-game', JSON.stringify({
          gameState: {
            courts: [],
            waitingQueue: [],
            isTimerRunning: false,
            remainingTime: 600,
            currentSet: 1
          },
          players: [
            { id: '1', number: 1, firstName: 'Test', lastName: 'Restauration', totalPoints: 10, matchesPlayed: 2, wins: 1 }
          ],
          matchScores: {},
          timestamp: Date.now()
        }));
      });
      
      // Recharger la page
      await page.reload();
      
      // Vérifier que le bouton de reprise est affiché
      await expect(page.locator('button:has-text("Reprendre la partie")')).toBeVisible();
    });

    test('devrait importer une partie depuis JSON', async ({ page }) => {
      // Créer un fichier JSON temporaire
      const fs = require('fs');
      const tmpDir = require('os').tmpdir();
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
      
      const filePath = path.join(tmpDir, 'test-game-import.json');
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      
      // Cliquer sur le bouton d'import JSON
      await page.click('button:has-text("Importer JSON")');
      
      // Uploader le fichier JSON
      const inputFile = page.locator('input[type="file"]');
      await inputFile.setInputFiles(filePath);
      
      // Attendre le traitement
      await page.waitForTimeout(1000);
      
      // Vérifier que les données ont été importées
      await expect(page.locator('text=JSON Import')).toBeVisible();
      
      // Nettoyer le fichier temporaire
      fs.unlinkSync(filePath);
    });
  });

  test.describe('Interface utilisateur', () => {
    
    test('devrait avoir un thème sombre par défaut', async ({ page }) => {
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).toContain('dark');
    });

    test('devrait permettre de changer de thème', async ({ page }) => {
      // Cliquer sur le sélecteur de thème
      await page.click('.theme-selector-btn');
      
      // Vérifier que le dropdown s'affiche
      await expect(page.locator('.theme-dropdown')).toBeVisible();
      
      // Choisir un thème (Noël par exemple)
      await page.click('button:has-text("🎄 Noël")');
      
      // Vérifier que le thème est appliqué
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).toContain('theme-christmas');
    });

    test('devrait afficher le bouton de toggle dark/light', async ({ page }) => {
      await expect(page.locator('.theme-toggle')).toBeVisible();
      
      // Cliquer pour passer en mode clair
      await page.click('.theme-toggle');
      
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).toContain('light');
    });
  });
});

test.describe('Tests de flux complet', () => {
  
  test('flux complet: création et démarrage d\'une partie', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Étape 1: Importer des joueurs depuis Excel
    const filePath = path.join(__dirname, 'random-players.xlsx');
    await page.click('button:has-text("Importer Excel")');
    const inputFile = page.locator('input[type="file"]');
    await inputFile.setInputFiles(filePath);
    await page.waitForTimeout(1000);
    
    // Étape 2: Configurer le timer
    await page.click('button:has-text("15 min")');
    
    // Étape 3: Configurer le nombre de terrains
    await page.fill('input[type="number"]', '4');
    
    // Étape 4: Vérifier le récapitulatif
    const joueursText = await page.locator('.joueurs-count').textContent();
    expect(joueursText).toMatch(/\d+ joueurs?/);
    await expect(page.locator('text=15 min')).toBeVisible();
    await expect(page.locator('text=4 terrains')).toBeVisible();
    
    // Étape 5: Démarrer la partie
    await page.click('button:has-text("Lancer la partie")');
    
    // Étape 6: Vérifier qu'on arrive sur la page de jeu
    await expect(page).toHaveURL(/.*game/);
    await expect(page.locator('.arena-container')).toBeVisible();
  });

  test('flux complet: configuration manuelle', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Ajouter 8 joueurs manuellement
    for (let i = 1; i <= 8; i++) {
      await page.fill('input[placeholder="Prénom"]', `Joueur${i}`);
      await page.fill('input[placeholder="Nom"]', `Nom${i}`);
      await page.click('button:has-text("Ajouter")');
    }
    
    // Configurer 2 terrains
    await page.fill('input[type="number"]', '2');
    
    // Configurer 10 minutes
    await page.click('button:has-text("10 min")');
    
    // Démarrer
    await page.click('button:has-text("Lancer la partie")');
    
    // Vérifier
    await expect(page).toHaveURL(/.*game/);
    const courtsCount = await page.locator('.court-card').count();
    expect(courtsCount).toBe(2);
  });
});
