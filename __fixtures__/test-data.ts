export const mockDiff = `diff --git a/src/index.ts b/src/index.ts
index 1234567..abcdefg 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,6 @@
 export class Example {
   constructor() {
     console.log('Hello')
+    console.log('World')
   }
 }
diff --git a/package-lock.json b/package-lock.json
index 1234567..abcdefg 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,100 +1,100 @@
[... package lock content ...]
diff --git a/README.md b/README.md
index 1234567..abcdefg 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # Test Project
 
 This is a test
+With new content`

export const mockPRInfo = {
  number: 123,
  title: 'Add new feature',
  base: 'main',
  head: 'feature-branch',
  author: 'test-user',
  created_at: '2024-01-01T00:00:00Z'
}

export const mockConfig = {
  sections: ['description', 'main_changes', 'testing'],
  exclude_files: ['package-lock.json'],
  max_diff_size: 250000,
  custom_prompt: 'Focus on technical details'
}

export const mockGeneratedDescription = `# PR: Add new feature

## 📋 Descripción

Esta PR añade una nueva funcionalidad al proyecto.

## 🚀 Cambios Principales

### ✨ Nueva Funcionalidad
- Añadido método World a la clase Example
- Actualizado README con nueva información

## 🧪 Testing

Los tests han sido actualizados para cubrir los nuevos cambios.`
