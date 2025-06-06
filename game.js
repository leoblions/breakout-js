import { Player } from './player.js'
import { Brickgrid } from './brickgrid.js'
import { Input } from './input.js'

import { Collision } from './collision.js'
import { Hud } from './hud.js'
import { Ball } from './ball.js'

import { Rastertext } from './rastertext.js'
// import { Menu } from './menu.js'
//import { Splat } from './splat.js'
//import { Pickup } from './pickup.js'
import { Sound } from './sound.js'

import * as Utils from './utils.js'
import * as Assets from './assets.js'
;('use strict')

const msPerTick = 30 / 1000
const tileSize = 10
export const TILESIZE = 100
const NO_SCROLL = true
const TPS_COUNTER_INTERVAL_SEC = 5
const FRAME_PERIOD_MS = Math.floor(1000 / 60)
const START_HEALTH = 100
const START_LIVES = 3

const screenWidth = 640
const screenHeight = 480
const centerTextX = screenWidth / 2 - 50
const centerTextY = screenHeight / 2 - 50

const PLAYER_HEIGHT = 30
const PLAYER_WIDTH = 100
const TOP_TEXT_X_OFFSET = 25
const CENTER_TEXT_INDEX = 3
const CENTER_TEXT_HANG = 3000
const CENTER_TEXT_OFFSET_X = -50
const titleFontSize = 20
const fontSize = 24
const startBallX = 250
const startBallY = 300
const ballInitVelX = 2
const ballInitVelY = 2
const TPS = 60

let board
let boardWidth = 600
let boardHeight = 500
let context //used for drawing on canvas

export let game

export class Game {
  #mode = 0
  static difficulty = 5
  static godmode = false
  static noclip = false
  static volume = 5
  // immutable "enum" of game modes
  static modes = Object.freeze({
    PLAY: 0,
    MAINMENU: 1,
    OPTIONS: 2,
    PAUSED: 3,
    TITLE: 4,
    HELP: 5
  })
  constructor () {
    this.stage = 0
    this.cameraX = 0
    this.cameraY = 0
    this.tileSize = TILESIZE
    this.player = null
    this.hud = null
    this.brickgrid = null
    this.editor = null
    this.input = null
    this.entity = null
    this.projectile = null
    this.pathfind = null
    this.brain = null
    this.puckup = null
    this.collision = null
    this.splat = null
    this.ctx = null
    this.decor = null
    this.menu = null
    this.sound = null
    this.game = null
    this.dialog = null
    this.ball = null
    this.mode = () => {
      while (true) {}
    }
    this.rastertext = null
    this.playerheight = 15
    this.screenWidth = 70
    this.screenHeight = boardHeight
    this.screenWidth = boardWidth
    this.score = 0
    this.health = START_HEALTH
    this.level = 0
    this.stamina = START_HEALTH
    this.topTextPositionsX = []
    this.topText = []
    this.showCenterText = false
    // this.objectiveTotal = 0
    // this.objectiveComplete = 0

    this.pstartY = this.screenHeight - PLAYER_HEIGHT * 2
    this.pstartX =
      Math.floor(this.screenWidth / 2) - Math.floor(PLAYER_WIDTH / 2)
    this.screenHeight = boardHeight
    this.screenWidth = boardWidth

    this.score = 0
    this.lives = START_LIVES
    this.level = 1
    this.mode = 0
  }
  requestStateChange (newState) {
    if (this.stateChangePacer()) {
      this.#mode = newState
    }
  }

  showCenterTextTemporarily () {
    game.rastertext.units[CENTER_TEXT_INDEX].active = true
    setTimeout(() => {
      game.rastertext.units[CENTER_TEXT_INDEX].active = false
    }, CENTER_TEXT_HANG)
  }

