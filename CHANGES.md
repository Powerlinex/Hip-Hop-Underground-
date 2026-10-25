## 2026-10-14 (evening): native Meshy proportions (no more conform-to-UAL)
- All 15 Meshy fighters rebuilt from their Meshy-rigged GLBs with the mesh UNDEFORMED and Meshy's own skin weights.
- The skeleton keeps UAL bone names and UAL rest orientations but its joints sit at Meshy's joint positions, so the shared UAL
  animation clips retarget 1:1 (local rotations); each fighter is scaled uniformly so its hips sit at UAL hip height (feet stay planted).
- Face-sharpened textures and Bellamy's back crest kept. game.json scales made uniform (no more non-uniform width/height stretch).
- Web: per-bone translation tracks are ignored except DEF-hips (so clips no longer pull joints back to UAL proportions). Spin fix untouched.

# CHANGES (Oct 13, 2026)
## Bug 1: heads and bodies spinning or twisting at random (web). ROOT CAUSE FOUND AND FIXED
- Cause: every frame after the animation mixer runs, the web build adds small procedural rotations to bones: breathing (spine.003),
  shoulder sway, hip weight shift, the head look-at toward the opponent, and the hit-flinch spring. It does this with in-place
  `bone.quaternion.multiply(...)`, which assumes the mixer resets those bones every frame. three.js's AnimationMixer only writes a bone
  when its sampled value CHANGES (PropertyMixer skips setValue when the new value equals the last applied one). So on held, clamped or constant
  frames (end of a clip, hitstop, grabs and holds, knockdowns, constant tracks), the bone is not reset. The additive offsets then
  pile up frame after frame, so the head can turn 180 degrees and the torso and hips twist "randomly". v4's yaw fix didn't touch this.
  It affected ALL 16 fighters, old and new models alike.
- Fix (index.html, also index3d.html): the bone post-process now wraps a guard. For every bone it remembers the clean animated
  pose ("base") and what it wrote last frame ("post"). If the mixer didn't overwrite the bone (value == post), it restores base before
  re-applying the offsets. So the offsets are always relative to the clean pose and never build up.
- Measured in headless Chrome over 90 frames of grabs, holds and constant poses for all 16 fighters: head turn from start was up to 180 degrees
  (mean 93) before and up to 43 (mean 28) after, which is the intended look and flinch. In the lineup with a clamped
  pose, spine drift was up to 16.5 degrees and still growing before; after, it stays at the intended about 3 degrees of breathing.
- Godot: checked with tools/drift_test.gd. Godot's SkeletonModifier3D results are thrown away every frame, so the flinch layer
  can't build up (2.2 degrees max over 600 frames, the intended sway). No code change was needed. The test tool was added for regressions.
- Also added debug hook __hhu3d.T() (demo and lineup fighter list) for automated tests.

## Bug 2: holes and missing parts on the new Psalm and Dutch models. FELL BACK TO THE ORIGINAL MODELS
- Cause: TRELLIS made the arms fused to the torso sides and the hands fused to the thighs. To raise the arms into the T-pose bind,
  I deleted the stretched faces (about 1,400 to 1,800 per model). That opened holes in the torso sides and back, because the scan never had
  a separate torso surface under the arms.
- Tried: (a) binding in the original arms-down pose (no T-pose bake), (b) removing bridge faces and recalculating normals, (c) capping each side
  separately, (d) removing shards, (e) double-sided materials, (f) a hard arm/body weight split. The result had no holes, and the front looks good,
  but the back and sides (what the fight camera mostly sees) show crumpled, faceted patches in guard, kick and throw poses. That isn't clean.
- So both Psalm and Dutch use their original models again in the web build and Godot (byte-identical to the previous psalm_old/dutch_old).
  The best rebuild is in extras_not_deployed/ for reference.
