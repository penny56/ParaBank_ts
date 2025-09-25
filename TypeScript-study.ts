/*
https://www.youtube.com/watch?v=pDaZAk1hjZ8&list=PLFGoYjJG_fqrRjl9Mn0asiAIxmKC1X-N-&index=4
1. open browser (chrome)
2. open page
3. enter url: https://naveenautomationlabs.com/opencart/index.php?route=account/login
4. create 3 locators: username, password, loginbutton
5. enter username
6. enter password
7. click on login button
8. get the home page title
9. verify the title
10. take teh screenshot
11. close browser 
*/


import {test, expect, Browser, Page, Locator, BrowserContext} from '@playwright/test'
import { count, countReset } from 'console';
import {webkit, chromium, firefox} from 'playwright'
import path from 'path'

/*
test.use({
    actionTimeout: 10000
}); */

test('Auto wait Check', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    // 修改 timeout 时间，从默认30s，改为15s
    // page.setDefaultTimeout(15000)

    await page.goto("https://classic.freecrm.com/register/");

    // 故意改错，以验证是否15s就timeout，而不是默认的30s
    // await page.locator("input[name='agreeTerms11']").check();

    // 如果我只想改这个操作的timeout时间
    await page.locator("input[name='agreeTerms11']").check({timeout: 5000});

});


test('Focus Element Test', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    await page.goto("https://www.orangehrm.com/30-day-free-trial/");

    const username = page.locator("#Form_getForm_Name");
    username.focus()

    page.waitForTimeout(3000)
});


test('File Upload', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    // 1. single file upload
    await page.goto("https://cgi-lib.berkeley.edu/ex/fup.html");

    // <input type="file" name="upfile">
    await page.locator("input[name='upfile']").setInputFiles("D:\\IBM\\Playwright\\PWS\\package.json");

    await page.waitForTimeout(2000)

    // 2. de-select file upload
    await page.locator("input[name='upfile']").setInputFiles([]);
    await page.waitForTimeout(2000)

    // 3. multiple files upload
    await page.goto("https://davidwalsh.name/demo/multiple-file-upload.php");

    // <input type="file" name="filesToUpload" id="filesToUpload" multiple="" onchange="if (!window.__cfRLUnblockHandlers) return false; makeFileList();">
    // 这里有属性：multiple ，就说明支持 upload multiple files

    await page.locator("input[name='filesToUpload']").setInputFiles([path.join("D:\\IBM\\Playwright\\PWS\\package.json"), path.join("D:\\IBM\\Playwright\\PWS\\package-lock.json")]);

    await page.waitForTimeout(2000)

    // 4. 下面是 de-selection，就是直接把 setInputFiles的参数设成 []
    await page.locator("input[name='filesToUpload']").setInputFiles([]);    


    // 5. upload file from buffer memory


    await page.waitForTimeout(5000)
});


test('Type characters sequentially', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    await page.goto("https://www.flipkart.com");

    await page.locator('css=input[placeholder="Search for Products, Brands and More"]').pressSequentially('macbook', {delay: 500})



    await page.waitForTimeout(10000)
});

test('drag and drop', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    await page.goto("https://jqueryui.com/resources/demos/droppable/default.html");

    // single action: 打开之后，2个就在一起了
    // await page.locator('text=Drag me to my target').dragTo(page.locator('text=Drop here'))

    // mulitiple commands: 模拟鼠标动作
    await page.locator('#draggable').hover()
    await page.mouse.down();
    await page.locator('#droppable').hover()
    await page.mouse.up();

    await page.waitForTimeout(3000)
});


test('mouse click event', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    await page.goto("https://demo.guru99.com/test/simple_context_menu.html")

    // 1. doubld click
    // 显示了一下 JavaScript Alert
    /*
    <button ondblclick="myFunction()">Double-Click Me To See Alert</button>
    <script>
    function myFunction() {
    alert("You double clicked me.. Thank You..");    
    }
    </script>   */
    await page.getByText('Double-Click Me To See Alert').dblclick();

    // 2. right click
    await page.getByText('right click me').click({button: 'right'});
    await expect(page.getByText('Quit')).toBeVisible();

    // 3. shift click
    await page.goto('https://the-internet.herokuapp.com/shifting_content')

    await page.getByText('Example 1: Menu Element').click({modifiers: ['Shift']});



    await page.waitForTimeout(10000)
})


test('mouse hover', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    await page.goto("https://www.spicejet.com")

    // <div class="css-76zvg2 r-jwli3a r-ubezar r-16dba41 r-1pzd9i8" dir="auto" style="font-family: inherit;">Add-ons</div>
    // page.getByTestId()

    // 如果不止1个，双引号表示 exact match
    // await page.locator('text="Add-ons"').hover()

    // 或者加上 .first()，表示只要第1个match到的
    await page.getByText('Add-ons').first().hover()
    // 在hover()出现的二级菜单上，点击Taxi
    await page.getByText('Taxi').first().click()

    await page.waitForTimeout(10000)
})