  lostLife () {
    game.centerTextString = game.centerTextStrings[1]
    game.rastertext.updateUnitText(game.centerTextString, CENTER_TEXT_INDEX)
    game.rastertext.units[CENTER_TEXT_INDEX].active = true
    setTimeout(() => {
      game.rastertext.units[CENTER_TEXT_INDEX].active = false
    }, CENTER_TEXT_HANG)
  }
  gameOver () {
    game.centerTextString = game.centerTextStrings[3]
    game.brickgrid.killAllBricks()
    game.rastertext.updateUnitText(game.centerTextString, CENTER_TEXT_INDEX)
    game.rastertext.units[CENTER_TEXT_INDEX].active = true
    setTimeout(() => {
      game.rastertext.units[CENTER_TEXT_INDEX].active = false
      game.brickgrid.reset()
    }, 6000)
    game.lives = START_LIVES
    game.score = 0
  }

  getMode () {
    return this.#mode
  }

  initRasterTextUnits () {
    this.topTextPrefixes = ['Level ', 'Lives ', 'Score ']
    this.topText = ['Level ', 'Lives ', 'Score ']

    let quarter = Math.floor(this.board.width / 3)
    for (let i = 0; i < 3; i++) {
      this.topTextPositionsX[i] = i * quarter + TOP_TEXT_X_OFFSET
      this.rastertext.addUnit(
        this.topTextPositionsX[i],
        TOP_TEXT_X_OFFSET,
        this.topTextPrefixes[i]
      )
    }
    this.centerTextStrings = [
      'New game',
      'lost ball',
      'next level',
      'game over'
    ]
    this.centerTextString = 'New game'
    this.topTextPositionsX[CENTER_TEXT_INDEX] =
      Math.floor(this.board.width / 2) + CENTER_TEXT_OFFSET_X
    this.rastertext.addUnit(
      this.topTextPositionsX[CENTER_TEXT_INDEX],
      Math.floor(this.board.height / 2),
      this.centerTextString
    )
  }

  newGame () {
    this.centerTextString = this.centerTextStrings[0]
    this.showCenterTextTemporarily()
  }

  updateRasterTextUnits () {
    this.topText[0] = 'Level ' + this.level
    this.topText[1] = 'Lives ' + this.lives

    this.topText[2] = 'Score ' + this.score

    for (let i = 0; i < 3; i++) {
      this.rastertext.updateUnitText(this.topText[i], i)
    }
  }

  keyModeSelector1 () {
    let keys = this?.input.keys
    if (keys == undefined) {
      return
    }

    if (keys['Escape'] == true) {
      if (this.game.mode == Game.modes.PLAY) {
        this.game.requestStateChange(Game.modes.MAINMENU)
      } else if (this.game.mode == Game.modes.MAINMENU) {
        this.game.requestStateChange(Game.modes.PLAY)
      } else if (this.game.mode == Game.modes.PAUSED) {
        this.game.requestStateChange(Game.modes.PLAY)
      }
    }
    if (keys['p'] == true) {
      if (this.game.mode == Game.modes.PLAY) {
        this.game.requestStateChange(Game.modes.PAUSED)
      } else if (this.game.mode == Game.modes.PAUSED) {
        this.game.requestStateChange(Game.modes.PLAY)
      }
    }
  }

  levelComplete () {
    game.centerTextString = game.centerTextStrings[2]
    game.rastertext.updateUnitText(game.centerTextString, CENTER_TEXT_INDEX)
    game.rastertext.units[CENTER_TEXT_INDEX].active = true
    setTimeout(() => {
      game.rastertext.units[CENTER_TEXT_INDEX].active = false
      game.ball.visible = true
      game.brickgrid.reset()
      game.ball.reset()
    }, 3000)

    this.mode = 1

    let nextLevel = this.level + 1
    if (nextLevel > this.level) {
      this.level += 1
    }
    //this.level += 1
    let oneMoreLife = this.lives + 1
    if (oneMoreLife > this.lives) {
      this.lives += 1
      //this.livesStrinthis.stringContent = `Lives: ${this.lives}`
    }
  }
}

