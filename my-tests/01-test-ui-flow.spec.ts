import {test, expect} from '@playwright/test'
import fs from 'fs'
import path from 'path'

let username: string = ""
let password: string = "password"
let oldCountNumber: string = "00000"
let newCountNumber: string = "00000"

const amount: string = '1'

test.beforeEach(async({ page }, testInfo) => {

    await page.goto("https://parabank.parasoft.com/")
    await expect(page).toHaveTitle(/ParaBank/);

    console.log('> Start to run - ', testInfo.title)
});

test.afterEach(async({ page}, testInfo) => {
    console.log('= End of - ', testInfo.title)
});

test.describe('No session', () => {

    test('1. open Para bank home page', async({ page })=>{

        await expect(page).toHaveURL(/.*index\.htm/);

    });


    test('2. create a new user', async({ page })=>{

        // click register
        await page.getByRole('link', {name: 'Register'}).click()

        // 注意，这里不是 isVisible()，toBeVisible()是专用的断言检查
        await expect(page.getByRole('heading', {name: 'Signing up is easy!'})).toBeVisible();

        // fill in the blanks
        await page.locator('#customer\\.firstName').fill("Jim")
        await page.locator('#customer\\.lastName').fill("Rossi")
        await page.locator('#customer\\.address\\.street').fill("Jiancaicheng")
        await page.locator('#customer\\.address\\.city').fill("Beijing")
        await page.locator('#customer\\.address\\.state').fill("Beijing")
        await page.locator('#customer\\.address\\.zipCode').fill("100000")
        await page.locator('#customer\\.phoneNumber').fill("156-11420639")
        await page.locator('#customer\\.ssn').fill("00000000")
        username = "user-"+Math.floor(Math.random() * 90000).toString()
        await page.locator('#customer\\.username').fill(username)
        await page.locator('#customer\\.password').fill(password)
        await page.locator('#repeatedPassword').fill("password")

        await page.getByRole('button', {name: 'Register'}).click()
        await expect(page.getByRole('heading', {name: /Welcome/})).toBeVisible()

        console.log(`username = ${username}, password = ${password}`)


        // logout
        await page.getByRole('link', {name: 'Log Out'}).click()
    });


    test('3. Log in', async({ page })=>{

        if (username === "") {
            throw new Error('User name is Null, register first!');
        }

        const context = page.context()

        await page.goto("https://parabank.parasoft.com/")
        await expect(page).toHaveTitle(/ParaBank/);

        // <input type="text" class="input" name="username"> 不能用 getByRole() 方法，因为这里的 name 不是 ARIA
        // await page.getByRole('textbox', {name: 'username'}).fill(username)
        // await page.getByRole('textbox', {name: 'password'}).fill(password)
        await page.locator('css=input[name="username"]').fill(username)
        await page.locator('css=input[name="password"]').fill(password)
        console.log(`login username: ${username}, login password: ${password}`)

        await page.getByRole('button', {name: 'Log In'}).click()
        await expect(page.getByRole('heading', {name: 'Accounts Overview'})).toBeVisible()
        
        // save session to state.json in root/ directory
        await context.storageState({path: './state.json'})
    });

});


