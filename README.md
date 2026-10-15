# Hip Hop Underground push bundle (Oct 13, 2026, 10:20 PM ET): spin fix and model fallback
Target repo: Powerlinex/Hip-Hop-Underground- (main). Every file is under 24 MB. See CHANGES.md.

## Web build: goes to the REPO ROOT (live GitHub Pages)
| local | repo path |
|---|---|
| web_root/index.html | index.html (replace) |
| web_root/fighters/psalm.glb | fighters/psalm.glb (replace; the original model is back) |
| web_root/fighters/dutch.glb | fighters/dutch.glb (replace; the original model is back) |
If the previous bundle was pushed, you can delete fighters/psalm_old.glb and fighters/dutch_old.glb (no longer used).

## downloads/: goes to repo downloads/
| parts | rebuilt file (bytes, sha256) | repo path |
|---|---|---|
| HipHopUnderground_Godot_Project.zip.part01..02 | HipHopUnderground_Godot_Project.zip (39,146,548, 08f8b711b812b1ef8efa84954a4f3fb965bb0cf1475ea344eb1e8650879f7355) | downloads/HipHopUnderground_Godot_Project.zip (rejoin first) |
| HipHopUnderground_macOS_universal.zip.part01..07 | HipHopUnderground_macOS_universal.zip (166,493,058, 5dfbbb1fe8e8703c2b93c96bac6c8e2482708804782d5baaee88bb5b2029e783) | Rejoined it's over GitHub's 100 MB file limit: commit the 7 parts, not the rejoined zip. |
| hhu3d.zip.part01..02 | hhu3d.zip (26,720,006, 3b9d83ce786e67fdf831a324bac043aad3339f14e43739b009b3603b12038bed) | downloads/hhu3d.zip.partNN (commit parts) |

Rejoin: `cat NAME.zip.part0* > NAME.zip && shasum -a 256 NAME.zip`

## extras_not_deployed/
psalm_trellis_v2.glb and dutch_trellis_v2.glb are the best rebuild of the new models (no holes, but messy from the back and sides). They're kept for reference only. Don't put them in fighters/.

### Update 2026-10-13 (Meshy Psalm)
web_root/index.html and web_root/fighters/psalm.glb go to the repo root. Every file in downloads/ goes to downloads/. Reassemble with `cat X.zip.part* > X.zip` and check against SHA256SUMS.txt.
Note: up/ is an older staging folder that wasn't regenerated in this update. It's stale, so ignore it.
