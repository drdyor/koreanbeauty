/**
 * Manifest v2 Validator
 * Run with: node validate-manifest.js
 */

const fs = require('fs');

// Controlled vocabulary
const VALID_GUIDANCE_STYLES = new Set([
  'focus_priming',
  'task_commitment',
  'attention_narrowing',
  'memory_cueing',
  'open_loop_creativity',
  'somatic_downshift',
  'breath_guidance',
  'body_scan',
  'sleep_descent',
  'emotional_labeling',
  'compassion_reframe'
]);

const VALID_TONES = new Set([
  'neutral',
  'calm',
  'warm',
  'directive',
  'minimal',
  'playful'
]);

const VALID_EYES = new Set(['open', 'closed', 'either']);
const VALID_CATEGORIES = new Set(['eyes_open', 'eyes_closed', 'somatic']);
const VALID_SLOTS = new Set(['pre_task', 'continuous']);

function validateManifest() {
  console.log('🔍 Validating primer-manifest.json...\n');

  const manifest = JSON.parse(fs.readFileSync('primer-manifest.json', 'utf8'));
  const errors = [];
  const warnings = [];

  // Check version
  if (manifest.version !== 2) {
    errors.push(`❌ Version must be 2, found: ${manifest.version}`);
  }

  // Validate modes
  manifest.modes.forEach(mode => {
    if (!VALID_CATEGORIES.has(mode.category)) {
      errors.push(`❌ Mode "${mode.mode_id}": Invalid category "${mode.category}"`);
    }

    if (!VALID_SLOTS.has(mode.primer_policy.primer_slot)) {
      errors.push(`❌ Mode "${mode.mode_id}": Invalid primer_slot "${mode.primer_policy.primer_slot}"`);
    }

    // Eyes-open modes shouldn't require stillness
    if (mode.category === 'eyes_open' && mode.primer_policy.allow_continuous_guidance) {
      warnings.push(`⚠️  Mode "${mode.mode_id}": Eyes-open mode with continuous guidance (unusual)`);
    }
  });

  // Validate primers
  manifest.primers.forEach(primer => {
    // Check guidance_style vocabulary
    primer.tags.guidance_style.forEach(style => {
      if (!VALID_GUIDANCE_STYLES.has(style)) {
        errors.push(`❌ Primer "${primer.primer_id}": Invalid guidance_style "${style}"`);
      }
    });

    // Check tone vocabulary
    primer.tags.tone.forEach(tone => {
      if (!VALID_TONES.has(tone)) {
        errors.push(`❌ Primer "${primer.primer_id}": Invalid tone "${tone}"`);
      }
    });

    // Check eyes state
    if (!VALID_EYES.has(primer.behavior.eyes)) {
      errors.push(`❌ Primer "${primer.primer_id}": Invalid eyes state "${primer.behavior.eyes}"`);
    }

    // Check slot validity
    if (!VALID_SLOTS.has(primer.slot)) {
      errors.push(`❌ Primer "${primer.primer_id}": Invalid slot "${primer.slot}"`);
    }

    // Validation: continuous primers must have voice_continues: true
    if (primer.slot === 'continuous' && !primer.behavior.voice_continues) {
      errors.push(`❌ Primer "${primer.primer_id}": Continuous slot requires voice_continues: true`);
    }

    // Validation: pre_task primers should be reasonable duration
    if (primer.slot === 'pre_task' && primer.audio.duration_sec > 120) {
      warnings.push(`⚠️  Primer "${primer.primer_id}": Pre-task primer > 2 min (${primer.audio.duration_sec}s)`);
    }

    // Check that mode_id exists
    const modeExists = manifest.modes.some(m => m.mode_id === primer.mode_id);
    if (!modeExists) {
      errors.push(`❌ Primer "${primer.primer_id}": References non-existent mode "${primer.mode_id}"`);
    }

    // Eyes-open primers with requires_stillness
    if (primer.behavior.eyes === 'open' && primer.behavior.requires_stillness) {
      warnings.push(`⚠️  Primer "${primer.primer_id}": Eyes-open + requires_stillness (unusual)`);
    }
  });

  // Check pool coverage
  manifest.modes.forEach(mode => {
    const poolPrimers = manifest.primers.filter(p => 
      mode.selection.pool_ids.includes(p.pool_id)
    );
    if (poolPrimers.length === 0) {
      warnings.push(`⚠️  Mode "${mode.mode_id}": No primers found in pools ${mode.selection.pool_ids.join(', ')}`);
    }
  });

  // Report results
  console.log('📊 Validation Results:\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Manifest is valid!\n');
    console.log(`   Modes: ${manifest.modes.length}`);
    console.log(`   Primers: ${manifest.primers.length}`);
    return true;
  }

  if (errors.length > 0) {
    console.log('ERRORS:\n');
    errors.forEach(e => console.log(e));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('WARNINGS:\n');
    warnings.forEach(w => console.log(w));
    console.log('');
  }

  return errors.length === 0;
}

// Run validation
const isValid = validateManifest();
process.exit(isValid ? 0 : 1);