test.describe('With session', () => {

    // use the session information while login
    test.use({ storageState: './state.json'});

    test('4. very global navigation manual', async({ page }) => {

        // chaining selector
        await page.locator('#headerPanel').getByRole('link', {name: 'About Us'}).click()
        await expect(page).toHaveTitle("ParaBank | About Us");
        await page.goBack()

        await page.locator('#headerPanel').getByRole('link', {name: 'Services'}).click()
        await expect(page).toHaveTitle("ParaBank | Services");
        await page.goBack()

        await page.locator('#headerPanel').getByRole('link', {name: 'Products'}).click()
        await expect(page).toHaveTitle("Automated Software Testing Tools - Ensure Quality - Parasoft");
        await page.goBack()

        await page.locator('#headerPanel').getByRole('link', {name: 'Locations'}).click()
        await expect(page).toHaveTitle("Automated Software Testing Solutions For Every Testing Need");
        await page.goBack()

        await page.locator('#headerPanel').getByRole('link', {name: 'Admin Page'}).click()
        await expect(page).toHaveTitle("ParaBank | Administration");
        await page.goBack()
    })


    test('5. get old account number', async({ page }) => {

        await page.getByRole('link', {name: "Accounts Overview"}).click()

        await expect(page.getByRole('heading', {name: "Accounts Overview"})).toBeVisible()
        
        // 表体第一行（注意 nth(1)，因为 nth(0) 是表头）
        const firstRow = page.getByRole('row').nth(1);
        // 第一列 cell
        const firstCell = firstRow.getByRole('cell').nth(0);
        // cell 内的 link
        const accountLink = firstCell.getByRole('link');
        // 取 link 文字（账号），兼容 null
        oldCountNumber = (await accountLink.textContent()) ?? '';
        if (oldCountNumber === '') {
            throw new Error("Can't get the old account number, terminated!");
        }

        console.log(`old account number is: ${oldCountNumber}`)
    });

    test('6. create a new account', async({ page}) => {
        await page.getByRole('link', {name: 'Open New Account'}).click()

        /*
        <select id="type" class="input">
          <option value="0">CHECKING</option>
          <option value="1">SAVINGS</option>
        </select> */

        // 注意：这里不可用 getByRole()，因为没有“可访问名称”
        // await page.getByRole('combobox', {name: 'type'}).selectOption({label: 'SAVINGS'})

        const typeDropDown = 'select#type';
        await page.selectOption(typeDropDown, { label: 'SAVINGS'})

        const accountDropDown = 'select#fromAccountId'
        await page.selectOption(accountDropDown, {label: oldCountNumber})

        await page.getByRole('button', {name: 'Open New Account'}).click()

        await expect(page.getByRole('heading', {name: 'Account Opened!'})).toBeVisible()

        newCountNumber = await page.locator('#newAccountId').textContent() ?? ''
        if (newCountNumber === '') {
            throw new Error("Can't get the new account number, terminated!");
        }

        console.log(`new account number is ${newCountNumber}`)

    });

    test("7. verify the new account's balance", async({ page }) => {

        await page.getByRole('link', {name: 'Accounts Overview'}).click()
        await expect(page.getByRole('heading', {name: 'Accounts Overview'})).toBeVisible()
        
        // page.locator('#accountTable tbody tr td:first-child a')
        // 是用 css selector定位到 #accountTable 中每一行的第一列内的 <a> 元素

        const newAccountLink = page.locator('#accountTable tbody tr td:first-child a', { hasText: newCountNumber });
        await expect(newAccountLink).toBeVisible();

    });

    test("8. Transfer funds", async({ page }) => {

        // 这里有点特殊，有多个' transfer Funds'，所以要使用 chaining selector
        await page.locator('div#leftPanel').getByRole('link', {name: 'Transfer Funds'}).click()
        await expect(page.getByRole('heading', {name: 'Transfer Funds'})).toBeVisible()

        await page.locator('#amount').fill(amount)

        const fromDropDown = 'select#fromAccountId';
        await page.selectOption(fromDropDown, {label: newCountNumber})

        const toDropDown = 'select#toAccountId'
        await page.selectOption(toDropDown, {label: oldCountNumber})

        await page.getByRole('button', {name: 'Transfer'}).click()

        console.log(`Transfer 1 dollor from ${newCountNumber} to ${oldCountNumber}`)

    });

    test("9. Pay the bill", async({ page }) => {

        await page.locator('div#leftPanel').getByRole('link', {name: 'bill pay'}).click()
        await page.locator('css=input[name="payee\\.name"]').fill('Jim Rossi')
        await page.locator('css=input[name="payee\\.address\\.street"]').fill('Jiancaicheng')
        await page.locator('css=input[name="payee\\.address\\.city"]').fill('Beijing')
        await page.locator('css=input[name="payee\\.address\\.state"]').fill('Beijing')
        await page.locator('css=input[name="payee\\.address\\.zipCode"]').fill('100000')
        await page.locator('css=input[name="payee\\.phoneNumber"]').fill('15611001100')
        await page.locator('css=input[name="payee\\.accountNumber"]').fill(oldCountNumber)
        await page.locator('css=input[name="verifyAccount"]').fill(oldCountNumber)
        await page.locator('css=input[name="amount"]').fill(amount)
        
        const fromDropDown = 'css=select[name="fromAccountId"]';
        await page.selectOption(fromDropDown, {label: newCountNumber})

        await page.getByRole('button', {name: 'Send Payment'}).click()

        // write to transaction.json
        const transactionData = { newCountNumber, amount }
        const filePath = path.resolve(__dirname, '../transaction.json')

        fs.writeFileSync(filePath, JSON.stringify(transactionData, null, 2), 'utf-8')
        console.log(`Write to file: ${transactionData}`)
    });
});
