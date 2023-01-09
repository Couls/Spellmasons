# Before next streamer outreach
    - test new spells in multiplayer
    - test perk list on small resoution
    - test new toolbar on small resolution
    - test multiplayer

# Desired Schedule
- January 1/8-1/14
    - Implement onColllision for arrow spells
        - Implement Ghost arrow
        - Support prediction
        - note: I should be able to calculates the results ahead of time
            - Find flight path until it hits a wall
            - detect ALL units that that line (the flight path goes through)
            - order them by distance
            - if the arrow pierces do what ghost_archer does to simulate
            - if not, change the end destination to the first unit
    - Offset floating text for perks when they proc
    ---
    - integrate Che new end turn btn
    - Improve difficulty scaling with over 4 players
    - BALANCE unit spawns especially on later levels
        - Maybe not exponential budget?
    - fix opening book animation playing when you don't have to wait to cast, allow it to exit early
    - Test on different resolutions
    - Menu: Fix overflow for all pages rather than the one-off fixes I've been doing.
    - **Email streamers**, try to set up a multiplayer stream on release day
    - Reach out to translators
    - Balanced / Difficult
    - Content: Add Copy Soul vs capture soul.  Capture soul should let you spawn them for no mana cost but they need to be below 25% health to be captured.  Copy Soul gives you the summon card.
    - Solve many enemies overkilling allied unit
    - Add refunds to as many spells as possible if they have no effect
    - Multiplayer
        - LAN hosting: Support hosting a server from in the game exe
        - Server Browser
        - Multiplayer save load with "take over player"
        - Notify when version isn't same
- January 1/15-1/21
    - small stuff
        - fix being able to go negative mana if you queue a spell before the previous spell's mana is spent
        - rename vampire or restore that it passes blood curse on to you when it bites
        - multiplayer perk resurrect icon
    - Balanced / Difficult
    - Finish Boss
        - Implement aoe damage against enemies chain+hurt?
    - A way to see your perks roll
        - Animated Perk List UI
            - Are perk chances synced correctly in multiplayer?
    - Submit to IGN and others
    - Add ability to put user-facing text banners in game
        - scheduled downtime for servers
        - other annoucements
    - Balance all music 
    - Add secondary toolbars on the sides (only shown on drag)
    - Add run stats in gameover screen / leaderboard
    - Test on Slow Computer
