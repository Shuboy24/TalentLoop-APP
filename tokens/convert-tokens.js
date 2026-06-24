/**
 * TalentLoop Design Token Converter
 * 
 * Reads the Figma-exported design tokens JSON and converts them
 * into CSS custom properties (variables).
 * 
 * Color tokens: Only COLOR ROLES are output (not primitives).
 *   - Color role references like "{talentloop primitive colors.talentloop color palette.primary.primary90}"
 *     are resolved to their actual hex values from the primitive palette.
 * 
 * Typography tokens: Both the "font" (Figma custom-fontStyle) and "typography"
 *   sections are processed. The "typography" section is used as the canonical source
 *   since it has a cleaner structure.
 * 
 * Usage: node convert-tokens.js
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────────────
const INPUT_FILE = path.join(__dirname, 'design-tokens.json');
const OUTPUT_FILE = path.join(__dirname, 'design-tokens.css');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert a token name to a valid CSS variable name.
 * e.g. "on primary container" → "on-primary-container"
 */
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Resolve a Figma token reference string to its actual hex value.
 *
 * References look like:
 *   "{talentloop primitive colors.key colors.primary}"
 *   "{talentloop primitive colors.talentloop color palette.primary.primary90}"
 *
 * We walk the token tree following the dot-separated path to find the value.
 */
function resolveReference(ref, tokens) {
  // Strip the curly braces
  const refPath = ref.replace(/^\{/, '').replace(/\}$/, '');
  const segments = refPath.split('.');

  let current = tokens;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      console.warn(`  ⚠  Could not resolve reference: ${ref}`);
      return null;
    }
  }

  // The resolved node should have a "value" property with a hex color
  if (current && current.value) {
    return current.value;
  }

  console.warn(`  ⚠  Resolved node has no value: ${ref}`);
  return null;
}

/**
 * Convert an 8-digit hex color (#rrggbbaa) to standard CSS.
 * If alpha is "ff" (fully opaque), return 6-digit hex.
 * Otherwise return rgba().
 */
