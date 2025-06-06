import * as Assets from './assets.js'
import * as Utils from './utils.js'

const defaultSpeed = 5
const playerHeight = 30
const playerWidth = 100
let xMax = 0

export class Player {
  constructor (game, startX, startY) {
    this.game = game
    this.images = Assets.playerImg
    this.image = this.images[0]
    this.screenX = startX
    this.screenY = startY
    this.visible = true
    this.frozen = false
    xMax = this.game.board.width - playerWidth
  }

  getColliderRect () {
    return new Utils.Rect(this.screenX, this.screenY, playerWidth, playerHeight)
  }

  midpointX () {
    return [this.screenX + Math.floor(playerWidth / 2)]
  }

  draw () {
    if (this.visible) {
      this.game.ctx.drawImage(
        this.image,
        this.screenX,
        this.screenY,
        playerWidth,
        playerHeight
      )
    }
  }

  update () {
    let dflags = this.game.input.dflags
    if (dflags.up && !dflags.down) {
      this.velY = -defaultSpeed
    } else if (!dflags.up && dflags.down) {
      this.velY = defaultSpeed
    } else {
      this.velY = 0
    }

    if (dflags.left && !dflags.right) {
      this.velX = -defaultSpeed
    } else if (!dflags.left && dflags.right) {
      this.velX = defaultSpeed
    } else {
      this.velX = 0
    }

    this.game.input.resetDflags()
    if (!this.frozen) {
      this.screenX += this.velX
    }

    this.screenX = Utils.clamp(0, xMax, this.screenX)
    //this.screenY += this.velY
    if (this.game.ball.followPaddle) {
      let ballNextPosition = this.screenX - 50
      if (ballNextPosition > 0) {
        this.game.ball.screenX = ballNextPosition
      }
    }
  }
}
