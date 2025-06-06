import * as Assets from './assets.js'
import * as Utils from './utils.js'

const brickHeight = 30
let brickWidth = 100
const gridStartX = 22
const gridStartY = 50
const bricksX = 6
const bricksY = 6
const sideBorder = 25
const bricksTotal = bricksX * bricksY
const brickTintMixLimit = true
const brickTintMixLimitAmount = 0x55
let nil = null

// var hexColors = []color.RGBA{
// 	{0xff, 0xff, 0xff, 0x3f},
// 	{0xff, 0xff, 0x0, 0x3f},
// 	{0xff, 0x0, 0xff, 0x3f},
// 	{0xff, 0x0, 0x0, 0x3f},
// 	{0x0, 0xff, 0xff, 0x3f},
// 	{0x0, 0xff, 0x0, 0x3f},
// 	{0x0, 0x0, 0xff, 0x3f},
// 	{0x0, 0x0, 0x0, 0x3f},
// }

export class Brickgrid {
  constructor (game) {
    this.game = game

    this.images = Assets.brickImages
    this.image = Assets.brickImages[0]
    brickWidth = Math.floor((this.game.board.width - 2 * sideBorder) / bricksX)
    this.selectRandomRowColors()

    this.createBricks()
  }

  selectRandomRowColors () {
    this.rowColors = []
    for (let y = 0; y < bricksY; y++) {
      let newvalue = Math.floor(Math.random() * 16)
      this.rowColors.push(newvalue)
    }
  }

  getColliderRect () {
    return Utils.Rect(this.screenX, this.screenY, playerWidth, playerHeight)
  }

  midpointX () {
    return this.screenX + Math.floor(playerWidth / 2)
  }

  reset () {
    for (let brick of this.brickGrid) {
      this.won = false
      brick.active = true
    }
  }

  checkPlayerWon () {
    let activeBricks = 0
    for (let v of this.brickGrid) {
      if (v.active) {
        activeBricks += 1
      }
    }
    return activeBricks == 0
  }

  killAllBricks () {
    for (let v of this.brickGrid) {
      v.active = false
    }
  }

  createBricks () {
    // returns an array of bricks

    let bricksArray = []
    let arrIterator = 0
    for (let y = 0; y < bricksY; y++) {
      for (let x = 0; x < bricksX; x++) {
        let screenX = x * brickWidth + gridStartX
        let screenY = y * brickHeight + gridStartY
        bricksArray[arrIterator] = new Brick(x, y, screenX, screenY)
        arrIterator += 1
      }
    }
    this.brickGrid = bricksArray
  }

  draw () {
    for (let brick of this.brickGrid) {
      if (brick != null && brick.active) {
        let index = this.rowColors[brick.y]

        let image = this.images[index] ?? this.image
        this.game.ctx.drawImage(
          image,
          brick.screenX,
          brick.screenY,
          brickWidth,
          brickHeight
        )
      }
    }
  }

  bounceBallOffBrick (brick) {
    let [midPointBallX, midPointBallY] = this.game.ball.midpoint()
    let [midPointBrickX, midPointBrickY] = brick.midpoint()
    if (midPointBallX > midPointBrickX) {
      this.game.ball.velX = Math.abs(this.game.ball.velX)
    } else if (midPointBallX < midPointBrickX) {
      this.game.ball.velX = -Math.abs(this.game.ball.velX)
    }

    if (midPointBallY > midPointBrickY) {
      this.game.ball.velY = Math.abs(this.game.ball.velY)
    } else if (midPointBallY < midPointBrickY) {
      this.game.ball.velY = -Math.abs(this.game.ball.velY)
    }
  }

  updateScore (brick) {
    let points = 1 + bricksY - brick.y
    this.game.score += points
  }

  update () {
    //fmt.Println(this.game.levelCompleteScreenActive)
    if (!this.won && this.checkPlayerWon()) {
      this.won = true
      this.game.ball.stop()
      this.game.levelComplete()
    }

    let ballRect = this.game.ball.getColliderRect()
    for (let brick of this.brickGrid) {
      if (brick != nil && brick.active) {
        let brickRect = new Utils.Rect(
          brick.screenX,
          brick.screenY,
          brickWidth,
          brickHeight
        )

        if (Utils.collideRect(brickRect, ballRect)) {
          brick.active = false
          //fmt.Println("Collide ", iter)
          this.bounceBallOffBrick(brick)
          this.updateScore(brick)
        }
      }
    }
  }
}

class Brick {
  constructor (x, y, screenX, screenY) {
    this.x = x
    this.y = y
    this.screenX = screenX
    this.screenY = screenY
    this.active = true
  }
  midpointX () {
    return this.screenX + brickWidth / 2
  }

  midpoint () {
    return [
      this.screenX + Math.floor(brickWidth / 2),
      this.screenY + Math.floor(brickHeight / 2)
    ]
  }
}
