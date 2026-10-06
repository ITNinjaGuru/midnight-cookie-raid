# Midnight Cookie Raid

An original browser side-scrolling platformer. Sneak through a dark cookie factory at midnight, gobble cookies, sip fizzy drinks, burp the night-shift guards, and crack the vault.

**Inspired by classic 1990s browser factory-raid platformers (mechanics homage only; original art, audio, levels, and title).**

## Play locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. You can also open `index.html` directly in a modern browser.

## Deploy (Netlify)

Pure static site — no build step. Drag-and-drop this folder onto Netlify, or connect the repo (`netlify.toml` sets `publish = "."`).

## Controls

| Action | Keys |
|--------|------|
| Run left / right | ← → or A D (hold starts continuous run until you press the opposite) |
| Jump | ↑ or W |
| Burp | Space (uses 1 fizzy drink; knocks out all on-screen guards) |
| Pause | P or Esc |
| Mute | M |

On phones/tablets, on-screen buttons appear for move / jump / burp / start.

## Mechanics

- **Cookies** — +100 score and keep/restore your **fat** state (visual weight + one free hit).
- **Fizzy drinks** — burp ammo.
- **Fat / thin** — while fat, the first enemy hit makes you thin; a second hit (or a hit while thin) costs a life. Purple vats and mashers are always instant K.O.
- **Guards** — patrol; burp to KO everyone currently on screen.
- **Sleeping dogs** — wake when you get close; contact hurts like a guard.
- **Purple vats** — instant kill.
- **Mashers** — crushing blades; instant kill (trap timing).
- Completing a level grants **+1 life**. Reach **EXIT** to clear a level (cookies boost score).

## Levels

1. The Cookie Factory  
2. Storage  
3. Research  
4. Packing Floor  
5. Upper Catwalks  
6. Vat Room  
7. Masher Alley  
8. Cookie Vault  

## Tech

- Canvas 2D + `requestAnimationFrame`
- No external CDN dependencies
- Pixel-style graphics drawn in code (no sprite sheets / no Flash assets)
- Sound via Web Audio API oscillators/noise only

## Credits

Inspired by classic 1990s browser factory-raid platformers (mechanics homage only; original art, audio, levels, and title).
