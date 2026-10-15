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
| HipHopUnderground_Godot_Project.zip.part01..02 | HipHopUnderground_Godot_Project.zip (39,000,699, a5e9c9337b4583a1fc9958a8b5a45e58358dde053787735a7a5fd2bafcab4320) | downloads/HipHopUnderground_Godot_Project.zip (rejoin first) |
| HipHopUnderground_macOS_universal.zip.part01..08 | HipHopUnderground_macOS_universal.zip (170,168,221, 93e4c17739784c026ec7fe8296c24396ac8e870b7fa3a5ee409dfaa495585470) | Rejoined it's over GitHub's 100 MB file limit: commit the 8 parts, not the rejoined zip. |
| hhu3d.zip.part01..02 | hhu3d.zip (27,674,164, 271257e3b9228dba650744fb9704ced0433d067433338dd10cb1d52373ae4cd9) | downloads/hhu3d.zip.partNN (commit parts) |

Rejoin: `cat NAME.zip.part0* > NAME.zip && shasum -a 256 NAME.zip`

## extras_not_deployed/
psalm_trellis_v2.glb and dutch_trellis_v2.glb are the best rebuild of the new models (no holes, but messy from the back and sides). They're kept for reference only. Don't put them in fighters/.

### Update 2026-10-13 (Meshy Psalm)
web_root/index.html and web_root/fighters/psalm.glb go to the repo root. Every file in downloads/ goes to downloads/. Reassemble with `cat X.zip.part* > X.zip` and check against SHA256SUMS.txt.
Note: up/ is an older staging folder that wasn't regenerated in this update. It's stale, so ignore it.