function normalizeHexColor(hex) {
  if (!hex || typeof hex !== 'string') return hex;

  // Remove leading #
  const raw = hex.replace(/^#/, '');

  if (raw.length === 8) {
    const r = parseInt(raw.substring(0, 2), 16);
    const g = parseInt(raw.substring(2, 4), 16);
    const b = parseInt(raw.substring(4, 6), 16);
    const a = parseInt(raw.substring(6, 8), 16);

    if (a === 255) {
      return `#${raw.substring(0, 6)}`;
    }
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
  }

  return `#${raw}`;
}

/**
 * Add a unit suffix to a dimension value if it doesn't already have one.
 */
function formatDimensionValue(value, property) {
  if (typeof value === 'number') {
    if (value === 0) return '0';
    // Font-weight is unitless
    if (property === 'fontWeight') return `${value}`;
    return `${value}px`;
  }
  return `${value}`;
}


// ─── Main ───────────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════╗');
console.log('║   TalentLoop Design Token → CSS Converter       ║');
console.log('╚══════════════════════════════════════════════════╝\n');

// 1. Read the JSON
console.log(`📂 Reading tokens from: ${INPUT_FILE}`);
const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
const tokens = JSON.parse(raw);

const cssLines = [];

// Utility to push a section comment
function section(title) {
  cssLines.push('');
  cssLines.push(`  /* ── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))} */`);
}


// ═══════════════════════════════════════════════════════════════════════════
// 2. COLOR ROLES  (only roles — not primitives)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🎨 Processing Color Roles...');

const colorRolesRoot = tokens['talentloop color roles'];
if (!colorRolesRoot) {
  console.error('❌ "talentloop color roles" section not found in tokens!');
  process.exit(1);
}

// The structure is: "talentloop color roles" > "talentloop color roles" > category > role
const colorRolesData = colorRolesRoot['talentloop color roles'];
let colorCount = 0;

cssLines.push(':root {');
cssLines.push('');
cssLines.push('  /* ════════════════════════════════════════════════════════════════ */');
cssLines.push('  /* COLOR ROLES                                                     */');
cssLines.push('  /* These are the semantic color tokens for UI usage.               */');
cssLines.push('  /* Primitive palette values are resolved to their final hex values. */');
cssLines.push('  /* ════════════════════════════════════════════════════════════════ */');

for (const [categoryName, roles] of Object.entries(colorRolesData)) {
  section(`${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`);

  for (const [roleName, roleToken] of Object.entries(roles)) {
    if (roleToken.type !== 'color') continue;

    const varName = `--tl-color-${toKebabCase(categoryName)}-${toKebabCase(roleName)}`;
    let resolvedValue;

    // Check if value is a reference (starts with "{")
    if (typeof roleToken.value === 'string' && roleToken.value.startsWith('{')) {
      resolvedValue = resolveReference(roleToken.value, tokens);
      if (!resolvedValue) {
        console.warn(`  ⚠  Skipping unresolved role: ${roleName}`);
        continue;
      }
    } else {
      resolvedValue = roleToken.value;
    }

    const cssValue = normalizeHexColor(resolvedValue);
    // Remove duplicate prefix if role name already contains category
    // e.g. --tl-color-primary-primary → --tl-color-primary
    const cleanVarName = varName.replace(
      new RegExp(`--tl-color-${toKebabCase(categoryName)}-${toKebabCase(categoryName)}$`),
      `--tl-color-${toKebabCase(categoryName)}`
    );

    cssLines.push(`  ${cleanVarName}: ${cssValue};`);
    colorCount++;
  }
}

console.log(`  ✅ ${colorCount} color role variables generated`);


// ═══════════════════════════════════════════════════════════════════════════
// 3. TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🔤 Processing Typography...');

const typography = tokens['typography'];
if (!typography) {
  console.error('❌ "typography" section not found in tokens!');
  process.exit(1);
}

cssLines.push('');
cssLines.push('  /* ════════════════════════════════════════════════════════════════ */');
cssLines.push('  /* TYPOGRAPHY                                                      */');
cssLines.push('  /* Type scale tokens: display, headline, title, body, label        */');
cssLines.push('  /* ════════════════════════════════════════════════════════════════ */');

// Map of JSON property → CSS property suffix
const typographyPropertyMap = {
  fontSize:    'font-size',
  fontFamily:  'font-family',
  fontWeight:  'font-weight',
  fontStyle:   'font-style',
  lineHeight:  'line-height',
  letterSpacing: 'letter-spacing',
  textDecoration: 'text-decoration',
  textCase:    'text-transform',
};

let typoCount = 0;

for (const [categoryName, styles] of Object.entries(typography)) {
  section(`${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`);

  for (const [styleName, properties] of Object.entries(styles)) {
    const prefix = `--tl-font-${toKebabCase(styleName)}`;

    for (const [propName, propData] of Object.entries(properties)) {
      const cssSuffix = typographyPropertyMap[propName];
      if (!cssSuffix) continue; // skip paragraphIndent, paragraphSpacing, fontStretch, etc.

      let value;
      // Handle both the flat format (typography section) with {type, value}
      // and the nested Figma format (font section) with value objects
      if (propData && typeof propData === 'object' && 'value' in propData) {
        value = propData.value;
      } else {
        value = propData;
      }

      // Format the value appropriately
      if (propData.type === 'dimension' || typeof value === 'number') {
        value = formatDimensionValue(value, propName);
      }

      // Wrap font-family in quotes if it's a string name
      if (propName === 'fontFamily' && typeof value === 'string') {
        value = `'${value}', sans-serif`;
      }

      // Skip "none" text-transform values (textCase: "none" means no transform)
      if (propName === 'textCase' && value === 'none') continue;
      // Skip "none" text-decoration
      if (propName === 'textDecoration' && value === 'none') continue;

      cssLines.push(`  ${prefix}-${cssSuffix}: ${value};`);
      typoCount++;
    }
  }
}

console.log(`  ✅ ${typoCount} typography variables generated`);

// ═══════════════════════════════════════════════════════════════════════════
// 4. SYSTEM TOKENS (spacing, radius, shadows, transitions, z-index, icons, breakpoints)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n📐 Adding System Tokens...');

cssLines.push('');
cssLines.push('  /* ════════════════════════════════════════════════════════════════ */');
cssLines.push('  /* SYSTEM TOKENS                                                   */');
cssLines.push('  /* Spacing, radius, shadows, transitions, z-index, icons, breakpoints */');
cssLines.push('  /* ════════════════════════════════════════════════════════════════ */');

// Spacing
cssLines.push('');
cssLines.push('  /* ── Spacing ──────────────────────────────────────── */');
const spacing = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
const spacingPx = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
spacing.forEach((s, i) => {
  cssLines.push(`  --tl-space-${s}: ${spacingPx[i]}px;`);
});

// Border & Radius
cssLines.push('');
cssLines.push('  /* ── Border & Radius ───────────────────────────────── */');
cssLines.push('  --tl-radius-sm: 4px;');
cssLines.push('  --tl-radius-md: 8px;');
cssLines.push('  --tl-radius-lg: 12px;');
cssLines.push('  --tl-radius-xl: 16px;');
cssLines.push('  --tl-radius-2xl: 24px;');
cssLines.push('  --tl-radius-full: 9999px;');
cssLines.push('  --tl-border-width: 1px;');
cssLines.push('  --tl-border-width-thick: 2px;');

// Shadows
cssLines.push('');
cssLines.push('  /* ── Shadows ───────────────────────────────────────── */');
cssLines.push('  --tl-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);');
cssLines.push('  --tl-shadow-md: 0 4px 6px rgba(0,0,0,0.1);');
cssLines.push('  --tl-shadow-lg: 0 10px 15px rgba(0,0,0,0.1);');
cssLines.push('  --tl-shadow-focus: 0 0 0 3px rgba(37,99,235,0.3);');

// Transitions
cssLines.push('');
cssLines.push('  /* ── Transitions ───────────────────────────────────── */');
cssLines.push('  --tl-transition-fast: 100ms ease;');
cssLines.push('  --tl-transition-base: 200ms ease;');
cssLines.push('  --tl-transition-slow: 350ms ease;');

// Z-Index
cssLines.push('');
cssLines.push('  /* ── Z-Index ───────────────────────────────────────── */');
cssLines.push('  --tl-z-base: 0;');
cssLines.push('  --tl-z-above: 10;');
cssLines.push('  --tl-z-dropdown: 100;');
cssLines.push('  --tl-z-modal: 200;');
cssLines.push('  --tl-z-toast: 300;');
cssLines.push('  --tl-z-overlay: 400;');

// Icons
cssLines.push('');
cssLines.push('  /* ── Icons ─────────────────────────────────────────── */');
cssLines.push('  --tl-icon-sm: 16px;');
cssLines.push('  --tl-icon-md: 20px;');
cssLines.push('  --tl-icon-lg: 24px;');

// Breakpoints
cssLines.push('');
cssLines.push('  /* ── Breakpoints ───────────────────────────────────── */');
cssLines.push('  --tl-bp-sm: 375px;');
cssLines.push('  --tl-bp-md: 768px;');
cssLines.push('  --tl-bp-lg: 1024px;');
cssLines.push('  --tl-bp-xl: 1280px;');

// Close :root
cssLines.push('');
cssLines.push('}');


// ═══════════════════════════════════════════════════════════════════════════
// 4. Write output
// ═══════════════════════════════════════════════════════════════════════════

const header = [
  '/* ═══════════════════════════════════════════════════════════════════════════ */',
  '/*  TalentLoop Design System — CSS Custom Properties                         */',
  '/*  Auto-generated from design-tokens.json                                   */',
  `/*  Generated: ${new Date().toISOString().split('T')[0]}                                                  */`,
  '/*                                                                           */',
  '/*  COLOR ROLES: Semantic color tokens for UI usage (--tl-color-*).          */',
  '/*    - Primitives are resolved; only roles are exposed as variables.        */',
  '/*                                                                           */',
  '/*  TYPOGRAPHY: Full type scale (display → label, large → small) --tl-font-*. */',
  '/*    - Includes font-size, font-family, font-weight, line-height,           */',
  '/*      letter-spacing for each type style.                                  */',
  '/*                                                                           */',
  '/*  SYSTEM TOKENS: Spacing, radius, shadows, transitions, z-index, icons,    */',
  '/*    breakpoints (--tl-space-*, --tl-radius-*, --tl-shadow-*, etc.).        */',
  '/* ═══════════════════════════════════════════════════════════════════════════ */',
  '',
];

const output = header.join('\n') + '\n' + cssLines.join('\n') + '\n';

fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

const systemCount = 40; // spacing(12) + radius(7) + border(2) + shadow(4) + transition(3) + z(6) + icon(3) + breakpoint(4)
console.log(`\n📝 CSS file written to: ${OUTPUT_FILE}`);
console.log(`   Total variables: ${colorCount + typoCount + systemCount} (${colorCount} color + ${typoCount} typography + ${systemCount} system)`);
console.log('\n✨ Done!\n');
