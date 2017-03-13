import Prrrs from './Prrrs'
import catImageSrc from './images/favicon.ico'
import state from './state'

state.subscribe(state => {
  const prrrs = new Prrrs({
    currentUser: state.session.user,
    prrrs: state.prrrs,
  })
  const claimedPrrr = prrrs.claimed()
  if (claimedPrrr){
    renderCurrentlyReviewing()
  }else{
    renderPendingCountFavicon(prrrs.pending().length)
  }
})

const renderCurrentlyReviewing = (deadline) => {
  renderFavicon('R')
}

const renderPendingCountFavicon = (numberOfPendingPrrrs) => {
  renderFavicon(numberOfPendingPrrrs)
}

const renderFavicon = (text) => {
  loadCatImage(catImage => {
    let canvas = document.createElement('canvas')
    canvas.width = canvas.height = 16
    const canvas2D = canvas.getContext('2d')
    canvas2D.drawImage(catImage, 0, 0)
    renderText(canvas2D, text, 'white')
    const linkEl = document.getElementsByClassName('favicon')[0]
    linkEl.href = canvas2D.canvas.toDataURL()
  })
}

const catImage = new Image
catImage.src = catImageSrc
const loadCatImage = (callback) => {
  if (catImage.complete){
    callback(catImage)
  }else{
    catImage.onload = function(){
      callback(catImage)
    }
  }
}

const renderText = (canvas2D, text, color) => {
  text = text.toString()
  const length = text.length
  canvas2D.fillStyle = color
  canvas2D.textAlign = 'center'
  if ( length < 2 ) {
    canvas2D.font = '12px sans-serif'
    canvas2D.fillText(text, 8, 13.5)
  } else if ( length < 3 ) {
    canvas2D.font = '10px sans-serif'
    canvas2D.fillText(text, 8, 13)
  } else {
    canvas2D.font = '8px sans-serif'
    canvas2D.fillText(text, 8, 12)
  }
}

