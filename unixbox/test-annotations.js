// Quick test of annotation system
import { annotationEngine } from './src/features/annotations/index.ts';

console.log('Testing AnnotationEngine...\n');

// Test 1: Load annotations
console.log('Available syscalls:', annotationEngine.getAvailableSyscalls());

// Test 2: Get specific annotation
const forkAnnotation = annotationEngine.getAnnotation(2);
console.log('\nfork() annotation:');
console.log('  Name:', forkAnnotation.name);
console.log('  Signature:', forkAnnotation.signature);
console.log('  Description:', forkAnnotation.description.substring(0, 80) + '...');

// Test 3: Summary
const summary = annotationEngine.getSummary();
console.log('\nAll annotations:');
summary.forEach(s => {
  console.log(`  ${s.syscallNum}: ${s.name}() - ${s.signature}`);
});

console.log('\n✅ All tests passed!');
