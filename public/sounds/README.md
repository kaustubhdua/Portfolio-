# Using your own sound files

Out of the box every sound on the site is **synthesised in the browser** (Web Audio). No audio file
ships, so nothing from Minecraft or any other game is copied. That is deliberate: Mojang's sound
files are copyrighted and cannot be redistributed with a public portfolio.

If you own, or have a licence for, a set of sounds (a royalty-free pack, your own recordings, a
pack whose licence allows web use), you can play them instead of the synth:

1. Put the audio files in this folder (`.ogg`, `.mp3` or `.wav`; short clips, under ~200 KB each).
2. Copy `manifest.example.json` to `manifest.json` and point each sound name at your file(s).
3. Rebuild. A sound with no entry in `manifest.json` keeps using the synthesised version, so you can
   replace them one at a time.

Each entry can be a single file, a list (one is picked at random each time, which stops repeated
footsteps from sounding robotic), or an object:

```json
{
  "step_grass": { "files": ["grass1.ogg", "grass2.ogg", "grass3.ogg"], "volume": 0.8, "pitchVariance": 0.08 },
  "ui_click": "click.ogg"
}
```

`volume` is 0 to 2 (default 1). `pitchVariance` is 0 to 0.3 (default 0): how far each play is
randomly detuned.

## Sound names

- Footsteps, digging and placing, per material: `step_`, `dig_`, `place_` + `grass`, `dirt`, `stone`,
  `wood`, `sand`, `gravel`, `glass`, `netherbrick`, `netherrack`, `soulsand`
- Liquids: `lava_pop`, `water_splash`
- Villagers: `villager_farmer`, `villager_blacksmith`, `villager_librarian`, `villager_merchant`,
  `villager_guard`, `villager_cleric`, `villager_child`, plus `villager_hmm`, `villager_huh`, `villager_hrm`
- Creatures: `mob_cow`, `mob_sheep`, `mob_cat`, `mob_chicken`, `mob_pig`, `mob_ghast`, `mob_blaze`,
  `mob_piglin`, `mob_strider`, `mob_skeleton`, `mob_golem`, `mob_slime`
- Interface: `ui_click`, `ui_hover`, `inventory_open`, `inventory_close`, `chest_open`, `chest_close`,
  `xp_orb`, `level_up`, `advancement`
- Travel and world: `portal`, `portal_arrive`, `anvil_hit`, `village_bell`

Music and the ambient beds (wind, lava drone, birdsong) are generated live and are not replaceable
by this file.