- Kept: the texture-aware material (texture used when a model has one, plus the material's side setting) in web and Godot. Harmless for the original models.

## Rebuilt
- Godot project zip, Mac universal export, Godot web export (/workspace/hhu_godot_web_build.zip, not in the bundle), hhu3d.zip.
- Godot tests passed: CPU vs CPU Psalm vs Dutch (K.O.) and story chapter (won, Bella unlocked).

## 2026-10-13 — Meshy Psalm
- psalm.glb is now the Meshy Pro model, re-skinned to the UAL rig (Mixamo→UAL weight transfer, conform to UAL joints, displacement smoothing). It's used in both the web build and Godot; all UAL clips work unchanged and the spin fix is kept.
- Meshy's GLB had NO texture, so colors are per-region vertex colors (psalm_palette.json). Re-run convert_meshy.py with --texture once a textured export is available.
- The old Psalm is kept as extras_not_deployed/psalm_ual_original_fallback.glb.
- Pipeline for the other fighters: extras_not_deployed/convert_meshy.py (copy kept at /workspace/hhu_meshy/convert_meshy.py).


## Oct 14: textured Meshy fighters
- psalm, dutch, north, boss, jet replaced with Meshy Pro models (textured, ~31K tris, re-skinned onto the UAL rig) in web (fighters/*.glb) and Godot builds. index.html unchanged (spin fix intact).
- macOS zip is now 5 parts (119 MB total).
- duchess also replaced with textured Meshy model. macOS zip now 6 parts.

## Oct 14 (evening): 15 textured Meshy fighters + face pass
- psalm, dutch, north, boss, jet, duchess, smoove, lenox, cold, kid, tempo, kingston, sterling, bella, gator: textured Meshy models on the UAL rig (Cold and Bella turned to face forward).
- Face pass: sharpened face texture regions on all 15; Kingston's face brightened.
- Boss Bellamy: original gold crown-over-skyline crest embroidered on the coat back.
- Godot: subtle face key light per fighter (fighter.gd).
- Stormy unchanged (still the old model). macOS zip is now 7 parts.

## Oct 14 (night): full-volume fighters + power-up overhaul
- Diagnosis: fighters looked flat because the conform-to-UAL step squeezed front-to-back depth (torso depth/width ~0.30-0.55 vs Meshy source and a realistic ~0.6). Lighting was also flat (weak key light, no rim).
- Fix: restore_depth.py re-inflates depth per bone region toward the Meshy source proportions (torso capped near ~0.55-0.7 depth/width, head/arms limited), skinning untouched. All 15 Meshy fighters.
- Lighting: Godot key light 0.55->0.95 warm + new cool back rim light; web adds a rim + warm fill directional light.
- Power-up modes: new themed activation (shockwave rings, light pillar, screen flash, themed particle burst: rising light/embers, falling snow/coins, neon streaks, swirling fireflies/kaleidoscope, popping sparks, bass/beat pulse rings) and a persistent themed aura + pulsing ground ring while active. Godot: scripts/mode_fx.gd (longer camera push-in). Web: addon script hooked into the mode system (index.html, spin fix untouched).

## Mode props, Bellamy gold, Stormy native, sketch select cards (Oct 14, 2026)
- Every fighter's power-up mode now has its own themed prop (web: hhu3d/addon/mode_props.js; Godot: scripts/mode_props.gd).
- Boss Bellamy's GOLD STANDARD reads as rich gold instead of white wash-out (web shader/lights; Godot tint + lower light).
- Stormy Sol now uses her native Meshy body (uniform scale 1.04).
- Select screen cards/portraits now use each fighter's character reference art.
- Fixes: GOLD STANDARD/mode title no longer lingers across quick rematches; MASH TO BREAK uses a drawn bar instead of missing glyph boxes.

## Underground venue, 16 unique grabs, winner backflip (Oct 14, 2026)
- Arena rebuilt as an underground venue: concrete floor, brick walls, pillars, steel beams, haze shafts, barriers, warm back glow; rain/fence/billboards removed.
- Animated instanced crowd (4 draw calls) bobs to the beat and cheers on big hits, KOs and power-ups (web: hhu3d/addon/venue.js; Godot: scripts/venue.gd).
- Every fighter has a unique grab follow-up (throw/slam/combo) with victim thrown/landing/getting-up reactions.
- Round/match winner performs a backflip, lands and holds a pose (replaces the dance).

## Crowd tone-down + backflip camera (Oct 15, 2026)
- Crowd is now dim, mostly dark silhouettes with a warm rim light and only occasional muted colour (web + Godot).
- KO camera pulls back and rises during the winner backflip so the full flip stays in frame (web + Godot).

## Cinematic overhaul + fluid animation + 4K display (Oct 15–18, 2026)
- Cinematic layer (web cine.js / Godot cine.gd): filmic grade, vignette, film grain, chromatic aberration on big hits, KO desaturation + letterbox, match-intro name cards (VS), super cut-in banner, per-fighter colour rim lights.
- Fluid animation: fixed 60 Hz sim with interpolated rendering, tuned per-state cross-fades with ease curves, anticipation/follow-through on attacks, eased lunges, hit push/reaction speed by hit strength and direction, walk speed matched to stride (less foot sliding), smoother turnarounds.
- Display quality LOW / HIGH / ULTRA (web QUALITY button + ?gfx=, Godot Settings > DISPLAY): smart DPR caps up to 4K, adaptive resolution to hold 60 fps, MSAA, sharpening, anisotropic filtering, 1024/2048/4096 shadow maps. Godot Mac defaults: MSAA 4x, 16x aniso, 4096 shadows, 1920x1080 hi-DPI window.
- Smoother crowd geometry.

## 2026-10-23: v6 — announcer timing, crowd faces, roundhouse kicks + fighting styles, smoother poses (web + Godot)
- Announcer: lines now go through a queue that waits for the previous clip's real speech length, so a name is never cut by the next call (the old code stopped the previous clip, which clipped 'win' after 1.1s and 'fight' over 'round 1'). Calls start after the intro card lands; KO/round/win calls are timed to the events. Full fighter names for both players.
- Crowd: every fan has a face (eyes, pupils, mouth that opens on hits/cheers, hair, hats/crowns, shades) in both builds, instanced for performance.
- Fighting: 5 new moves (roundhouse high/mid, tornado spin kick, axe kick [overhead, bypasses block], shoulder tackle) with startup/active/recovery/damage/hitbox. Five styles (boxing, kickboxing, capoeira, wrestling, street brawler) map directional/crouch inputs to different moves and add two string combos each; CPU fighters use them. A procedural pose layer (wind-up -> strike blend, spin, stance sway) is blended over the shared animation clips for smoother motion.
- Shared spec: hhu_v6/combat_data.py -> game.json (Godot) and combat6.js (web).
# v7 — Mic Drop, showman get-ups, graffiti combo, foot-to-floor (web + Godot)

## Features
- **Mic Drop**: power-mode UI renamed everywhere (HUD, banner, touch, controls, trial banner). Per-fighter mode names (SERMON MODE, RED LINE, …) kept as subtitles.
- **Showman get-ups**: theatrical rise per style (dust/kip/spring/break/flex/shrug) with same-or-longer timing and partial i-frames (invuln window then punishable flourish).
- **Graffiti combo counter**: sprayed “N HITS” canvas with color ramp + splat on break (replaces plain “N HIT COMBO!”).
- **Controls screen**: updated table matching current inputs + Mic Drop (web overlay + Godot CONTROLS menu).
- **Foot-to-floor**: per-fighter `ground` offsets; Jet Mic Drop board rests on floor (y≈.093) with ollie, not floating.

## Builds
- Web: `hhu3d/addon/v7.js` + `patch_index_props.py` v7 section; Jet board in `mode_props.js`.
- Godot: `fighter.gd` RISE/ground, `graffiti.gd`, `controls_text.gd`, HUD/touch/README already on tree.
