// Design System Standardization Script
// This script standardizes all admin components to use iOS design tokens consistently

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// iOS Design System Mappings - Black Background & Pink Theme
const DESIGN_MAPPINGS = {
  // Focus and ring colors - standardize to pink as main color
  'focus:ring-blue-500': 'focus:ring-pink-500 focus:ring-2',
  'focus:ring-pink-500': 'focus:ring-pink-500 focus:ring-2',
  'focus:ring-2 focus:ring-blue-500': 'focus:ring-pink-500 focus:ring-2',
  'focus:ring-2 focus:ring-pink-500': 'focus:ring-pink-500 focus:ring-2',
  'focus:ring-ios-blue': 'focus:ring-pink-500',
  
  // Border colors - standardize with pink accents
  'border-gray-300': 'border-gray-700',
  'border-gray-600': 'border-gray-600',
  'border-blue-200': 'border-pink-500/20',
  'border-ios-border': 'border-gray-700',
  'focus:border-transparent': 'focus:border-pink-500',
  'focus:border-pink-500': 'focus:border-pink-500',
  'focus:border-blue-500': 'focus:border-pink-500',
  'focus:border-ios-blue': 'focus:border-pink-500',
  
  // Background colors - standardize to black theme
  'bg-blue-50': 'bg-gray-900',
  'bg-blue-100': 'bg-gray-800',
  'bg-gray-50': 'bg-gray-900',
  'bg-gray-100': 'bg-gray-800',
  'bg-gray-200': 'bg-gray-700',
  'bg-gray-300': 'bg-gray-600',
  'bg-gray-700': 'bg-gray-800',
  'bg-gray-800': 'bg-gray-900',
  'bg-white': 'bg-black',
  'bg-ios-bg-primary': 'bg-black',
  'bg-ios-gray-6': 'bg-gray-900',
  'bg-ios-gray-5': 'bg-gray-800',
  'bg-ios-gray-2': 'bg-gray-800',
  'bg-ios-gray-1': 'bg-black',
  
  // Text colors - standardize for black background
  'text-blue-500': 'text-pink-400',
  'text-blue-600': 'text-pink-500',
  'text-blue-800': 'text-pink-300',
  'text-ios-blue': 'text-pink-400',
  'text-ios-blue-dark': 'text-pink-300',
  'text-gray-400': 'text-gray-400',
  'text-gray-500': 'text-gray-300',
  'text-gray-600': 'text-gray-200',
  'text-gray-700': 'text-gray-100',
  'text-gray-800': 'text-gray-100',
  'text-gray-900': 'text-white',
  'text-black': 'text-white',
  'text-ios-text-primary': 'text-white',
  'text-ios-text-secondary': 'text-gray-200',
  'text-ios-gray-text': 'text-gray-400',
  'text-ios-text-primary-dark': 'text-white',
  
  // Button and interactive colors - pink theme
  'hover:bg-blue-50': 'hover:bg-gray-800',
  'hover:bg-gray-50': 'hover:bg-gray-800',
  'hover:bg-gray-100': 'hover:bg-gray-700',
  'hover:text-blue-600': 'hover:text-pink-400',
  'hover:bg-ios-gray-6': 'hover:bg-gray-800',
  'hover:bg-ios-gray-4': 'hover:bg-gray-700',
  
  // Pink button variants
  'bg-blue-500': 'bg-pink-500',
  'bg-blue-600': 'bg-pink-600',
  'hover:bg-blue-600': 'hover:bg-pink-600',
  'hover:bg-blue-700': 'hover:bg-pink-700',
  'bg-ios-blue': 'bg-pink-500',
  'hover:bg-ios-blue-dark': 'hover:bg-pink-600',
  
  // Additional iOS standardizations for dark theme
  'rounded-lg': 'rounded-2xl',
  'shadow-sm': 'shadow-lg shadow-black/50',
  'shadow-md': 'shadow-xl shadow-black/50',
  'shadow-ios-sm': 'shadow-lg shadow-black/50',
  'shadow-ios-md': 'shadow-xl shadow-black/50',
  
  // Icon colors - pink theme
  'stroke-blue-500': 'stroke-pink-400',
  'stroke-gray-400': 'stroke-gray-400',
  'stroke-ios-blue': 'stroke-pink-400',
  'fill-blue-500': 'fill-pink-400',
  'fill-gray-400': 'fill-gray-400',
  'fill-ios-blue': 'fill-pink-400',
  
  // Dark mode cleanup - remove redundant dark: classes since we're going full dark
  'dark:bg-gray-700': 'bg-gray-800',
  'dark:bg-gray-800': 'bg-gray-900',
  'dark:bg-ios-gray-2': 'bg-gray-800',
  'dark:text-gray-100': 'text-white',
  'dark:text-ios-text-primary-dark': 'text-white',
  'dark:border-gray-600': 'border-gray-600'
};