//board

window.onload = function () {
  game = new Game()
  board = document.getElementById('board')
  // disable scrollbar
  const [body] = document.getElementsByTagName('body')
  if (NO_SCROLL) {
    body.setAttribute('style', 'overflow:hidden')
  }

  game.board = board
  board.height = boardHeight
  board.width = boardWidth
  context = board.getContext('2d')
  game.ctx = context

  Assets.loadAssets(() => {
    game.player = new Player(game, game.pstartX, game.pstartY)
    game.ball = new Ball(
      game,
      startBallX,
      startBallY,
      ballInitVelX,
      ballInitVelY
    )
    game.input = new Input(game)
    game.collision = new Collision(game)
    game.brickgrid = new Brickgrid(game)
    // game.decor = new Decor(game)
    // game.brain = new Brain(game)
    // game.projectile = new Projectile(game)
    // game.editor = new Editor(game)

    // game.entity = new Entity(game)
    // game.splat = new Splat(game)
    game.rastertext = new Rastertext(game, 1)
    game.initRasterTextUnits()
    // game.menu = new Menu(game)
    // game.pickup = new Pickup(game)
    // game.dialog = new Dialog(game, 1)
    // game.sound = new Sound(this)
    // game.pathfind = new Pathfind(game)
    // game.hud = new Hud(game)
    // game.trigger = new Trigger(game)
    game.boardWidth = boardWidth
    game.boardHeight = boardHeight
    game.tickCount = 0
    game.displayTPS = 0
    game.counterPacer = Utils.createMillisecondPacer(1000)
    game.framePacer = Utils.createMillisecondPacer(FRAME_PERIOD_MS)
    game.stateChangePacer = new Utils.createMillisecondPacer(1000)
    game.textChangePacer = new Utils.createMillisecondPacer(1000)

    requestAnimationFrame(draw)
    let uinterval = setInterval(update, msPerTick)
    board.click()
    game.showCenterTextTemporarily()
    game.newGame()
  })
}

function update () {
  game.input.update()

  let currMode = game.getMode()
  if (currMode == Game.modes.PLAY) {
    if (game.textChangePacer()) {
      game.updateRasterTextUnits()
    }
    game.player.update()
    game.ball.update()
    // game.brain.update()
    game.brickgrid.update()
    // game.projectile.update()
    // game.entity.update()
    // game.pathfind.update()
    // game.editor.update()
    // game.hud.update()
    // game.decor.update()

    game.rastertext.update()
    // game.dialothis.update()
    // game.splat.update()
    // game.pickup.update()
    // game.trigger.update()
  } else {
    game.menu.update()
  }

  game.tickCount += 1
  if (game.counterPacer()) {
    // Math.floor(game.tickCount / (TPS_COUNTER_INTERVAL_SEC*1000))
    game.displayTPS = game.tickCount
    game.tickCount = 0
  }
  // if (this.showCenterText) {
  //   game.rastertext.units[CENTER_TEXT_INDEX].active = true
  // } else {
  //   game.rastertext.units[CENTER_TEXT_INDEX].active = false
  // }
}

function draw () {
  // draw loop can run as fast as browser wants

  requestAnimationFrame(draw)
  if (game.framePacer()) {
    context.clearRect(0, 0, board.width, board.height) // clear previous frame
    let currMode = game.getMode()
    if (currMode == Game.modes.PLAY) {
      game.brickgrid.draw()
      game.ball.draw()
      // game.decor.draw()
      // game.projectile.draw()
      // game.splat.draw()
      // game.pickup.draw()
      // game.menu.draw()
      game.player.draw()
      // game.pathfind.draw()
      // game.trigger.draw()
      // game.entity.draw()
      //top
      // game.dialothis.draw()
      // game.hud.draw()

      game.rastertext.draw()
    } else {
      game.menu.draw()
    }
  }
}
