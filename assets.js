import * as Utils from './utils.js'
import * as Imageutils from './imageutils.js'

// BRICK BREAKER SPRITES
export var ballImg, brickImages, playerImg
export var fontBigImg, fontSmallImg

//ensure assets are loaded before other classes try using them

export async function loadAssets (callbackFunction) {
  //ball
  let ballImgSrc = './images/ballsA.png'
  ballImg = await getImageData(ballImgSrc)
  ballImg = await Imageutils.cutSpriteSheetAsync(ballImg, 4, 4, 100, 100)
  //bricks
  let brickImagesSrc = './images/rectangular_buttons.png'
  brickImages = await getImageData(brickImagesSrc)
  brickImages = await Imageutils.cutSpriteSheetAsync(
    brickImages,
    4,
    4,
    150,
    100
  )
  //player
  let playerImgSrc = './images/paddles_300_50.png'
  playerImg = await getImageData(playerImgSrc)
  playerImg = await Imageutils.cutSpriteSheetAsync(playerImg, 2, 6, 300, 50)

  //big letters
  let fontBigSrc = './images/fontBig.png'
  fontBigImg = await getImageData(fontBigSrc)
  fontBigImg = await Imageutils.cutSpriteSheetAsync(fontBigImg, 40, 1, 50, 50)

  let fontSmallsrc = './images/fontSmall.png'
  fontSmallImg = await getImageData(fontSmallsrc)
  fontSmallImg = await Imageutils.cutSpriteSheetAsync(
    fontSmallImg,
    40,
    1,
    10,
    10
  )

  callbackFunction()
}

export async function loadAssetsOld (callbackFn) {
  {
    let menuBtnSrc = './images/buttonsD.png'
    let menuBtnPromise = getImageData(menuBtnSrc)

    let shinyBtnSrc = './images/shiny_buttons.png'
    let shinyBtnPromise = getImageData(shinyBtnSrc)

    let dialogSrc = './images/dialogbox1.png'
    let dialogSheet = await getImageData(dialogSrc)

    let bugsASrc = './images/bugsheet0.png'
    let bugsAPromise = Imageutils.mirrorAndAppendimageArrayFromURL(bugsASrc)

    let managerSrc = './images/alfred.png'
    let managerSheet = await getImageData(managerSrc)

    let elliotSrc = './images/elliot2.png'
    let elliotSheet = await getImageData(elliotSrc)

    let markerSrc = './images/marker.png'
    let markerSheet = await getImageData(markerSrc)

    let titleSrc = './images/maggot mart title.png'
    titleImg = await getImageData(titleSrc)

    managerImg = await Imageutils.cutSpriteSheetAsync(
      managerSheet,
      4,
      4,
      100,
      200
    )
    elliotImg = await Imageutils.cutSpriteSheetAsync(
      elliotSheet,
      4,
      4,
      100,
      200
    )

    dialogImg = await Imageutils.cutSpriteSheetAsync(
      dialogSheet,
      2,
      4,
      250,
      150
    )

    markerImg = await Imageutils.cutSpriteSheetAsync(markerSheet, 6, 1, 100, 99)

    callbackFn()
  }
}

async function getImageData (imageURL) {
  return new Promise((resolve, reject) => {
    let sheet = new Image()
    sheet.onload = () => resolve(sheet)
    sheet.onerror = reject

    sheet.src = imageURL
  })
}
