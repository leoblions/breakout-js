import * as Assets from './assets.js'
import * as Utils from './utils.js'

const defaultSpeedBall = 2
const lowSpeedBall = 1
const ballHeight = 30
const ballWidth = 30
const ballInitVelX = 2
const ballInitVelY = 2
const startBallX = 250
const startBallY = 300
let xMaxBall = 0

export class Ball {
  constructor (game, startX, startY, velX, velY) {
    this.game = game

    this.images = Assets.ballImg
    this.image = this.images[0]

    this.screenX = startX
    this.screenY = startY
    this.velX = velX
    this.velY = velY
    this.stopped = true
    this.frozen = true
    this.visible = true
    this.followPaddle = true
    xMaxBall = this.game.board.width - ballWidth
  }

  getColliderRect () {
    return new Utils.Rect(this.screenX, this.screenY, ballWidth, ballHeight)
  }

  midpoint () {
    return [
      this.screenX + Math.floor(ballWidth / 2),
      this.screenY + Math.floor(ballHeight / 2)
    ]
  }

  reset () {
    this.velX = ballInitVelX
    this.velY = ballInitVelY
    this.stopped = true
    this.screenX = startBallX
    this.screenY = startBallY
    this.visible = true
    this.followPaddle = true
  }

  stop () {
    this.velX = 0
    this.velY = 0
    this.stopped = true
  }
  draw () {
    if (this.visible) {
      this.game.ctx.drawImage(
        this.image,
        this.screenX,
        this.screenY,
        ballWidth,
        ballHeight
      )
    }
  }
  ballPlayerCollision () {
    let playerColl = this.game.player.getColliderRect()
    let ballColl = this.getColliderRect()
    return Utils.collideRect(playerColl, ballColl)
  }

  outOfBounds () {
    if (this.screenY + ballHeight > this.game.screenHeight) {
      return true
    } else {
      return false
    }
  }

  serve () {
    this.stopped = false
    this.frozen = false
    this.followPaddle = false
    this.velX = ballInitVelX
    this.velY = ballInitVelY
  }

  update () {
    if (this.screenX < 0 || this.screenX > xMaxBall) {
      this.velX *= -1
    }
    if (this.screenY < 0) {
      this.velY *= -1
    }

    if (this.ballPlayerCollision() && this.screenY < this.game.player.screenY) {
      this.velY = -Math.abs(this.velY)
      this.velX = -Math.abs(this.velX)

      let playerMidpoint = this.game.player.midpointX()
      let [ballMPX] = this.game.ball.midpoint()
      var speed = 0
      if (Math.abs(ballMPX - playerMidpoint) < ballWidth) {
        speed = lowSpeedBall
      } else {
        speed = defaultSpeedBall
      }
      let [mpx] = this.midpoint()
      if (mpx > playerMidpoint) {
        this.velX = Math.abs(speed)
      } else {
        this.velX = -Math.abs(speed)
      }
    }
    if (!this.stopped && !this.frozen) {
      this.screenX += this.velX
      this.screenY += this.velY
    }

    if (this.outOfBounds()) {
      this.reset()
      this.game.lives -= 1
      if (this.game.lives < 0) {
        this.game.lives = 0
        this.game.gameOver()
      } else {
        this.game.lostLife()
      }

      //this.game.livesString.stringContent = `Lives: ${this.game.lives}`
    }

    //this.screenY += this.velY
  }
}