test('Select based Drop Down test', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage();

    /*
        <select class="form-control valid" data-val="true" data-val-maxlength="Maximum character length is 5." data-val-maxlength-max="5" id="Contact_CountryCode" name="Contact.CountryCode" aria-describedby="Contact_CountryCode-error" aria-invalid="false"><option value="AF">Afghanistan</option>
        <option value="AX">Aland Islands</option>
        <option value="DZ">Algeria</option>
        ...
        </select>    */


    await page.goto("https://www.magupdate.co.uk/magazine-subscription/phrr")

    // 注意：这个 contoryDropDown 是一个 CSS selector，而不是一个locator
    // 在 GUI 上就是一个下拉控件 
    const countoryDropDown = 'select#Contact_CountryCode';
    
    // 在这个下拉框里，选择 <option value="DZ"> 这一项。
    await page.selectOption(countoryDropDown, { value: 'AD' })
    // 或者不从value选择，我要从text选择，也可以
    await page.selectOption(countoryDropDown, { label: 'Australia'})
    // 还可以通过index
    await page.selectOption(countoryDropDown, {index: 5})


    // $  意思是：我需要选择一个 element
    // $$ 意思是：match这个 selector的所有elements
    // > option  是子代selector
    const allOptions = await page.$$(countoryDropDown + ' > option');
    console.log(allOptions.length)

    for (const e of allOptions) {
        const text = await e.textContent();
        console.log(text);
        if (text === 'India') {
            await page.selectOption(countoryDropDown, { label: 'India'})
            break;
        }
    }

    await page.waitForTimeout(3000)
})


test('chaining selectors test', async({page}) => {
    await page.goto("https://www.orangehrm.com/30-day-free-trial/")
    // await page.locator('form#Form_getForm >> #Form_getForm_Name').fill('firstname')
    // await page.locator('form#Form_getForm >> text=Get Your Free Trial').click()

    // 还有另一种方式
    const form = page.locator('form#Form_getForm')
    const getYourFreeTrialButtton = page.getByRole('button', {name: 'Get Your Free Trial'});
    // 假如现在有多个这种button，但是我特指，在这个form里的button
    await form.locator(getYourFreeTrialButtton).click();

    await page.waitForTimeout(3000)
})

test('No incognito test', async({}) => {

    // run the browser in NOT incognito mode
    // 把当前session信息保存到 ./session 目录下（可选，可留空）
    const browser = await chromium.launchPersistentContext('./session', {headless: false, channel: 'chrome'});

    // 你当然可以new一个page，但是在 persistent mode下，会自带一个 blank page的（有时2个）
    // 所以试试这里不新建，用自带的。
    // const page = await browser.newPage();
    const page = browser.pages()[0]
    await page.goto("https://naveenautomationlabs.com/opencart/index.php?route=account/register")
})


test('locator test', async({})=>{

    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const page = await browser.newPage()
    await page.goto("https://naveenautomationlabs.com/opencart/index.php?route=account/register")

    // create a web element (locator) + perform action on it (click / fill)
    
    // 1. id: unique
    // <input type="text" name="firstname" value="" placeholder="First Name" id="input-firstname" class="form-control">
    const firstName = page.locator('id=input-firstname');
    const lastName = page.locator('id=input-lastname');

    await firstName.fill("Trunk")
    await lastName.fill("David")


    // 2. class name
    // <img src="https://naveenautomationlabs.com/opencart/image/catalog/opencart-logo.png" title="naveenopencart" alt="naveenopencart" class="img-responsive">
    const logo = page.locator('.img-responsive')
    const logoExist = await logo.isEnabled();
    console.log(logoExist)


    // 3. text 
    // 可以是一个header
    // <h1>Register Account</h1>
    const header = page.locator('text=Register Account')
    const headerExist = await header.isEnabled()
    console.log(headerExist)

    // 也可以是一个按钮，这里面的value值，就是显示在按钮上的值
    // <input type="submit" value="Continue" class="btn btn-primary">
    const continueButton = page.locator('text=Continue')
    const continueButtonExist = await continueButton.isEnabled()
    console.log(continueButtonExist)

    // 还可是是一个超链接
    // <a href="https://naveenautomationlabs.com/opencart/index.php?route=account/forgotten" class="list-group-item">Forgotten Password</a>
    const forgetPwdLink = page.locator('text=Forgotten Password')
    const forgetPwdLinkExist = await forgetPwdLink.isEnabled()
    console.log(headerExist)


    // 4. CSS 
    // <input type="email" name="email" value="" placeholder="E-Mail" id="input-email" class="form-control">
    const email = page.locator('css=input#input-email');

    // <input type="tel" name="telephone" value="" placeholder="Telephone" id="input-telephone" class="form-control">
    const telephone = page.locator('css=input[placeholder="Telephone"]')
    // 或
    // const telephone = page.locator('css=input[name="telephone"]')

    // <input type="checkbox" name="agree" value="1">
    const privacyCheckBox = page.locator('css=input[name="agree"]')
    // 或
    // const privacyCheckBox = page.locator('css=input[type="checkbox"]')

    await email.fill("anyone@163.com");
    await telephone.fill("12345456767");
    await privacyCheckBox.check();


    // 5. xpath DOM中的element地址
    // <input type="password" name="password" value="" placeholder="Password" id="input-password" class="form-control">
    const password = page.locator('xpath=//input[@id="input-password"]')
    // <input type="password" name="confirm" value="" placeholder="Password Confirm" id="input-confirm" class="form-control">
    const passwordConfirm = page.locator('xpath=//input[@id="input-confirm"]')

    // <input type="text" name="search" value="" placeholder="Search" class="form-control input-lg">
    const search = page.locator('xpath=//input[@name="search" and @type="text"]')

    await password.fill("12345678")
    await passwordConfirm.fill("12345678")
    await search.fill("macbook")


    // 7. getByRole()
    // <h1>Register Account</h1>
    // getByRole() 方法的第1个参数在填写的时候有提示。
    await expect(page.getByRole('heading', {name: 'Register Account'})).toBeVisible();

    // <a href="https://naveenautomationlabs.com/opencart/index.php?route=account/forgotten" class="list-group-item">Forgotten Password</a>
    await expect(page.getByRole('link', {name: 'Forgotten Password'})).toBeVisible();

    /* <label class="radio-inline">
        <input type="radio" name="newsletter" value="1">
        Yes</label> */
    await expect(page.getByRole('radio', {name: 'Yes'})).toBeVisible();
    await page.getByRole('radio', {name: 'Yes'}).click();

    // <input type="checkbox" name="agree" value="1">
    // 如果下面这样写是不对的，因为它要text，但是agree不是text，这里也没有text可以用：
    // await expect(page.getByRole('checkbox', {name: 'agree'})).toBeVisible();

    // 但是我们发现，这个page只有1个checkbox，我们用这个特点来select，把第2个参数留空。
    await expect(page.getByRole('checkbox')).toBeVisible();
    await page.getByRole('checkbox').check();


    // <input type="submit" value="Continue" class="btn btn-primary">
    await expect(page.getByRole('button', {name: 'Continue'})).toBeVisible();
    await page.getByRole('button', {name: 'Continue'}).click();

    await page.waitForTimeout(10000)
});


