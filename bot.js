var webdriver = require('selenium-webdriver'),
 by = webdriver.By,
 Promise = require('promise'),
 settings = require('./settings.json');
var log4js = require('log4js'); 
log4js.loadAppender('file');

log4js.addAppender(log4js.appenders.file('bot.log'), 'instabot');
var logger = log4js.getLogger('instabot');
logger.setLevel('DEBUG');

var xpathFirstPhoto = '//*/article/div/div/div/div[1]/a';
var xpathLikeClass =  '/html/body/div[3]/div[2]/div/article/div[2]/section[1]/span[1]/button/span';
var xpathLikeButton = '/html/body/div[3]/div[2]/div/article/div[2]/section[1]/span[1]/button';
var xpathNextButton = '/html/body/div[3]/div[1]/div/div/a';
var xpathLoginButton = '//*[@id="react-root"]/section/main/div/article/div/div[1]/div/form/div[4]/button';
var browser = new webdriver
.Builder()
.withCapabilities(webdriver.Capabilities.firefox())
.build();

browser.manage().window().setSize(1024, 700);
randomInteger = function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
    } 
browser.sleep(randomInteger(3000, 8000));

browser.get('https://www.instagram.com/accounts/login/');
browser.sleep(randomInteger(3000, 8000));
browser.findElement(by.name('username')).sendKeys(settings.botLogin);
browser.findElement(by.name('password')).sendKeys(settings.botPass);
browser.sleep(randomInteger(3000, 8000));
browser.findElement(by.xpath(xpathLoginButton)).click();
browser.sleep(randomInteger(15000, 20000)).then(function() {
    accountSearch(0);
});
    logger.info('Logged in ' + settings.botLogin + '!');
    browser.sleep(randomInteger(3000, 8000));
function accountSearch(indexNickname){
    if (indexNickname >= settings.accauntsForLikes.length){
        logger.info('All done!');
        browser.quit();
        return;
    }
    browser.sleep(randomInteger(3000, 8000));
    var promise = new Promise(function(resolve, reject) {
        logger.warn('doing likes for:' + settings.accauntsForLikes[indexNickname]);
        browser.get('https://www.instagram.com/' + settings.accauntsForLikes[indexNickname]);
        browser.sleep(randomInteger(3000, 8000));
        browser.findElement(by.xpath(xpathFirstPhoto))
            .then(elem => elem.click().then(function(){
                like(resolve, 0, settings.likesPerUser);
            }))
            .catch(err => {
                logger.error("I'm not");
                reject();
            });
    });
    browser.sleep(randomInteger(3000, 8000));
promise.then(function(){
    indexNickname++;
    accountSearch(indexNickname);
}).catch(function(){
    indexNickname++;
    accountSearch(indexNickname);
});
};
function like(resolve, index, max_likes) {
    browser.getCurrentUrl().then(function(url){
        logger.debug('Current url:   ' + url);
        browser.sleep(randomInteger(3000, 8000));
        browser.findElement(by.xpath(xpathLikeClass)).getAttribute('class').then(function(classname) {
            logger.debug('CSS Classname: ' + classname);
            browser.sleep(randomInteger(3000, 8000));
           if ((classname.indexOf('glyphsSpriteHeart__filled__24__red_5 u-__7') >= 0)) {
               logger.info('Already liked. Stopping...');
               browser.sleep(randomInteger(3000, 8000));
               resolve();
               return;
           } else {
               if (classname.indexOf('glyphsSpriteHeart__outline__24__grey_9 u-__7') >= 0) {
                browser.sleep(randomInteger(3000, 8000));
                browser.findElement(by.xpath(xpathLikeButton)).click();
                browser.sleep(randomInteger(3000, 8000));
               };
               browser.findElements(by.xpath(xpathNextButton)).then(function(buttons) {
                logger.debug('Buttons: ' + buttons.length + ', Photo Index: ' + index);
                browser.sleep(randomInteger(3000, 8000));
                   if (((index == 0) && (buttons.length == 1)) || (buttons.length == 2)) {
                       buttons[buttons.length - 1].click().then(function() {
                           browser.sleep(randomInteger(3000, 8000));
                           index++;
                           if (index == max_likes) {
                               resolve();
                               return;
                           }
                           like(resolve, index, max_likes);
                       });
                   } else {
                       logger.info('Next button does not exist. Stopping...');
                       resolve();
                       return;
                   }
               });
           }
       });
   });
}
