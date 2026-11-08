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

## 2026-11-07 — Title wordmark preview
- The home title was redrawn as one heavy white graffiti piece for HIP HOP UNDERGROUND: thick overlapping letters, a solid black offset, and a single thin gold edge around the combined shape. The O in HOP has a woofer in its counter: black surround, white cone, black ring, white dust cap. Buttons, credits, HUD, and instructions keep the self-hosted faces.
- Stormy Sol's current `fighters/stormy.glb` was checked in game. It is already a textured body on the shared rig. Idle, punches, kicks, a knockdown, the get-up, and her Mic Drop all play, and her feet plant. No new Meshy export is required for her to fight. The Meshy account and billing were not touched.

## 2026-11-03 — Home screen type
- The title, menu, credits, HUD, and instructions now use two self-hosted OFL faces: Lilita One for the logo and callouts, Bebas Neue for buttons and the timer, Outfit for body text. Files live in fonts/ with font-display:swap and preload, so GitHub Pages and iOS Safari do not flash a fallback.
- UNDERGROUND was sharing the instructions-arrow class, which forced that line to a zero-height box and painted the word on top of the subtitle and the buttons. It is its own line now, with a gap above the subtitle on desktop and phone.
- Keyboard hints on STORY and VERSUS sit under the label instead of running into the word.

## 2026-11-03 — Controls
- Holding away walks backward and still guards. Crouch plus away stays planted in a low guard. Checked for both players, both facing directions, the touch buttons, and a gamepad stick.
- Instructions are keycaps in Movement, Attacks, Specials, and Gauge, plus a Phone tab with a labeled button diagram and a Moves tab. The first match shows a short hint with Got it.

## 2026-11-03 — Current-gen fighting
- Six-button feel on the existing buttons: light/heavy punch, light/heavy kick, both punches or both kicks for the mediums. Hold away to stand guard, down+away to crouch guard. Lows beat a standing guard. Overheads beat a crouch guard. Double-tap forward dashes. Close light kick throws; both throwing techs.
- Each fighter has three motion specials (quarter-circle forward shot, forward-down-forward anti-air, quarter-circle back rush), an amp version for one stage bar, and a Showstopper install for two. Three bars spends the Mic Drop: a short cinematic with the themed shot, the fight suspended, then a clean exit back to the round.
- Groove gauge: Brace parries, a dash while holding Brace is a rush, Brace+away during guard is a reversal. Empty gauge is Redline until it refills. Phone buttons: BRACE, ASSIST, SHOT, RISE, RUSH. The CPU uses the same specials, guards, and anti-airs, scaled by difficulty.
- Hits spark ink by strength, heavies shake the camera, a counter-hit during startup calls CLEAN HIT. The HUD shows three stage bars and the groove gauge.

## 2026-11-01 — Mic Drop cinematic exit, higher backflip
- A Mic Drop scene now ends in one place: the suspend lock, the close-up camera, the letterbox, the cut-in, the mode title, and the zoom all clear together. A new Mic Drop, a KO, or the next round clears whatever the previous scene left behind. If hit-stop holds the lock open, a sim-frame timeout closes it anyway. Both clients share that path.
- The win backflip is longer and higher, with a smoother rotation and a knee-bend on the way down. It still lands with the soles on the floor, facing the camera.
- Floor contact is taken from the foot mesh, so a low hand or a stray vertex does not lift or sink the shoes.

## 2026-11-01 — Soles on the floor, knockdowns, get-ups, crisp movement, victory flip
- Feet are planted from the skinned-mesh sole, not the ankle joint, so shoes sit on the floor instead of cutting through it.
- Landed knockdowns and KOs play the lie-down and the mesh bottom is held on the floor. The extra tumble spin is cleared on first contact.
- Get-ups are a short blend up to idle. Kip and spring styles add a small hop. No extra spin.
- Attack blends and startup/recovery are shorter so movement reads crisper.
- The win celebration turns to the camera and does one backflip around the hips on a real-time clock, so KO slow-mo cannot freeze it in the air. The body tucks, stays on a single axis, clears the floor, and lands in the Taunt pose facing the camera with both feet planted.
- Mic Drop impacts add a charge, a white core, and a ground shockwave. Scenes stay short.