test('auth test', async() => {
    const browser = await chromium.launch({headless: false, channel: 'chrome'});
    const context = await browser.newContext();
    const page = await context.newPage();

    // 直接给 admin/admin 到 URL 里。但是通常不这样用，因为password放URL里不安全
    // await page.goto("https://admin:admin@the-internet.herokuapp.com/basic_auth");

    const username = 'admin';
    const password = 'admin';
    const authHeader = 'Basic ' + btoa(username + ':' + password);

    // headers 里加入这个针对authorization的 key/value 对 
    await page.setExtraHTTPHeaders({Authorization : authHeader})
    await page.goto("https://the-internet.herokuapp.com/basic_auth");

    await page.pause()
});

test('context', async()=>{
    const browser = await chromium.launch({headless: false, channel: 'chrome'});

    // browsercontext1
    const browserContext1: BrowserContext = await browser.newContext();
    const page1: Page = await browserContext1.newPage();

    // browsercontext2
    // 注意，这里与 1 是相同的 browser
    const browserContext2: BrowserContext = await browser.newContext();
    const page2: Page = await browserContext2.newPage();
    // browser1
    await page1.goto("https://naveenautomationlabs.com/opencart/index.php?route=account/login")
    const emailID1: Locator = page1.locator('#input-email');
    const password1: Locator = page1.locator('#input-password');
    const loginButton1: Locator = page1.locator("[value='Login']");

    await emailID1.fill("abc@163.com");
    await password1.fill("abcd");
    await loginButton1.click();

    // browser2
    await page2.goto("https://naveenautomationlabs.com/opencart/index.php?route=account/login")
    const emailID2: Locator = page2.locator('#input-email');
    const password2: Locator = page2.locator('#input-password');
    const loginButton2: Locator = page2.locator("[value='Login']");

    await emailID2.fill("def@163.com");
    await password2.fill("defg");
    await loginButton2.click();

    await browserContext1.close()
    await browserContext2.close()

    await browser.close()
}) 

test('login test', async({page})=>{

    // 我们使用的 browser 是 @playwright/test 的 browser，如果要改 headless，需要在 playwright.config.ts中改
    // const browser = await chromium.launch({headless: false});

    await page.goto("https://naveenautomationlabs.com/opencart/index.php?route=account/login")
    await expect(page).toHaveTitle(/Account Login/);

    // locate the email field
    const emailId = page.locator('#input-email');
    const password = page.locator('#input-password');
    
    // <input type="submit" value="Login" class="btn btn-primary">
    // 这个button，即没有id，也没有 name，就用 CSS 中的 value 吧
    //const loginButton = page.locator("[value='Login']");
    const loginButton = page.getByRole('button', { name: 'Login' })
    //const loginButton = page.getByRole


    await emailId.fill("abc@163.com");
    await password.fill("abcd");
    await loginButton.click();

    const title = await page.title()
    console.log("home page's title is ", title)

    await page.screenshot({path: 'homepage.png'})
    expect(title).toEqual('My Account')

    // 我们使用的 browser 是 @playwright/test 的 browser，会自动清理，无需手动close。
    // await browser.close()
});
