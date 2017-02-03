import webdriver from 'selenium-webdriver'
import path from 'path'
import fs from 'fs'

const ARTIFACTS_PATH = path.resolve(__dirname, '../../tmp/artifacts')
const PORT = 3781

const { By, until } = webdriver
export { By, until }

const withServer = function(done){
  this.serverInstance = server.start(PORT, done)
}

const Browser = function(){
  const browser = new webdriver.Builder()
    .forBrowser('chrome')
    .build()

  browser.visit = function(path){
    return this.get(`http://localhost:${PORT}${path}`)
  }

  browser.saveScreenshot = function(){
    return this.takeScreenshot()
      .then(function(image, error) {
        const fileName = path.resolve(ARTIFACTS_PATH, `screenshot-${new Date().valueOf()}.png`)
        fs.writeFile(fileName, image, 'base64', function(error){
          if(error) throw error
        })
      })
    }

  browser.getLogs = function(){
    return this.manage().logs().get('browser')
      .then(logs => console.log('Browser Logs:', logs))
  }

  browser.loginAs = function(githubId) {
    return this.visit(`/__login/${githubId}`)
    .then(session => {
      const body = this.findElement(By.css('body'), 2000)
      return this.wait(
        until.elementTextContains(body, `logged in as ${githubId}`),
        5000
      )
    })
  }

  browser.closeTabs = function(){
    return this.getAllWindowHandles()
      .then(handles => {
        handles.forEach((handle, index) => {
          if (index === 0) return
          this.switchTo().window(handle)
          this.close()
        })
        this.switchTo().window(handles[0])
      })
  }


  browser.shouldSeeWithin = function(text, element, timeout=2000){
    return this.wait(until.elementTextContains(this.findElement(element), text), timeout)
      .catch(error => {
        throw new Error(`expected ${element} to contain text: ${JSON.stringify(text)}`)
      })
  }

  browser.shouldSee = function(text, timeout){
    return this.shouldSeeWithin(text, By.css('body'), timeout)
  }

  browser.shouldNotSee = function(text, timeout){
    return this.shouldNotSeeWithin(text, By.css('body'), timeout)
  }

  browser.shouldNotSeeWithin = function(text, element, timeout=2000){
    const fail = () => {
      throw new Error(`expected NOT to see ${JSON.stringify(text)} within ${element}`)
    }
    if (timeout <= 0) fail()
    const start = new Date
    return this.wait(until.elementTextContains(this.findElement(element), text), timeout)
      .catch(error => {
        if (error.message.includes('Waiting until element text contains')) return false
        throw error
      })
      .then(webElement => {
        if (!webElement) return; // not found, were good.
        const duration = new Date - start
        if (duration > timeout) fail()
        return this.sleep(100)
          .then(_ => this.shouldNotSeeWithin(text, element, timeout - duration - 100))
      })
  }

  browser.getWindowUrls = function(){
    return this.getAllWindowHandles().then(windows => {
      const urls = windows.map(windowHandle => {
        this.switchTo().window(windowHandle)
        return this.getCurrentUrl()
      })
      return Promise.all(urls)
    })
  }

  browser.shouldSeePopupAt = function(url, timeout=2000){
    if (timeout <= 0) throw new Error(`failed to find popup at ${url}`)
    return this.getWindowUrls()
      .then(urls => {
        if (urls.includes(url)) return true;
        return this.sleep(100)
          .then(_ => this.shouldSeePopupAt(url, timeout-100))
      })
  }

  browser.clickOn = function(text){
    const paths = [
      `self::button[contains(.,'${text}')]`,
      `self::input[@value='${text}']`,
      `self::a[(contains(.,'${text}')) and (@href)]`
    ]
    return this.wait(
      until.elementLocated(
        By.xpath(`//*[${paths.join(' or ')}]`)
      ), 2000
    ).click()
  }

  browser.archiveMyRequestedPrrr = function(pullRequestText, element){
    return this.wait(until.elementLocated(element))
      .then(table => table.findElement(By.xpath(`//tr[contains(.,'${pullRequestText}')]`)))
      .then(tr => tr.findElement(By.className('ArchivePrrrButton')))
      .then(archivePrrrButton => archivePrrrButton.click())
  }

  browser.insertPullRequestAddress = function(pullRequestText, element){
    return this.wait(until.elementLocated(element), 2000).sendKeys(pullRequestText)
    .then(_ => this.sleep(100))
      .catch(error => {
        throw new Error(`failed to inject pull request address ${pullRequestText} because: ${error.message}`)
      })
  }

  browser.shouldSeeElement = function(element){
    return this.wait(until.elementLocated(element))
      .catch(error => {
        throw new Error(`expected to see ${element} on the page but it was not found`)
      })
  }

  browser.toggleTableVisibility = function(tableTitle){
    return this.wait(
      until.elementLocated(
        By.xpath(`//*[self::button[ancestor::h1[contains(.,'${tableTitle}')]]]`)
      ), 2000
    ).click()
  }

  return browser
}


export const usingSelenium = function(callback){
  context('usingSelenium', () => {
    beforeEach(setupSelenium)
    afterEach(tearDownSelenium)
    callback()
  })
}


const setupSelenium = function(done) {
  this.browsers = []
  this.createBrowser = function(position){
    const browser = Browser()
    if (position === 'right') browser.manage().window().setPosition(550, 0)
    browser.manage().window().setSize(1600, 1200)
    this.browsers.push(browser)
    return browser
  }
  this.waitForAllBrowsers = () => {
    const promises = this.browsers.map(browser =>
    browser.then(x => x)
  )
    return Promise.all(this.browsers)
  }
  withServer.call(this, _ => done())
}

const tearDownSelenium = function(done) {
  if (this.browsers) this.browsers.forEach(browser => browser.quit())
  if (this.serverInstance) this.serverInstance.close(done)
}