// Files to process
const ADMIN_COMPONENTS_DIR = path.join(process.cwd(), 'src/pages/admin/components');

// Standard input/form class patterns for Black & Pink theme
const BLACK_PINK_INPUT_CLASSES = 'w-full px-4 py-3 border border-gray-700 rounded-2xl focus:ring-pink-500 focus:ring-2 focus:border-pink-500 bg-black text-white placeholder-gray-400 transition-colors duration-200';

const BLACK_PINK_BUTTON_PRIMARY = 'px-6 py-3 bg-pink-500 text-white rounded-2xl font-medium hover:bg-pink-600 focus:ring-pink-500 focus:ring-2 focus:outline-none transition-all duration-200 active:scale-95 shadow-lg shadow-pink-500/25';

const BLACK_PINK_BUTTON_SECONDARY = 'px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium hover:bg-gray-700 focus:ring-pink-500 focus:ring-2 focus:outline-none transition-all duration-200 active:scale-95 border border-gray-700';

function getAllTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function standardizeDesignTokens(content) {
  let updatedContent = content;
  
  // Apply all design mappings
  for (const [oldPattern, newPattern] of Object.entries(DESIGN_MAPPINGS)) {
    // Use word boundaries to ensure we don't match partial class names
    const regex = new RegExp(`\\b${oldPattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`, 'g');
    updatedContent = updatedContent.replace(regex, newPattern);
  }
  
  // Standardize common input patterns
  const inputPatterns = [
    {
      pattern: /className="w-full px-\d+ py-\d+ border border-[\w-\/]+ rounded-[\w-]+ focus:ring-\d+ focus:ring-[\w-\/]+ focus:border-[\w-\/]+[^"]*"/g,
      replacement: `className="${BLACK_PINK_INPUT_CLASSES}"`
    }
  ];
  
  for (const { pattern, replacement } of inputPatterns) {
    updatedContent = updatedContent.replace(pattern, replacement);
  }
  
  return updatedContent;
}

function processFile(filePath) {
  console.log(`Processing: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = standardizeDesignTokens(content);
    
    // Only write if content changed
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⏭️ No changes needed: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎨 STARTING BLACK & PINK DESIGN SYSTEM STANDARDIZATION');
  console.log('====================================================');
  
  if (!fs.existsSync(ADMIN_COMPONENTS_DIR)) {
    console.error(`❌ Admin components directory not found: ${ADMIN_COMPONENTS_DIR}`);
    process.exit(1);
  }
  
  const tsxFiles = getAllTsxFiles(ADMIN_COMPONENTS_DIR);
  console.log(`📁 Found ${tsxFiles.length} TypeScript files to process`);
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  
  console.log('\n📝 Processing files...');
  
  for (const filePath of tsxFiles) {
    const wasUpdated = processFile(filePath);
    totalProcessed++;
    if (wasUpdated) {
      totalUpdated++;
    }
  }
  
  console.log('\n🎨 BLACK & PINK DESIGN STANDARDIZATION SUMMARY');
  console.log('==============================================');
  console.log(`📊 Files processed: ${totalProcessed}`);
  console.log(`✅ Files updated: ${totalUpdated}`);
  console.log(`⏭️ Files unchanged: ${totalProcessed - totalUpdated}`);
  
  if (totalUpdated > 0) {
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Check the changes in your IDE');
    console.log('2. Test the admin panel for visual consistency');
    console.log('3. Verify no TypeScript errors occurred');
    console.log('4. All components should now use BLACK background with PINK accents');
    
    console.log('\n🎯 BLACK & PINK DESIGN CHANGES APPLIED:');
    console.log('• 🖤 Black backgrounds throughout admin interface');
    console.log('• 💗 Pink as primary interaction color (buttons, focus states)');
    console.log('• ⚫ Dark gray borders and secondary elements');
    console.log('• 🤍 White text on dark backgrounds');
    console.log('• ✨ Enhanced shadows with black backdrop');
    console.log('• 🎭 Consistent pink accent theme across all components');
  } else {
    console.log('\n✨ All files already follow the Black & Pink design system!');
  }
  
  console.log('\n🚀 Black & Pink design system standardization completed!');
}

// Run the standardization
main();