## 2026-11-01 — Floor contact, clean get-ups, Mic Drop supers
- Knockdowns no longer ride a spin that lifts the body off the floor. Once they land, roll snaps back and the hip/spine is pulled onto the ground.
- Get-ups no longer spin two full turns around a point in the air. Kip, spring, and break get-ups keep a small lean and hop, then face the opponent.
- Grounded feet are snapped to the floor every frame (idle, walk, attacks, hit reactions), with a contact shadow. Idle feet were about 14–18 cm up; after the snap they sit about 1 cm up.
- Each fighter's Mic Drop special fires a themed projectile, beam, or burst (skateboard, arrow rain, gold bars, ice, bass orb, night bus, and the rest), with a flash, camera shake, and an impact burst. The round still freezes and only that special's damage lands.

## 2026-10-31 — Mic Drop scenes and HUD combo
- While a Mic Drop intro or special is playing, the round freezes: no attacks, no other damage, both fighters locked, timer paused. The special still lands its one hit at the impact frame. Same path in online lockstep.
- Those scenes are about 40% shorter (intro 1.20s → 0.67s, cut-in 1.25s → 0.70s, prop entrance 0.60s → 0.34s, specials about 0.60–0.75s → 0.37–0.45s, powered state 8.0s → 4.7s). The prop and the hit still read.
- The combo count is a gold HUD pill under each health bar (8 HITS), same type and colors as the timer, instead of the graffiti canvas.

## 2026-10-31 — Planted fighters, readable hits, longer rounds, online pairing
- Idle no longer plays the Punch Enter step. Fighters loop a still Idle and their hip bone is pinned sideways so the roster does not skate. Capoeira and brawler stances rock less, and the title camera barely drifts.
- Each hit gets a longer hit-stop, a visible flinch (including jabs), and a short beat before the next hit in a string. Styles and roundhouses are unchanged.
- Health is 2.4×. Normal strikes hit for 0.75× damage, so a round versus CPU Normal lasts several times longer. Mic Drop and throws are scaled up with the larger bar so they still matter.
- Online rooms retry the handshake, keep saying hello until the other player is actually there, ignore a brief presence drop, resend lock-in and the match start, and show Waiting / Connected / error with RETRY.

## 2026-10-25 — CPU difficulty
- Title screen settings include CPU: POTATO, EASY, NORMAL, HARD, BEAST. Tap to cycle. Saved in localStorage (`hhuCpuDiff`). Default NORMAL.
- Versus and Story use the same CPU. Potato is slow, whiffs, and rarely blocks. Beast reacts faster, blocks and counters more, stays in range, anti-airs, and spends Mic Drop. Story bosses still multiply that choice (their old cpuLevel). Online fights ignore it.

## 2026-10-25 — Phone title screen
- The start screen no longer prints the how-to / controls wall in the title panel. That text was pushing Story, Versus, and Online off a phone.
- INSTRUCTIONS is its own menu button. It opens the full guide (the old how-to plus the controls table) in the scrollable overlay, with BACK and tap-outside to close.
- Play actions (STORY / VERSUS / ONLINE) sit in one row. Opponent, Quality, Sound, and Instructions sit in a second group. Credits stay on the screen, collapsed, under the buttons.

## 2026-10-25 — Online shared-link versus (web)
- ONLINE button on main menu: Create room (6-char code + copy link) / Join room
- Supabase Realtime default (Powerline project); optional WS relay via __HHU_ONLINE.wsUrl
- 3-frame input-delay lockstep; host soft state sync
- See hhu3d/addon/ONLINE.md and /workspace/hhu_online_relay/
