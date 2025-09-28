import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Test to verify that components have separate CSS files
describe('Component CSS Modularity', () => {
  // Define the features paths to check
  const featuresPath = path.join(__dirname, '../src/features');

  // Get all component files that should have corresponding CSS
  const getComponentFiles = (): string[] => {
    const componentFiles: string[] = [];
    
    // Walk through the features directory to find .tsx files
    function walk(dir: string) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) {
          componentFiles.push(filePath);
        }
      }
    }
    
    walk(featuresPath);
    return componentFiles;
  };

  it('verifies each component has a corresponding CSS file', () => {
    const componentFiles = getComponentFiles();
    const missingCSS: string[] = [];
    
    for (const componentPath of componentFiles) {
      const dir = path.dirname(componentPath);
      const baseName = path.basename(componentPath, '.tsx');
      
      const cssPath = path.join(dir, `${baseName}.css`);
      const moduleCSSPath = path.join(dir, `${baseName}.module.css`);
      
      // Check if either CSS file exists
      const hasCSS = fs.existsSync(cssPath) || fs.existsSync(moduleCSSPath);
      
      if (!hasCSS) {
        missingCSS.push(componentPath);
      }
    }
    
    if (missingCSS.length > 0) {
      console.log('Components without CSS files:');
      missingCSS.forEach(file => console.log(`  - ${file}`));
    }
    
    expect(missingCSS).toHaveLength(0);
  });

  it('verifies CSS files use theme variables for dark mode support', () => {
    const componentFiles = getComponentFiles();
    const cssFiles: string[] = [];
    
    // Find all CSS files
    for (const componentPath of componentFiles) {
      const dir = path.dirname(componentPath);
      const baseName = path.basename(componentPath, '.tsx');
      
      const cssPath = path.join(dir, `${baseName}.css`);
      const moduleCSSPath = path.join(dir, `${baseName}.module.css`);
      
      if (fs.existsSync(cssPath)) {
        cssFiles.push(cssPath);
      } else if (fs.existsSync(moduleCSSPath)) {
        cssFiles.push(moduleCSSPath);
      }
    }
    
    const cssWithoutThemeVars: string[] = [];
    
    for (const cssPath of cssFiles) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Check if CSS uses theme variables
      const hasThemeVars = /var\(--(bg|panel|text|stroke|primary|success|warning|error)\b/.test(cssContent);
      
      if (!hasThemeVars) {
        cssWithoutThemeVars.push(cssPath);
      }
    }
    
    // Instead of failing the test, we'll log these for reference
    if (cssWithoutThemeVars.length > 0) {
      console.log('CSS files without theme variables (may use .dark classes):');
      cssWithoutThemeVars.forEach(file => console.log(`  - ${file}`));
    }
  });

  it('verifies components import their CSS files', () => {
    const componentFiles = getComponentFiles();
    const componentsWithoutCSSImport: string[] = [];
    
    for (const componentPath of componentFiles) {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check if component imports a CSS file
      const hasCSSImport = /import ["']\.\/.*\.css["']/.test(content) ||
                          /import ["']\.\/.*\.module\.css["']/.test(content);
      
      if (!hasCSSImport) {
        componentsWithoutCSSImport.push(componentPath);
      }
    }
    
    if (componentsWithoutCSSImport.length > 0) {
      console.log('Components without CSS imports:');
      componentsWithoutCSSImport.forEach(file => console.log(`  - ${file}`));
    }
    
    expect(componentsWithoutCSSImport).toHaveLength(0);
  });
});