- January 1/22-1/28
    - Allow for deleting saves
    - Save files should be sorted by recency
    - Finish Looping
        - (see branch `loop-tint-level`)
    - Make Demo as promised
    - Prepare to ship
        - [Release Demo](https://partner.steamgames.com/doc/store/application/demos)
        - Accessability / Localization Language Support / Spellcheck
        - Establish Minimum System Requirements and update Steam Page
        - Add sentry errors to electron node files
        - Electron Security
            - Since I'm using electron, I should evaluate my dependencies for safety: https://www.electronjs.org/docs/latest/tutorial/security#security-is-everyones-responsibility
            - [Security Recommendations](https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations)
        - Verify Cloud Saves
        - Perks
            - Styling for perks
            - Use relative percentages rather than out of 100%
        - Achievements?
        - Accessability option to make text more readable
    - Final QA
        - Manually test all spells for desync issues (in multiplayer)
        - Test for desyncs on multiplayer
        - Bulletproof Updating and Error Reporting
- January 31 (check timezone)
    - Remove "Beta" Near version number
    - Release
- Other 
    - 2nd algorithm for generating levels
        - see branch 2nd-level-algorithm
    - Features / Content
        - Reroll / exchange cards (risk reward style)
            - like maybe you can reroll but you have one less card to choose from each time
    - [Submit demo to IGN](https://corp.ign.com/submit-a-game)
    - make music play in menu

    
- Add codex where you can read about spells and enemies
---
- Need sound effect for bolt, improve bolt animation, consume, conserve
- Arrow collisions don't work right when used with target_circle first
- Capture soul should kill the enemy and animate a soul coming too you.
- Heat seeking skull with particle effects behind it.  You release it and it seeks out the nearest enemy to deal damage
- early levels are too big, later levels are too small
- fix hover styling for perk reroll button
- single player game overscreen should offer to restart at checkpoint
- **BIG BUG**: If multiple enemies are targeting an ally unit but it dies in the ranged turn the melee units can attack you without intention warning
- music is too soft relative to sfx
- Brad playtest
    - Perk choices: good, UX: bad
        - Instead of "increase emoji cast range" just "+ 5% cast range"; "at the start of" -> "every level"; "temporarily" -> "single-turn"; OR "max stamina" / "overflow stamina"
        - every turn / every level should be presented first
    - blood golem too powerful? shouldn't be able to do kill damage? or introduce later
    - in your perk-picking screen you should be able to see your current perks
    - explain graphic for summoner icon
    - increase all healths and damages by 10x
    - debilitate cheaper and less effective
    - Easy to not grow your max mana, maybe get some by default each level?
    - maybe perks should do concrete amounts instead of %s
    - weird line coming off of units that you pull into liquid on death
    - show how much damage you'll take when you end your turn
    - turn off target snapping when your first spell is a targeting spell for convenience
    - spellbook animation is showing up in singleplayer
        - but you still need it when you yourself are casting multiple at once
    - burst should memorize your position at time of cast, so that if you move after casting it keeps the position that it was when you cast
    - levels can be way too big
    - leaderboard
    -  maybe target circle should makes the spells that come after it tick up in how long they have to restore
    - it is unclear which spells have what cooldowns
    - **important** AOE should have max targets just like "Connect"
    - increase radius for connect and fix faction targeting so it doesn't hit you
    
- Don't remove `quicksave` after death
- starting levels are way too big now
- 80% mana at the start of a level perk is too much

- Cinematic camera should just be a zoom in? or improved
# Validation
- What happens if you pick up a scroll but you have all the spells
- Perks
- balance perks
- Make sure perks everyTurn don't proc after portal has spawned
# Priority
- Ws pie room privacy
- summoner too much health?
- bug: Card copy text overflow
- multi url was saved weird:`http://localhost:3000/?pieUrl=ws%3Alocalhost%3A8080&game=a`
- bug: Getting "host app version doesn't match client version" on SOLOMODE
- bug: if I start a game, quit to main menu, go back to multiplayer I can't edit the server url field, until I alt tab and come back
- What happens if you press multiplayer 'connect' twice while it's still connecting
- bug: vampire stopped moving after being pushed
    - after being pushed hard into a corner
- bug: server freaks out after players leave (when they're dead)
    - somehow got inconsistent maps; one client must've been holding on to an instance
- Make status page for app running headless server so I can tell how many users are connected, etc and historical info
- Protect production branch from unintentional pushes

# To be Triaged
- bug: you can zoom during cinematic
- todo: Bossmasons' casts aren't limited when he's out of mana
- There should be 2-3 spots where no enemies are allowed to spawn,
    - end game maps are too crowded
- src: Make connect sort by same faction first
- bug: clickign to cancel cinematic sometimest clicks on the upgrade accidentally
- fix: tutorial comes up at the same time it asks you to pick a new spell
- animate bloat
- Remove "update" code in golems-menu
- bug: resume last run breaks (i think due to multiplayer)
- bug: Save named "test" doesn't show up in the load list
- bug: I seem to be getting race timeouts for Bloat, Slash, Rend, Rend, Rend
    - on the server it race timeouts animateRend and on the client it race timeout's Push
    - bug: somehow a combination of bload and rend only is causing PUsh to timeout
    - it has something to do with awaiting animateRend
        - even if it resolves immediately
        - it's the last prediction ones that timeout
        - that's because it makes asyc the flow of card.effect and in castCards card.effect gets fullySimulateForceMovePredictions right after it
- Revise confusing "Glass Sniper" copy
- IMPORTANT: The "push" from the bloat explosion seems to be causing a location desync
    - This is because the push happens onDeath event and that's not awaited.
    - To reproduce, queue up a Bloat + slash to kill an enemy with another in the blast radius and end your turn before the spell has finished animating
- bug: loaded from quicksave in multiplayer and got "CAnnot choose upgrade, from player is undefined"
    - This is because save doesn't yet work in multiplayer
- Ghost archer doesn't come closer??
- Make summoner summon units to random places
- poisoner moves too close instead of casting
- Potential issue when both players are alt-tabbed and server restarts, the chrome one got the disconnected message but the other was on the "resume" menu screen and when I resumed it's stuck because it has the old game data but the server restarted (chrome player started a new game of the same name), and so firefox player has old game state and also cannot ready up because they are already in game.
- Retro playthrough:
    - font it too small on cards
    - last will didn't work when he was near water 5:35
    - got 2 spells instead of 1
    - improve the UI
    - rarity label is missing on cards now
    - push push dash combo is weird
    - connect push to self is not obvious what it does, same with connect swap
    - idea for coop: classes so some wizards can specialize
    - bug: music is only coming out of the left ear??
    - "target cone" lock on is an issue when targeting self unintentionally
    - "protection" should work for enemies casters such as poisoner and priestb
# Tasks
- Game is too easy right now, I think due to the perks
- Need something to protect like the towers in into the breach, something to draw you out and make you take risks
- Way to control Ally faction units, like follow me. Or go get them.
- is burst too cheap??
- Don't change music until the biome changes
- fix slow copy "maxStamina"
- Add game log so you can both resume games and see your previous progress
    - Stats: object
    - Duration 
    - Victory
    - Kills
    - Resume?
- Server Browser
- Pushing an enemyh into lava (and they die) then casting connect on them won't connect to other living enemies
- Make magic color and robe color separately customizable
- verify `UI zoom` restored from settings in electron app (due to 63643c06)
- How to visually stack modifiers such as blood_curse and debilitate
    - On hover?
- Invent new loop biomes by colorizing old biome tiles for looping
# Bugs / Cleaning
- bug: miniboss glops targeting radius should be bigger, target column should be able to grab him from closer
- bug: The server restarts immediately and suddenly when on game over.  It should give it some time or else it's suprising
- bug: headless server has a loop where it continually tearsdown and creates a new underworld after the last player leaves
    - log: 
```
teardown: Cleaning up underworld
Setup: Creating new underworld
RNG create with seed: 0.20819712145728242 , state:  true
The number of players has changed, adjusting game difficulty to  0  for  0  connected players.
onData: SYNC_PLAYERS
onData 1 : SYNC_PLAYERS units: 0; players: 0
sync: SYNC_PLAYERS; syncs units and players
sync: Syncing units [] []
sync: Syncing players []
Setup: generateLevelDataSyncronous 0
Setup: generateRandomLevel 0
onData: CREATE_LEVEL 
Setup: createLevelSyncronous
Setup: resetPlayerForNextLevel; reset all players
Cinematic Cam: Finished
Broadcast SET_PHASE:  PlayerTurns
onData: SET_PHASE
onData 2 : CREATE_LEVEL levelIndex: 0; enemies: 3
sync: CREATE_LEVEL: Syncing / Creating level
Setup: createLevelSyncronous
Setup: resetPlayerForNextLevel; reset all players
Cinematic Cam: Finished
Broadcast SET_PHASE:  PlayerTurns
onData: SET_PHASE
onData 3 : SET_PHASE phase: PlayerTurns
sync: SET_PHASE; syncs units and players
sync: Syncing units [ 0, 1, 2 ] [ 3, 4, 5 ]
Units array is out of order with canonical record. A full unit.sync should correct this issue.
Units array is out of order with canonical record. A full unit.sync should correct this issue.
Units array is out of order with canonical record. A full unit.sync should correct this issue.
sync: Syncing players []
initializeTurnPhase( PlayerTurns )
setTurnPhase( PlayerTurns )
syncTurnMessage: phase: PlayerTurns
Host app game over true restarting in 3 seconds
Broadcast SET_PHASE:  Stalled
onData: SET_PHASE
Turn Management: Skipping initializingPlayerTurns, no players connected. Setting turn_phase to "Stalled"        
onData 4 : SET_PHASE phase: PlayerTurns
sync: SET_PHASE; syncs units and players
Phase is already set to PlayerTurns; Aborting SET_PHASE.
onData 5 : SET_PHASE phase: Stalled
sync: SET_PHASE; syncs units and players
sync: Syncing units [ 0, 1, 2 ] [ 0, 1, 2 ]
sync: Syncing players []
initializeTurnPhase( Stalled )
setTurnPhase( Stalled )
```
- IMPORTANT: HOW DOES DIFFICULTY SCALE WITH A TON OF PLAYERS
- IMPORTANT: Fix music only coming out of one channel
    - itshallnotfindme sounds soft in the right ear
- lava abyss color is off
- blood golem / blood archer / green glop / ghost archer / sand vamp explain is a broken image
    - but ghost archer does show up locally
- If an enemy lines up perfectly with another and the direction it's going it can push the enemy.  Try to set up a ranged unit that pushes a melee unit closer and see if the melee unit hits you
- even in singleplayer you can go negative mana if you queue it up while another spell is casting (and you still have the mana from before the current spell takes it)
- bug: by alt-tabbing during enemy turn they didn't move visually.  Then when I came back and ended my turn again they slid to where they would've been had they moved during their turn (without animate walking) and then walked another turn's distance and bit me without warning
- bug: Prediction is wrong for potions dropped by last will because in non prediction is waits a moment before dropping them
- bug: Player on firefox is missing gold circle after death
- bug: when one player went into a portal and the other had already ended their turn and the left over player died from ai (portal was spawned via admin menu), it correctly went to the next level but it generated 2 levels (skipping right to level 3)
- pieUrl is stored wrong in browser search bar so if you copy it after connecting it'd double encoded
- res markers don't show if the unit is alive but will be killed and then resurrected
- **critical** vamp miniboss got stuck where he has stamina and a path (with no points), but wont move; i think it's because i summoned an archer and the archer was part way in liquid but didn't show it and so he didn't have a path to the archer
- Fix: should not broadcast latency warning for a message that failsc with a rejected promise
- archer still had freeze modifier listed in tooltip even after the freeze disappeared naturally on the next turn
    - freeze is behaving weird in Russell's playtest, it's not ticking down as it should
        - maybe it has to do with it being triggered off of chain? he also had bloat on
- **critical** miniboss vampire was able to move without playing walking animation during the ranged unit turn phase and then continue walking on his own
- **important** push + radius*2 + connect + damage isn't damaging the connected units (note, the pushed unit ends up in lava)
    - This is because the unit died when it fell in the lava so connect didn't connect it to other living units
- sync issue: golem moving through frozen guys jumped back
- (m) You're able to cast into negative mana in multiplayer
- "All targets" copy is confusing if player doesn't understand targeting
- Find a way to make randomness fixed (like in spell "Displace" so that it doesn't get different random results on other people's screens and so that it wont change after another player casts)
- This save file is giving me critical errors `saveFile-with-errors.json`
- (h) Sometimes it tries to path around things and wastes stamina if there isn't a straight line path
- (h) sometimes when you walk you get stuck on a wall and it wastes stamina
- (h) bug: In multiplayer: target similar, damage x3 on 2 draggers made their position go to null null
- h: bug: saw +0 mana when he tried to mana steal from me; desync bug; i moved when he cast.
    - this is a race condition because I'm still able to move freely after his cast triggers
- Multiplayer: other players can't spawn in while another player is casing a spell
    - same thing with casts, it waits
- futher investigate '  // Override ref since in prediction it makes a copy of the unit' from 06d754d2
- Turn phase testing:
    - if one player is portaled and the remaining player dies it should go to the next level
    - if no players are portaled and all players die and there are no ally npcs it should go to game over
    - if no players are portaled and all players die and there ARE npc allies it should run turn phases for NPCS
        - if NPC_ALLYs succeed it should go to next level
        - if NPC_Allys do not it should go to end game
- investigate: `// TODO will the stack just keep growing`
    - turn_phases should work on a queue not a stack (this is mostly relevant for singleplayer and when the NPCs are just hashing it out cause all the players are dead so it doesn't stack overflow)
    - Just make it a while loop that triggers/awaits the next AI turn until it's the players tuurn

# Localization
- All tooltip info
- Spell descriptions
- Explain prompts - see stash "add i18n to explain prompts"
- i18n: Press 'z' to make camera follow you
# Features
- should allow spell prediction even while an action is taking place - this not being here causes friction in multiplayer
## Prediction issues
- prediction should factor in standing on pickups
    - this can be reproduced by standing on health pot and queuing up just enough slash spells to kill you and triggering it.  You will see that it predicts that you will die but you don't because as soon as you first take damage the health pot triggers
# Content
- Make Youtube short audio louder
# Optimization
- Optimize: targeting spells seem pretty slow in prediction
- optimize: Ihave duplicate units, pickups, and doodads in save due to serailizeForSaving having them in the underworld and extracting them to the top level too

## Stretch Content
- Magic arrow spell (travels out of range, like ghost arrow)
    - idea: trigger the spell on line segment intersection (throw the spell)
- Make "Destroy  Corpse" spell which will be useful for dealing with priests
- Trap Soul / Capture: Instantly traps an enemy's soul in your possesion removing them from the board.  When you release their soul they are restored to their last form but on your faction.  Requires low health to work.
- Mind Control: Changes the faction of an enemy
- **contender** Content: "Orge" enemies that get stronger for every ally of theirs that dies
- **contender** Idea: A spell to sacrifice ally unit immediately
- **contender** destroy a corpse for mana
- **contender** grow a barrier
- **contender** Feature: "Soul bind" - bound units share applied effects (or maybe just damage)
- **contender** set fires on board that spreads that does damage on turn start if you're standing near
- Spell: "Target Nearby" - Like what stomp used to be
---
- juice: ultra badass spell should put in wide-screen black bars and take over the camera
    - and he could crouch and gather enegery
- unlimited range (also target yourself)
- Idea: "oh shit button": double the amount of mana you have this level but it reduces by half next level. " Break glass in case of emergency. Deal with the devil
- Idea: Amplify spell: makes "multicast"
- Add `cooldown` to spells rather than expense scaling
    - Add a spell that resets cooldowns
    - Add a curse that increases cooldowns
- h: "Heat seeking" enemy or spell
- idea: spell that triggers onDeath effects "Playdead"
- Liquid: blood could apply a curse when you fall in, like slowed movement
- thought: Spellmasons should have some element of risk/reward like 50% chance to double damage of next spell or something like that.  Think of my experience with slice and dice where I got a dice side that did 24 damage and affected the guy below.  If you could always have that it's no fun, too easy but because you can only sometimes get it when you're lucky is what makes it exciting.
    - also one-use spells could work well
- confuse spell
- what attributes of a spell could be modified by other cards?
    - already: targets, quantity
    - new: radius, amount
- perk: long range cast only
- perk: Swap your max health and max mana
- Idea: "overwatch" where some archers can shoot even not on their turn if you walk in their LOS
- Content: Time crystal releases something when it breaks
- An enemy that consumes allies to get stronger
- idea; one use bargains (deals with the devil) that mix up your max stats.  or have a50% chance of good or bad outcome
- Card: An attack range minimum but not a maximum so you CAN"T attack if they are too close
- enemy that debuffs blessings
- "heat seaking" missle unit, explodes on contact
- Card: Mind Control (changes faction temporarily)
- A spell that saves 40% of your current mana for next turn (added to spreadsheet)
- A spell where you can save some of your health, mana, stamina in a potion
- What if monsters that go through portal come to next level with you, but you don't get more mana after the portal spawns
- totems
- auras
- ricotche
- task: Spell to trade mana for stamina
- eagle eye
- Tornado: Travells through the map throwing things around (maybe a good enemy ability)
    - Or just spells that travel in the direction you send them
- A way to "sell spells to get to choose a new one"
- Jake boss ideas:
```
Necromancer supreme. Conjura a bunch of guys to fight but is very fragile himself
Think of the spider boss from Bloodborne
A guy who wields a magical sword that can do ranged slices with it. Somewhat tankier I think. Maybe weak to electric stuff
A mimic! A copy of you. Has your spells and such
Dunno how well that'd work lol
Gotta be a dragon
Big slime? Keeps splitting into smaller slimes
Maybe the final boss could be something ambiguous? Like "The Final Spell"
And it's just ball of energy that can do weird stuff
```
- Russell Boss idea:
```
hrm, ok here's a WILD idea. how about a non-moving boss that has a number of "tentacles" or some other non-moving bits around the map that you have to take care of before you can hit the boss?
say like stationary spawning towers that spawn a dude every few turns
i feel like a good final boss will bring a new mechanic to the game
or maybe the separate tendrils give the boss different abilities each turn like self-casting heal or protection, having additional damage, having additional cast range, multi-attack, etc 
so "hey let's kill the 'heal' tendril first!" "no! we have to get rid of the summon ones before we're overrun!"
and i still like the idea of some spell cards or upgrade cards being "locked" until you achieve something in a run to unlock them
i'm thinking of mechanics from like Slay the Spire here
did you have a spell book from the main menu to show all available spells?
also not related but it would be nice to be able to click enemies during the "pick your starting spot" time for when you can't remember the difference between a poisoner and a puller or the different archers
but overall a boss with multiple "stages" or "parts" would be cool
```
- Boss:
    - maybe the boss could have multiple phases
    - Russell: A good boss introduces a new mechanic
    - Maybe casts whatever spells you cast back at you? Jakes idea

## Multiplayer Enhancements / issues
- if you choose a spawn position while another player is casting it waits and then spawns where you clicked, which can be confusing because it still looks like you can choose where to spawn
- if you can MOVE_PLAYER while a super long cast is being triggered.
    - you cannot, find a way to handle this for multiplayer so it's communicated that you have to wait to cast until someone else has finished casting
    - IMPORTANT: Change the store description:  `Spellmasons uses innovative faction-based turns: You and your fellow mages can all move, cast and act simultaneously.` if needed
- If player joins mid enemy movement it will force reset them
    - this is still an issue: as of 2022-09-16
## Misc
- **critical** Improve sending castCards with targeting based on id not position
- Unit movement desync occurred between clients when one client has CPU throttled, the non throttled client has the unit move much farther
# Stretch Tasks
- Achievements
- Mods
- Make pickups do something when destroyed
    - Refactor arrow.ts to use getPotentialTargets instead of just underworld.units and unitsPrediction or else it will never strike pickups
- Server config by host (pvp, worms armageddon style customizations)
- Pushing units into portal should do something
- Protection should be able to be cast on dead units to keep priest from resurrecting them
- [Mod support](https://partner.steamgames.com/doc/features/workshop)
- Server customization (like Worms Armageddon)
    - Turn time
    - Pvp mode (more factions)
- Perks | "upgrades" with some random attributes | The more dimentions you add the better!
    - % chance to get more stamina on level start
    - % chance to start level with mob on your faction
    - % chance that casting wont consume mana
    - % chance to freeze on damage
    - one time: 50/50 chance to incrase max stat or decrease it
    - make 1 random spell permanently more expensive and another permanently cheaper
    - Skill tree
    - Critical chances
    - Time challenges - beat the level in less than 3 turns
    - Make wagers - risk / reward
        - even with the difficulty of the next level
    - pseudo class system
    - item that makes your stronger but it randomizes your spawn