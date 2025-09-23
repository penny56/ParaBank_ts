// 这里 'test as base'，是因为要用 test.extend 定义夹具，返回一个新的test对象
// 在 export const test = base.extend<MyFixtures>({...}) 这里返回的就是扩展过夹具的版本了。
// 总之，这里用 as 重命名，即保留了原始版本 base；又有了夹具版本 test。
import { test as base, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://parabank.parasoft.com/parabank/services/bank'

// 定义夹具
type MyFixtures = {
    transactionData: { newCountNumber: string; amount: string }
};

export const test = base.extend<MyFixtures>({
    transactionData: async ({}, use) => {
        const jsonPath = path.resolve(__dirname, '../transaction.json')
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
        await use(data)
    },
})

// keep login status
test.use({
    storageState: path.resolve(__dirname, '../state.json')
})

// 这里的 request，就已经绑定了 storageState 的 APIRequestContext
// 可以通过 { request: api} 进行重命名，但是不能直接用别的名字，fixture的名字是固定的。
test('find transaction by amount', async({ transactionData, request }) => {
    const accountId = transactionData.newCountNumber
    const amount = transactionData.amount
    const url = `${BASE_URL}/accounts/${accountId}/transactions/amount/${amount}`

    const response = await request.get(
        url, 
        {headers: {'Accept': 'application/json',}, }
    )

    console.log("response: ", response)
    expect(response.ok()).toBeTruthy()
    const transactions = await response.json()

    console.log("transactions: ", transactions)

    // 返回的不为空，且至少有1条
    expect(transactions).not.toBeNull()
    expect(transactions.length).toBeGreaterThan(0)

    const matched = transactions.some(
        (t: any) => String(t.amount) === String(amount) && String(t.accountId) === String(accountId)
    )

    expect(matched).toBeTruthy()

    console.log('find transaction by amount testing: completed!')


});